import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, FileText, Clock, CheckCircle, XCircle,
  ArrowRight, Plus, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/AuthContext';
import { appointmentsApi, applicantsApi } from '@/api/djangoClient';
import { useWebSocket } from '@/lib/WebSocketContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
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

  const fetchData = useCallback(async () => {
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
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when appointment or application status changes via WebSocket
  useWebSocket('appointment_update', (msg) => {
    toast.info('An appointment was updated');
    fetchData();
  });

  useWebSocket('application_update', (msg) => {
    toast.info('An application was updated');
    fetchData();
  });

  useWebSocket('message_update', () => {
    toast.info('You have a new message');
  });

  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentsApi.cancel(id);
      toast.success('Appointment cancelled successfully');
      fetchData();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  if (!user) return null;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">
          Welcome, {user.first_name || 'there'}!
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your account</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 rounded-3xl shadow-xl shadow-[#1e3a5f]/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-[#1e3a5f]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1e3a5f]">{loading ? '—' : appointments.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 rounded-3xl shadow-xl shadow-[#1e3a5f]/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Applications</CardTitle>
              <FileText className="h-5 w-5 text-[#1e3a5f]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1e3a5f]">{loading ? '—' : applications.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 rounded-3xl shadow-xl shadow-[#1e3a5f]/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Confirmed</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loading ? '—' : appointments.filter(a => a.is_confirmed).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Applications Summary */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#1e3a5f]">Recent Applications</h2>
            <Link to="/Applications" className="text-sm text-[#c9a962] hover:text-[#b89852] font-medium flex items-center gap-1">
              See all applications <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">No applications yet</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/NewApplication')}
                  className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-1" /> New Application
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 3).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-[#1e3a5f]">
                        {app.destination_country === 'japan' ? '🇯🇵 Japan' : app.destination_country === 'australia' ? '🇦🇺 Australia' : app.destination_country}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(app.created_at), 'PP')}
                      </p>
                    </div>
                    <Badge className={
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {app.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#1e3a5f]">Upcoming Appointments</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">No appointments yet</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/AppointmentBooking')}
                  className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg"
                >
                  Book Consultation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#1e3a5f]">
                          {apt.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {format(new Date(apt.appointment_date), 'PPP p')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={apt.is_confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {apt.is_confirmed ? 'Confirmed' : 'Pending'}
                      </Badge>
                      {!apt.is_confirmed && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
