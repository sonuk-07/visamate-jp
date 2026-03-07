import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/djangoClient';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('OTP sent to your email!');
      setStep('otp');
      setResendTimer(60);
    } catch (error) {
      const errorMsg = error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp({ email: formData.email, otp: otpCode });
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await authApi.resendOtp({ email: formData.email });
      toast.success('New OTP sent!');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    }
  };

  const benefits = [
    'Track your applications',
    'Book appointments online',
    'Get personalized guidance'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea] flex items-center justify-center px-6 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#c9a962]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[#1e3a5f]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#1e3a5f]/5 rounded-full blur-2xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] px-8 py-10 text-center">
            <Link to="/" className="inline-block mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69400f2c603e9672600c487c/f85b456f9_IMG_82332.jpg"
                  alt="VisaMate Japan"
                  className="h-10 w-10 object-contain"
                />
              </div>
            </Link>
            <h2 className="text-2xl font-bold text-white">
              {step === 'form' ? 'Create Your Account' : 'Verify Your Email'}
            </h2>
            <p className="text-white/70 mt-2 text-sm">
              {step === 'form' ? 'Start your study abroad journey today' : `We sent a 6-digit code to ${formData.email}`}
            </p>
            
            {step === 'form' && (
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#c9a962]" />
                    {benefit}
                  </motion.div>
                ))}
              </div>
            )}

            {step === 'otp' && (
              <div className="mt-5">
                <ShieldCheck className="w-12 h-12 text-[#c9a962] mx-auto" />
              </div>
            )}
          </div>

          {/* Form */}
          <div className="p-8">
            {step === 'form' ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        name="username"
                        placeholder="johndoe" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                        className="pl-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        name="email"
                        type="email" 
                        placeholder="john@example.com" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        className="pl-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1e3a5f] ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          name="password"
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={handleChange} 
                          required 
                          className="pl-12 pr-10 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1e3a5f] ml-1">Confirm</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formData.confirmPassword} 
                          onChange={handleChange} 
                          required 
                          className="pl-12 pr-10 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 group mt-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Create Account
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                {/* Login link */}
                <Link to="/login" className="block">
                  <Button 
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-semibold transition-all duration-300"
                  >
                    Sign In Instead
                  </Button>
                </Link>
              </>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-6">
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl bg-[#faf8f5] focus:bg-white focus:border-[#c9a962] focus:ring-2 focus:ring-[#c9a962]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <Button 
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                  {resendTimer > 0 ? (
                    <p className="text-sm text-[#1e3a5f] font-medium">Resend in {resendTimer}s</p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm font-semibold text-[#c9a962] hover:text-[#1e3a5f] transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); }}
                  className="w-full text-sm text-gray-500 hover:text-[#1e3a5f] transition-colors"
                >
                  ← Back to registration
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-[#1e3a5f] hover:text-[#c9a962] font-medium">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-[#1e3a5f] hover:text-[#c9a962] font-medium">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
