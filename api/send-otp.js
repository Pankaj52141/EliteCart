import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

function logError(context, error) {
  // Vercel logs will show console.error
  console.error(`[SEND-OTP] ${context}:`, error);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { email } = req.body;
    if (!email) {
      logError('Missing email in request body', req.body);
      return res.status(400).json({ error: 'Email is required.' });
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      logError('Invalid email format', email);
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Rate limit check: prevent resending within 60 seconds
    let recentOtp = [];
    try {
      const { data, error } = await supabase
        .from('otps')
        .select('created_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      recentOtp = data || [];
    } catch (fetchError) {
      logError('Supabase fetch recent OTP error', fetchError);
      return res.status(500).json({ error: 'Server error. Please try again later.' });
    }

    if (recentOtp.length > 0) {
      const lastSent = new Date(recentOtp[0].created_at);
      if (Date.now() - lastSent.getTime() < 60 * 1000) {
        logError('Rate limit hit for email', email);
        return res.status(429).json({ error: 'Please wait before requesting another OTP.' });
      }
    }

    const otp = generateOtp();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    try {
      const { error: insertError } = await supabase
        .from('otps')
        .insert([{ email, otp: hashedOtp, expiry }]);
      if (insertError) throw insertError;
    } catch (err) {
      logError('Supabase insert OTP error', err);
      return res.status(500).json({ error: 'Failed to store OTP. Please try again.' });
    }

    try {
      await sendOtpEmail(email, otp);
      res.json({ success: true, message: 'OTP sent. Please check your inbox and spam folder.' });
    } catch (err) {
      logError('Nodemailer send OTP error', err);
      res.status(500).json({ error: 'Failed to send OTP email. Please check your email address and try again.' });
    }
  } catch (err) {
    logError('General handler error', err);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
