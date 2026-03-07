import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/djangoClient';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success('OTP sent to your email!');
      setStep('otp');
      setResendTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
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

  const handleVerifyAndProceed = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp: otp.join(''),
        new_password: newPassword,
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await authApi.forgotPassword({ email });
      toast.success('New OTP sent!');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  const getTitle = () => {
    if (step === 'email') return 'Forgot Password';
    if (step === 'otp') return 'Enter OTP';
    return 'Set New Password';
  };

  const getSubtitle = () => {
    if (step === 'email') return 'Enter your email to receive a reset code';
    if (step === 'otp') return `We sent a 6-digit code to ${email}`;
    return 'Choose a strong new password';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-[#c9a962]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
          {/* Header */}
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
            <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
            <p className="text-white/70 mt-2 text-sm">{getSubtitle()}</p>
            <div className="mt-5">
              {step === 'email' && <KeyRound className="w-12 h-12 text-[#c9a962] mx-auto" />}
              {step === 'otp' && <ShieldCheck className="w-12 h-12 text-[#c9a962] mx-auto" />}
              {step === 'reset' && <Lock className="w-12 h-12 text-[#c9a962] mx-auto" />}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Send Reset Code
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#1e3a5f] transition-colors mt-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </form>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl bg-[#faf8f5] focus:bg-white focus:border-[#c9a962] focus:ring-2 focus:ring-[#c9a962]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerifyAndProceed}
                  disabled={otp.join('').length !== 6}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30"
                >
                  Continue
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
                  onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}
                  className="w-full text-sm text-gray-500 hover:text-[#1e3a5f] transition-colors"
                >
                  ← Change email
                </button>
              </div>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Reset Password
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
