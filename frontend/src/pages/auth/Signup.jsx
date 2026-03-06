import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/djangoClient';
import { motion } from 'framer-motion';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#12243d] px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white shadow-2xl rounded-3xl w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69400f2c603e9672600c487c/f85b456f9_IMG_82332.jpg"
              alt="VisaMate Japan"
              className="h-16 w-16 object-contain mb-4"
            />
          </Link>
          <h2 className="text-3xl font-bold text-[#1e3a5f]">Create Account</h2>
          <p className="text-gray-500 mt-2 text-center">Join VisaMate Japan for your study abroad journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
            <Input 
              name="username"
              placeholder="johndoe" 
              value={formData.username} 
              onChange={handleChange} 
              className="rounded-xl border-gray-200 focus:ring-[#c9a962] focus:border-[#c9a962]"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <Input 
              name="email"
              type="email" 
              placeholder="john@example.com" 
              value={formData.email} 
              onChange={handleChange} 
              className="rounded-xl border-gray-200 focus:ring-[#c9a962] focus:border-[#c9a962]"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <Input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              className="rounded-xl border-gray-200 focus:ring-[#c9a962] focus:border-[#c9a962]"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
            <Input 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className="rounded-xl border-gray-200 focus:ring-[#c9a962] focus:border-[#c9a962]"
              required 
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1e3a5f] hover:bg-[#2c5282] text-white py-6 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c9a962] font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
