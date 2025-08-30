import crypto from 'crypto';
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  try {
    const docRef = db.collection('otps').doc(email);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    const record = docSnap.data();
    if (record.otp !== hashedOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (Date.now() > record.expiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }
    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }

  res.json({ success: true, message: 'OTP verified' });
}
