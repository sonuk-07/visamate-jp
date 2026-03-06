import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-lg rounded-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#1e3a5f]">Login to Visamate-JP</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#2c5282]">Login</Button>
        </form>
      </div>
    </div>
  );
}
