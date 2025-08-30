import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('otp', hashedOtp)
    .order('expiry', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  const record = data[0];

  if (new Date(record.expiry) < new Date()) {
    return res.status(400).json({ error: 'OTP has expired' });
  }

  await supabase.from('otps').delete().eq('id', record.id);

  res.json({ success: true, message: 'OTP verified' });
}
