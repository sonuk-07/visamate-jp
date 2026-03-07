import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/lib/AuthContext';
import { authApi } from '@/api/djangoClient';
import { toast } from 'sonner';


export default function Profile() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      username: user.username || '',
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/Dashboard" className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[#1e3a5f]">
                    {formData.first_name || formData.username} {formData.last_name}
                  </CardTitle>
                  <CardDescription>{formData.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="border-gray-200 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="border-gray-200 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <Input
                    name="username"
                    value={formData.username}
                    disabled
                    className="border-gray-200 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="border-gray-200 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Contact support to change your email</p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
