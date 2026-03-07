/**
 * Admin Dashboard Page
 * ====================
 * 
 * Comprehensive admin panel for managing all aspects of VisaMate Japan:
 * - Appointments (view, update status, cancel)
 * - Contact Messages (view, mark read, delete)
 * - Applicants (view, update status, delete)
 * - Appointment Slots (create, update, delete)
 * 
 * @module AdminDashboard
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw,
  Plus,
  Settings,
  BarChart3,
  Mail,
  Phone,
  User,
  FileText,
  Check,
  X,
  Loader2,
  Reply,
  Send
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/AuthContext';
import { adminApi, appointmentSlotsApi } from '@/api/djangoClient';
import { toast } from 'sonner';

/**
 * Status badge color mapping
 */
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  applied: 'bg-purple-100 text-purple-800',
  reviewing: 'bg-orange-100 text-orange-800',
  interview: 'bg-indigo-100 text-indigo-800',
  visa_processing: 'bg-cyan-100 text-cyan-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

/**
 * Service type labels
 */
const serviceLabels = {
  visa_guidance: 'Visa Guidance',
  university_selection: 'University Selection',
  application_support: 'Application Support',
  pre_departure: 'Pre-Departure Prep',
  general_consultation: 'General Consultation',
};

/**
 * Admin Dashboard Component
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [slots, setSlots] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Dialog states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  
  // Reply states
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // New slot form
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    end_time: '',
    service_type: 'general_consultation',
    max_bookings: 3,
  });

  // Check admin access
  useEffect(() => {
    if (user && !user.is_staff) {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (user?.is_staff) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadAppointments(),
        loadMessages(),
        loadApplicants(),
        loadSlots(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getAppointmentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await adminApi.getAllAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const [messagesRes, countRes] = await Promise.all([
        adminApi.getContactMessages(),
        adminApi.getUnreadCount(),
      ]);
      setMessages(messagesRes.data);
      setUnreadCount(countRes.data.unread_count);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadApplicants = async () => {
    try {
      const response = await adminApi.getAllApplicants();
      setApplicants(response.data);
    } catch (error) {
      console.error('Error loading applicants:', error);
    }
  };

  const loadSlots = async () => {
    try {
      const response = await adminApi.getAllSlots();
      setSlots(response.data);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  // Action handlers
  const handleUpdateAppointmentStatus = async (id, newStatus) => {
    try {
      await adminApi.updateAppointmentStatus(id, newStatus);
      toast.success('Appointment status updated');
      loadAppointments();
      loadStats();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      await adminApi.markMessageRead(id);
      loadMessages();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleReplyToMessage = async (id) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await adminApi.replyToMessage(id, replyText.trim());
      toast.success('Reply sent successfully');
      setReplyingTo(null);
      setReplyText('');
      loadMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      switch (deleteType) {
        case 'message':
          await adminApi.deleteContactMessage(selectedItem.id);
          toast.success('Message deleted');
          loadMessages();
          break;
        case 'appointment':
          await adminApi.updateAppointmentStatus(selectedItem.id, 'cancelled');
          toast.success('Appointment cancelled');
          loadAppointments();
          break;
        case 'slot':
          await adminApi.deleteSlot(selectedItem.id);
          toast.success('Slot deleted');
          loadSlots();
          break;
        case 'applicant':
          await adminApi.deleteApplicant(selectedItem.id);
          toast.success('Applicant deleted');
          loadApplicants();
          break;
      }
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setShowDeleteDialog(false);
      setSelectedItem(null);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createSlot({
        ...newSlot,
        is_active: true,
      });
      toast.success('Slot created');
      setShowSlotDialog(false);
      setNewSlot({
        date: '',
        start_time: '',
        end_time: '',
        service_type: 'general_consultation',
        max_bookings: 3,
      });
      loadSlots();
    } catch (error) {
      toast.error('Failed to create slot');
    }
  };

  const confirmDelete = (item, type) => {
    setSelectedItem(item);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const viewDetail = (item) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking admin access...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage appointments, enquiries, and applicants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{stats?.total || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#c9a962]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Confirmed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.confirmed || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unread Messages</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applicants" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Applicants
            </TabsTrigger>
            <TabsTrigger value="slots" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Time Slots
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{apt.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {serviceLabels[apt.service_type] || apt.service_type}
                          </p>
                        </div>
                        <Badge className={statusColors[apt.status]}>
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No appointments yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((msg) => (
                      <div key={msg.id} className={`p-3 rounded-lg ${msg.is_read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{msg.name}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No messages yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Appointments</CardTitle>
                <Button onClick={loadAppointments} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Service</th>
                        <th className="text-left py-3 px-4">Date & Time</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((apt) => (
                        <tr key={apt.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{apt.full_name}</p>
                              <p className="text-sm text-gray-500">{apt.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {serviceLabels[apt.service_type] || apt.service_type}
                          </td>
                          <td className="py-3 px-4">
                            {apt.slot_details ? (
                              <div>
                                <p>{format(new Date(apt.slot_details.date), 'MMM d, yyyy')}</p>
                                <p className="text-sm text-gray-500">{apt.slot_details.start_time}</p>
                              </div>
                            ) : (
                              <p>{format(new Date(apt.appointment_date), 'MMM d, yyyy h:mm a')}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Select
                              value={apt.status}
                              onValueChange={(value) => handleUpdateAppointmentStatus(apt.id, value)}
                            >
                              <SelectTrigger className={`w-32 ${statusColors[apt.status]}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewDetail(apt)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => confirmDelete(apt, 'appointment')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {appointments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No appointments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contact Messages</CardTitle>
                <Button onClick={loadMessages} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg border ${
                        msg.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{msg.name}</h4>
                            {!msg.is_read && (
                              <Badge className="bg-blue-500">New</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {msg.phone}
                              </span>
                            )}
                            {msg.destination && (
                              <Badge variant="outline">{msg.destination}</Badge>
                            )}
                          </div>
                          <p className="text-gray-700">{msg.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(msg.created_at), 'MMMM d, yyyy h:mm a')}
                          </p>

                          {/* Show existing reply */}
                          {msg.admin_reply && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-green-500 text-xs">Replied ✓</Badge>
                                {msg.replied_at && (
                                  <span className="text-xs text-gray-400">
                                    {format(new Date(msg.replied_at), 'MMM d, yyyy h:mm a')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{msg.admin_reply}</p>
                            </div>
                          )}

                          {/* Inline reply form */}
                          {replyingTo === msg.id && (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                placeholder="Type your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReplyToMessage(msg.id)}
                                  disabled={sendingReply || !replyText.trim()}
                                >
                                  <Send className="w-4 h-4 mr-1" />
                                  {sendingReply ? 'Sending...' : 'Send Reply'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(replyingTo === msg.id ? null : msg.id);
                              setReplyText(msg.admin_reply || '');
                            }}
                            title="Reply"
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                          {!msg.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkMessageRead(msg.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => confirmDelete(msg, 'message')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Applicants</CardTitle>
                <Button onClick={loadApplicants} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Phone</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Documents</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app) => (
                        <tr key={app.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {app.first_name} {app.last_name}
                          </td>
                          <td className="py-3 px-4">{app.email}</td>
                          <td className="py-3 px-4">{app.phone}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[app.status]}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {app.documents?.length || 0} files
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewDetail(app)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => confirmDelete(app, 'applicant')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {applicants.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No applicants yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Slots Tab */}
          <TabsContent value="slots">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Appointment Slots</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={loadSlots} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => setShowSlotDialog(true)} size="sm" className="bg-[#1e3a5f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Time</th>
                        <th className="text-left py-3 px-4">Service</th>
                        <th className="text-left py-3 px-4">Bookings</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => (
                        <tr key={slot.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {format(new Date(slot.date), 'MMM d, yyyy')}
                          </td>
                          <td className="py-3 px-4">
                            {slot.start_time} - {slot.end_time}
                          </td>
                          <td className="py-3 px-4">
                            {serviceLabels[slot.service_type] || slot.service_type}
                          </td>
                          <td className="py-3 px-4">
                            {slot.current_bookings} / {slot.max_bookings}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={slot.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {slot.is_available ? 'Available' : 'Full'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => confirmDelete(slot, 'slot')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {slots.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No slots created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setShowDeleteDialog(false); setSelectedItem(null); setDeleteType(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Slot Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Time Slot</DialogTitle>
            <DialogDescription>
              Add a new appointment slot for customers to book.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={newSlot.service_type}
                onValueChange={(value) => setNewSlot({ ...newSlot, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(serviceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="max_bookings">Max Bookings</Label>
              <Input
                id="max_bookings"
                type="number"
                min="1"
                value={newSlot.max_bookings}
                onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSlotDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1e3a5f]">
                Create Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
