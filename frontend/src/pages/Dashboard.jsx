import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/AuthContext';
import { appointmentsApi, applicantsApi } from '@/api/djangoClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';

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
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24">
      <div className="container mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-4">
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
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
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
                    onClick={() => document.getElementById('appointment-modal-trigger')?.click()}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a6f]"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                              <User className="w-6 h-6 text-[#1e3a5f]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#1e3a5f]">
                                {application.first_name} {application.last_name}
                              </h3>
                              <p className="text-sm text-gray-600">{application.email}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Applied: {format(new Date(application.created_at), 'PP')}
                              </p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
