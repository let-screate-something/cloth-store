'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { firebaseLogin } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize recaptcha verifier
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    
    try {
      setLoading(true);
      const appVerifier = window.recaptchaVerifier;
      // Format phone number, ensure it has country code e.g., +1
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      // Reset recaptcha on error so user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || !confirmationResult) {
      setError('Please enter the OTP');
      return;
    }
    
    try {
      setLoading(true);
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      
      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      
      // Send token to our backend to get our custom JWT and create User in DB
      const data = await firebaseLogin(idToken);
      setAuth(data.user, data.token);
      
      router.push('/shop'); // redirect on success
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-neutral-500">Sign in to your FutureCloth account</p>
        </div>

        <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!showOtpInput ? (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">
                Phone Number (with Country Code)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-300 mb-2">
                Enter 6-digit OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                maxLength={6}
              />
            </div>
          )}

          <div id="recaptcha-container"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Please wait...' : (showOtpInput ? 'Verify OTP & Login' : 'Send OTP')}
          </button>
        </form>
      </div>
    </div>
  );
}
