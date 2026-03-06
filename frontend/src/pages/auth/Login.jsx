import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#12243d] px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 bg-white shadow-2xl rounded-3xl w-full max-w-md border border-gray-100"
      >
        <div className="flex flex-col items-center mb-10">
          <Link to="/">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69400f2c603e9672600c487c/f85b456f9_IMG_82332.jpg"
              alt="VisaMate Japan"
              className="h-20 w-20 object-contain mb-4"
            />
          </Link>
          <h2 className="text-3xl font-extrabold text-[#1e3a5f] tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-center text-sm uppercase tracking-widest font-medium">Continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username / Email</label>
            <Input 
              placeholder="Enter your username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              className="rounded-xl border-gray-200 focus:ring-[#c9a962] focus:border-[#c9a962] py-6 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <a href="#" className="text-xs font-semibold text-[#c9a962] hover:underline">Forgot?</a>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="rounded-xl border-gray-200 focus:ring-[#c9a962] focus:border-[#c9a962] py-6 shadow-sm"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#1e3a5f] hover:bg-[#2c5282] text-white py-6 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[#1e3a5f]/20"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-10 text-center border-t border-gray-100 pt-8">
          <p className="text-gray-600 font-medium">
            New to VisaMate Japan?{' '}
            <Link to="/signup" className="text-[#c9a962] font-bold hover:underline transition-colors hover:text-[#1e3a5f]">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
