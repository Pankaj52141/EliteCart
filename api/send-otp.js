import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
if (!global._firebaseApp) {
  global._firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}
const db = getFirestore();

function logError(context, error) {
  console.error(`[SEND-OTP] ${context}:`, error);
}

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

      const otp = generateOtp();
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      const expiry = Date.now() + 5 * 60 * 1000;
      try {
        // Store OTP in Firestore
        await db.collection('otps').doc(email).set({
          email,
          otp: hashedOtp,
          expiry,
        });
      } catch (err) {
        logError('Firestore store OTP error', err);
        return res.status(500).json({ error: 'Failed to store OTP.' });
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
