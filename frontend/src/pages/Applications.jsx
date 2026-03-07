import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, FileText, Clock, CheckCircle, XCircle, Plus,
  MapPin, GraduationCap, Globe, MessageSquare, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/AuthContext';
import { applicantsApi } from '@/api/djangoClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_STEPS = [
  { key: 'applied', label: 'Applied', icon: FileText },
  { key: 'reviewing', label: 'Under Review', icon: Clock },
  { key: 'interview', label: 'Interview', icon: User },
  { key: 'visa_processing', label: 'Visa Processing', icon: Globe },
  { key: 'approved', label: 'Approved', icon: CheckCircle },
];

const COUNTRY_LABELS = { japan: '🇯🇵 Japan', australia: '🇦🇺 Australia' };
const VISA_LABELS = {
  student_visa: 'Student Visa',
  work_visa: 'Work Visa',
  skilled_worker: 'Specified Skilled Worker',
  skilled_migration: 'Skilled Migration',
  working_holiday: 'Working Holiday',
};

const STATUS_CONFIG = {
  applied: { label: 'Applied', className: 'bg-blue-100 text-blue-800' },
  reviewing: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-800' },
  interview: { label: 'Interview Scheduled', className: 'bg-purple-100 text-purple-800' },
  visa_processing: { label: 'Visa Processing', className: 'bg-orange-100 text-orange-800' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

function ApplicationCard({ application }) {
  const statusOrder = ['applied', 'reviewing', 'interview', 'visa_processing', 'approved'];
  const currentIndex = statusOrder.indexOf(application.status);
  const isRejected = application.status === 'rejected';
  const config = STATUS_CONFIG[application.status] || { label: application.status, className: 'bg-gray-100 text-gray-800' };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`rounded-3xl shadow-xl shadow-[#1e3a5f]/10 border-0 ${isRejected ? '!border !border-red-200' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg text-[#1e3a5f]">
                  {COUNTRY_LABELS[application.destination_country] || application.destination_country}
                </h3>
                <Badge className={config.className}>{config.label}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {VISA_LABELS[application.visa_type] || application.visa_type}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Applied {format(new Date(application.created_at), 'PP')}
                </span>
                {application.preferred_start_date && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Start: {format(new Date(application.preferred_start_date), 'PP')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isRejected ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <XCircle className="w-5 h-5" />
                Application Rejected
              </div>
              {application.admin_notes && (
                <p className="text-sm text-red-600 mt-2">{application.admin_notes}</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="hidden md:flex items-center justify-between mb-2">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative">
                      {index > 0 && (
                        <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-0 ${
                          index <= currentIndex ? 'bg-[#1e3a5f]' : 'bg-gray-200'
                        }`} />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                        isCurrent
                          ? 'bg-[#1e3a5f] text-white ring-4 ring-[#1e3a5f]/20'
                          : isCompleted
                            ? 'bg-[#1e3a5f] text-white'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs mt-2 text-center ${
                        isCurrent ? 'font-semibold text-[#1e3a5f]' : isCompleted ? 'text-[#1e3a5f]' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="md:hidden space-y-2">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step.key} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-[#1e3a5f]/5' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-sm ${isCurrent ? 'font-semibold text-[#1e3a5f]' : isCompleted ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      {isCurrent && <Badge className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs ml-auto">Current</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {application.admin_notes && !isRejected && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
                <MessageSquare className="w-4 h-4" />
                Note from VisaMate
              </div>
              <p className="text-sm text-blue-600">{application.admin_notes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Last updated: {format(new Date(application.updated_at), 'PPP p')}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetch = async () => {
      try {
        const res = await applicantsApi.list();
        setApplications(res.data || []);
      } catch {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate]);

  if (!user) return null;

  const inProgress = applications.filter(a => !['approved', 'rejected'].includes(a.status));
  const completed = applications.filter(a => ['approved', 'rejected'].includes(a.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Applications</h1>
        <Button
          onClick={() => navigate('/NewApplication')}
          className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 py-16 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-6">Start your study abroad journey today</p>
          <Button
            onClick={() => navigate('/NewApplication')}
            className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In Progress */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              In Progress ({inProgress.length})
            </h2>
            {inProgress.length === 0 ? (
              <p className="text-sm text-gray-400">No applications in progress</p>
            ) : (
              <div className="space-y-4">
                {inProgress.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            )}
          </div>

          {/* Completed */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Completed ({completed.length})
            </h2>
            {completed.length === 0 ? (
              <p className="text-sm text-gray-400">No completed applications</p>
            ) : (
              <div className="space-y-4">
                {completed.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
