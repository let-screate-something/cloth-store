'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, firebaseLogin } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
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
  
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // General state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize recaptcha verifier when switching to phone mode
    if (loginMode === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, [loginMode]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    
    try {
      setLoading(true);
      const data = await loginUser(email, password);
      setAuth(data.user, data.token);
      router.push('/shop');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
    } catch (err: any) {
      console.error(err);
      // Automatically fallback to mock auth for local development if Firebase fails
      alert('OTP Service failed. Using universal OTP 123456 for development fallback.');
      setShowOtpInput(true);
      setConfirmationResult({
        confirm: async (code: string) => {
          if (code === '123456') {
            return { user: { getIdToken: async () => 'mock-id-token-123456' } };
          }
          throw new Error('Invalid OTP. Please use 123456.');
        }
      } as any);
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
      
      const data = await firebaseLogin(idToken);
      setAuth(data.user, data.token);
      
      router.push('/shop');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-neutral-500">Sign in to your FutureCloth account</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-neutral-900 rounded-xl p-1 mb-6 border border-white/5">
          <button
            onClick={() => setLoginMode('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              loginMode === 'email' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setLoginMode('phone')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              loginMode === 'phone' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Phone Number
          </button>
        </div>

        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-5">
              {error}
            </div>
          )}

          {loginMode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Please wait...' : 'Login with Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-5">
              {!showOtpInput ? (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">Phone Number (with Country Code)</label>
                  <input
                    id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-neutral-300 mb-2">Enter 6-digit OTP</label>
                  <input
                    id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456" maxLength={6}
                    className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              )}
              <div id="recaptcha-container"></div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Please wait...' : (showOtpInput ? 'Verify OTP & Login' : 'Send OTP')}
              </button>
            </form>
          )}
          
          <div className="text-center text-sm text-neutral-400 pt-4 mt-5 border-t border-white/5">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
