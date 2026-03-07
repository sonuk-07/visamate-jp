import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Globe, GraduationCap, FileText, User, Mail, Phone, CalendarDays } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/lib/AuthContext';
import { applicantsApi } from '@/api/djangoClient';
import { toast } from 'sonner';

const VISA_TYPES_BY_COUNTRY = {
  japan: [
    { value: 'student_visa', label: 'Student Visa' },
    { value: 'work_visa', label: 'Work Visa' },
    { value: 'skilled_worker', label: 'Specified Skilled Worker' },
  ],
  australia: [
    { value: 'student_visa', label: 'Student Visa' },
    { value: 'skilled_migration', label: 'Skilled Migration' },
    { value: 'working_holiday', label: 'Working Holiday' },
  ],
};

const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];

export default function NewApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    destination_country: '',
    visa_type: '',
    education_level: '',
    preferred_start_date: '',
    message: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'destination_country') {
        updated.visa_type = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.destination_country || !form.visa_type) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await applicantsApi.create(form);
      toast.success('Application submitted successfully!');
      navigate('/Dashboard');
    } catch (error) {
      const msg = error.response?.data;
      if (msg && typeof msg === 'object') {
        const firstError = Object.values(msg).flat()[0];
        toast.error(firstError || 'Failed to submit application');
      } else {
        toast.error('Failed to submit application');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const visaTypes = form.destination_country ? VISA_TYPES_BY_COUNTRY[form.destination_country] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea] pt-24 pb-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-[#c9a962]/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-8 max-w-2xl relative z-10">
        <Link to="/Dashboard" className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">New Application</h1>
                <p className="text-white/70 text-sm mt-1">Submit your visa application — we'll guide you through each step</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Details Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <h3 className="font-semibold text-[#1e3a5f] text-lg">Personal Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">First Name *</label>
                  <Input
                    value={form.first_name}
                    onChange={e => handleChange('first_name', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">Last Name *</label>
                  <Input
                    value={form.last_name}
                    onChange={e => handleChange('last_name', e.target.value)}
                    className="h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e3a5f] ml-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e3a5f] ml-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+977-XXXXXXXXXX"
                    className="pl-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Program Details Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-[#c9a962]/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#c9a962]" />
                </div>
                <h3 className="font-semibold text-[#1e3a5f] text-lg">Program Details</h3>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e3a5f] ml-1">Destination Country *</label>
                <Select value={form.destination_country} onValueChange={v => handleChange('destination_country', v)}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]">
                    <SelectValue placeholder="Select your destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="japan">🇯🇵 Japan</SelectItem>
                    <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1e3a5f] ml-1">Visa Type *</label>
                <Select
                  value={form.visa_type}
                  onValueChange={v => handleChange('visa_type', v)}
                  disabled={!form.destination_country}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]">
                    <SelectValue placeholder={form.destination_country ? "Select visa type" : "Select a country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map(vt => (
                      <SelectItem key={vt.value} value={vt.value}>{vt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">Education Level</label>
                  <Select value={form.education_level} onValueChange={v => handleChange('education_level', v)}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map(el => (
                        <SelectItem key={el.value} value={el.value}>{el.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1e3a5f] ml-1">Preferred Start Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      type="date"
                      value={form.preferred_start_date}
                      onChange={e => handleChange('preferred_start_date', e.target.value)}
                      className="pl-12 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1e3a5f] ml-1">Additional Notes</label>
              <Textarea
                value={form.message}
                onChange={e => handleChange('message', e.target.value)}
                placeholder="Tell us about your goals, any specific universities you're interested in, or questions..."
                rows={4}
                className="rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] min-h-[120px]"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 transition-all duration-300"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Application
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
