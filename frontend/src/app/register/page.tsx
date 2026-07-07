'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  // User details
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // General state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize recaptcha verifier on mount
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      } catch (e) {
        console.warn("Recaptcha initialization failed (likely missing Firebase config)");
      }
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !age || !gender || !email || !password || !phone) {
      setError('Please fill out all personal details before verifying your phone number.');
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

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || !confirmationResult) {
      setError('Please enter the OTP');
      return;
    }
    
    try {
      setLoading(true);
      // 1. Verify OTP
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      // 2. Register User with all unified fields
      const data = await registerUser(name, email, password, age, gender, phone, idToken);
      setAuth(data.user, data.token);
      
      router.push('/shop');
    } catch (err: any) {
      setError(err.message || 'Registration failed (Invalid OTP or Email/Phone already exists)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Create an account</h1>
          <p className="text-neutral-500">Join FutureCloth today</p>
        </div>

        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={showOtpInput ? handleVerifyOtpAndRegister : handleSendOtp} className="space-y-5">
            {/* Personal Details */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showOtpInput ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="John Doe"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Age</label>
                <input
                  type="number" value={age} onChange={(e) => setAge(e.target.value)} min="13" max="120" required
                  placeholder="25"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Gender</label>
                <select 
                  value={gender} onChange={(e) => setGender(e.target.value)} required
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm appearance-none"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Phone Authentication */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Phone Number (For OTP Verification)</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={showOtpInput}
                  placeholder="+1234567890"
                  className={`w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm ${showOtpInput ? 'opacity-50' : ''}`}
                />
              </div>

              {showOtpInput && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-indigo-300 mb-2">Enter 6-digit OTP sent to {phone}</label>
                  <input
                    type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required
                    placeholder="123456" maxLength={6}
                    className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 text-white placeholder-indigo-500/30 focus:outline-none focus:border-indigo-500 transition-colors text-lg tracking-widest text-center font-mono"
                  />
                </div>
              )}
            </div>

            <div id="recaptcha-container"></div>
            
            <button
              type="submit" disabled={loading}
              className="w-full py-4 mt-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Processing...' : (showOtpInput ? 'Verify OTP & Create Account' : 'Send OTP')}
            </button>
          </form>
          
          <div className="text-center text-sm text-neutral-400 pt-6 mt-6 border-t border-white/5">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
