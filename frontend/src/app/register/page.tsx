'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuthStore } from '@/lib/store/authStore';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fullName || !email || !password || !phone) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Make sure phone number includes country code.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          // @ts-ignore
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
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      // Send token and user details to our backend
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const data = await registerUser(fullName, email, password, formattedPhone, idToken);
      setAuth(data.user, data.token);
      
      router.push('/shop'); // redirect on success
    } catch (err: any) {
      setError(err.message || 'Invalid OTP or Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md my-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-neutral-500">Join FutureCloth today</p>
        </div>

        <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!showOtpInput ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Phone Number (with Country Code)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Enter 6-digit OTP</label>
              <input
                type="text"
                required
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
            {loading ? 'Please wait...' : (showOtpInput ? 'Verify OTP & Register' : 'Send OTP')}
          </button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
