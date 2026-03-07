import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, LogOut, Settings, ArrowLeft, Plus, MapPin, GraduationCap, Globe, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/AuthContext';
import { appointmentsApi, applicantsApi } from '@/api/djangoClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';

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

function ApplicationCard({ application, getStatusBadge }) {
  const statusOrder = ['applied', 'reviewing', 'interview', 'visa_processing', 'approved'];
  const currentIndex = statusOrder.indexOf(application.status);
  const isRejected = application.status === 'rejected';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={isRejected ? 'border-red-200' : ''}>
        <CardContent className="p-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg text-[#1e3a5f]">
                  {COUNTRY_LABELS[application.destination_country] || application.destination_country}
                </h3>
                {getStatusBadge(application.status)}
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

          {/* Status Progress Tracker */}
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
              {/* Progress bar background */}
              <div className="hidden md:flex items-center justify-between mb-2">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative">
                      {/* Connector line */}
                      {index > 0 && (
                        <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-0 ${
                          index <= currentIndex ? 'bg-[#1e3a5f]' : 'bg-gray-200'
                        }`} />
                      )}
                      {/* Step circle */}
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
              {/* Mobile: simple list */}
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

          {/* Admin Notes */}
          {application.admin_notes && !isRejected && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
                <MessageSquare className="w-4 h-4" />
                Note from VisaMate
              </div>
              <p className="text-sm text-blue-600">{application.admin_notes}</p>
            </div>
          )}

          {/* Last updated */}
          <p className="text-xs text-gray-400 mt-4">
            Last updated: {format(new Date(application.updated_at), 'PPP p')}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, applicantsRes] = await Promise.all([
        appointmentsApi.list().catch(() => ({ data: [] })),
        applicantsApi.list().catch(() => ({ data: [] })),
      ]);
      setAppointments(appointmentsRes.data || []);
      setApplications(applicantsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentsApi.cancel(id);
      toast.success('Appointment cancelled successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { label: 'Applied', className: 'bg-blue-100 text-blue-800' },
      reviewing: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-800' },
      interview: { label: 'Interview Scheduled', className: 'bg-purple-100 text-purple-800' },
      visa_processing: { label: 'Visa Processing', className: 'bg-orange-100 text-orange-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea] pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Welcome, {user.first_name || user.username}!</h1>
            <p className="text-gray-600">Manage your applications and appointments</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 h-10 rounded-xl border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/5"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2 h-10 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Appointments</CardTitle>
                <Calendar className="h-5 w-5 text-[#1e3a5f]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#1e3a5f]">{appointments.length}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
                <FileText className="h-5 w-5 text-[#1e3a5f]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#1e3a5f]">{applications.length}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {appointments.filter(a => a.is_confirmed).length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#1e3a5f]/20 border-t-[#1e3a5f] rounded-full animate-spin"></div>
              </div>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No appointments yet</h3>
                  <p className="text-gray-500 mb-6">Book your first consultation to get started</p>
                  <Button
                    onClick={() => document.getElementById('appointment-modal-trigger')?.click()}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a6f]"
                  >
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-[#1e3a5f]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#1e3a5f]">
                                {appointment.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(appointment.appointment_date), 'PPP p')}
                              </div>
                              {appointment.message && (
                                <p className="text-sm text-gray-500 mt-2">{appointment.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={appointment.is_confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {appointment.is_confirmed ? 'Confirmed' : 'Pending'}
                            </Badge>
                            {!appointment.is_confirmed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#1e3a5f]/20 border-t-[#1e3a5f] rounded-full animate-spin"></div>
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No applications yet</h3>
                  <p className="text-gray-500 mb-6">Start your study abroad journey today</p>
                  <Button
                    onClick={() => navigate('/NewApplication')}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a6f]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => navigate('/NewApplication')}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a6f]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </div>
                {applications.map((application) => (
                  <ApplicationCard key={application.id} application={application} getStatusBadge={getStatusBadge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
