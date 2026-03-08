/**
 * Admin Dashboard Page
 * Uses the same Layout + DashboardLayout as the user dashboard for identical navbar/tab UI.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar, Users, MessageSquare, Clock, CheckCircle, XCircle,
  Trash2, Eye, RefreshCw, Plus, Mail, Phone,
  FileText, Check, Loader2, Reply, Send, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/AuthContext";
import { adminApi } from "@/api/djangoClient";
import { useWebSocket } from "@/lib/WebSocketContext";
import { toast } from "sonner";
import Layout from "../Layout";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  applied: "bg-purple-100 text-purple-800",
  reviewing: "bg-orange-100 text-orange-800",
  interview: "bg-indigo-100 text-indigo-800",
  visa_processing: "bg-cyan-100 text-cyan-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const serviceLabels = {
  visa_guidance: "Visa Guidance",
  university_selection: "University Selection",
  application_support: "Application Support",
  pre_departure: "Pre-Departure Prep",
  general_consultation: "General Consultation",
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
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
  const [deleteType, setDeleteType] = useState("");

  // Reply states
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // New slot form
  const [newSlot, setNewSlot] = useState({
    date: "", start_time: "", end_time: "",
    service_type: "general_consultation", max_bookings: 3,
  });

  // Auth guard
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!user.is_staff) { toast.error("Admin access required"); navigate("/Dashboard"); }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.is_staff) loadAllData();
  }, [user]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadAppointments(), loadMessages(), loadApplicants(), loadSlots()]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useWebSocket("new_appointment", (msg) => { toast.info(`New appointment from ${msg.data?.name || "a user"}`); loadAppointments(); loadStats(); });
  useWebSocket("new_enquiry", (msg) => { toast.info(`New enquiry from ${msg.data?.name || "a user"}`); loadMessages(); });

  const loadStats = async () => { try { const r = await adminApi.getAppointmentStats(); setStats(r.data); } catch {} };
  const loadAppointments = async () => { try { const r = await adminApi.getAllAppointments(); const d = r.data; setAppointments(Array.isArray(d) ? d : (d.results || [])); } catch {} };
  const loadMessages = async () => { try { const [m, c] = await Promise.all([adminApi.getContactMessages(), adminApi.getUnreadCount()]); const d = m.data; setMessages(Array.isArray(d) ? d : (d.results || [])); setUnreadCount(c.data.unread_count); } catch {} };
  const loadApplicants = async () => { try { const r = await adminApi.getAllApplicants(); const d = r.data; setApplicants(Array.isArray(d) ? d : (d.results || [])); } catch {} };
  const loadSlots = async () => { try { const r = await adminApi.getAllSlots(); const d = r.data; setSlots(Array.isArray(d) ? d : (d.results || [])); } catch {} };

  const handleUpdateAppointmentStatus = async (id, s) => { try { await adminApi.updateAppointmentStatus(id, s); toast.success("Status updated"); loadAppointments(); loadStats(); } catch { toast.error("Failed"); } };
  const handleMarkMessageRead = async (id) => { try { await adminApi.markMessageRead(id); loadMessages(); } catch { toast.error("Failed"); } };
  const handleReplyToMessage = async (id) => {
    if (!replyText.trim()) return; setSendingReply(true);
    try { await adminApi.replyToMessage(id, replyText.trim()); toast.success("Reply sent"); setReplyingTo(null); setReplyText(""); loadMessages(); }
    catch { toast.error("Failed"); } finally { setSendingReply(false); }
  };
  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      if (deleteType === "message") { await adminApi.deleteContactMessage(selectedItem.id); toast.success("Deleted"); loadMessages(); }
      else if (deleteType === "appointment") { await adminApi.updateAppointmentStatus(selectedItem.id, "cancelled"); toast.success("Cancelled"); loadAppointments(); }
      else if (deleteType === "slot") { await adminApi.deleteSlot(selectedItem.id); toast.success("Deleted"); loadSlots(); }
      else if (deleteType === "applicant") { await adminApi.deleteApplicant(selectedItem.id); toast.success("Deleted"); loadApplicants(); }
    } catch { toast.error("Delete failed"); }
    finally { setShowDeleteDialog(false); setSelectedItem(null); }
  };
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try { await adminApi.createSlot({ ...newSlot, is_active: true }); toast.success("Slot created"); setShowSlotDialog(false); setNewSlot({ date: "", start_time: "", end_time: "", service_type: "general_consultation", max_bookings: 3 }); loadSlots(); }
    catch { toast.error("Failed to create slot"); }
  };
  const confirmDelete = (item, type) => { setSelectedItem(item); setDeleteType(type); setShowDeleteDialog(true); };
  const viewDetail = (item) => { setSelectedItem(item); setShowDetailDialog(true); };

  // Early returns after all hooks
  if (!user?.is_staff) return null;
  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Tab bar */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 lg:px-12">
          <nav className="flex gap-1 overflow-x-auto py-1.5">
            {[
              { value: "overview", label: "Overview", icon: LayoutDashboard },
              { value: "appointments", label: "Appointments", icon: Calendar },
              { value: "messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
              { value: "applicants", label: "Applicants", icon: Users },
              { value: "slots", label: "Time Slots", icon: Clock },
            ].map(({ value, label, icon: Icon, badge }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                  activeTab === value
                    ? "bg-[#1e3a5f] text-white shadow-md shadow-[#1e3a5f]/20"
                    : "text-gray-600 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea]">
        <div className="container mx-auto px-6 lg:px-12 pt-16 pb-8">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Admin</h1>
            <p className="text-gray-500 mt-1">Manage appointments, enquiries, and applicants</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Appointments", value: stats?.total || 0, icon: Calendar, color: "text-[#c9a962]" },
              { label: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-yellow-500" },
              { label: "Confirmed", value: stats?.confirmed || 0, icon: CheckCircle, color: "text-blue-500" },
              { label: "Completed", value: stats?.completed || 0, icon: Check, color: "text-green-500" },
              { label: "Unread Messages", value: unreadCount, icon: MessageSquare, color: "text-red-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-0 rounded-3xl shadow-xl shadow-[#1e3a5f]/10">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-2xl font-bold text-[#1e3a5f] mt-0.5">{value}</p>
                    </div>
                    <Icon className={`w-7 h-7 ${color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-[#1e3a5f]">Recent Appointments</h2>
                </div>
                <div className="p-6 space-y-3">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-[#1e3a5f]">{apt.full_name}</p>
                        <p className="text-xs text-gray-500">{serviceLabels[apt.service_type] || apt.service_type}</p>
                      </div>
                      <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No appointments yet</p>}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-[#1e3a5f]">Recent Messages</h2>
                </div>
                <div className="p-6 space-y-3">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-xl ${msg.is_read ? "bg-[#faf8f5]" : "bg-blue-50 border-l-4 border-blue-400"}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-[#1e3a5f]">{msg.name}</p>
                        <p className="text-xs text-gray-400">{format(new Date(msg.created_at), "MMM d, h:mm a")}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{msg.message}</p>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No messages yet</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1e3a5f]">All Appointments</h2>
                <Button onClick={loadAppointments} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-400 text-xs">
                    <th className="py-3 px-2 font-medium">Customer</th>
                    <th className="py-3 px-2 font-medium">Service</th>
                    <th className="py-3 px-2 font-medium">Date & Time</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-2 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="border-b hover:bg-[#faf8f5]">
                        <td className="py-3 px-2"><p className="font-medium text-[#1e3a5f]">{apt.full_name}</p><p className="text-xs text-gray-400">{apt.email}</p></td>
                        <td className="py-3 px-2 text-gray-600">{serviceLabels[apt.service_type] || apt.service_type}</td>
                        <td className="py-3 px-2">{apt.slot_details ? <div><p className="text-[#1e3a5f]">{format(new Date(apt.slot_details.date), "MMM d, yyyy")}</p><p className="text-xs text-gray-400">{apt.slot_details.start_time}</p></div> : <p>{format(new Date(apt.appointment_date), "MMM d, yyyy h:mm a")}</p>}</td>
                        <td className="py-3 px-2">
                          <Select value={apt.status} onValueChange={(v) => handleUpdateAppointmentStatus(apt.id, v)}>
                            <SelectTrigger className={`w-32 h-8 text-xs ${statusColors[apt.status]}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-2"><div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => viewDetail(apt)}><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => confirmDelete(apt, "appointment")}><XCircle className="w-4 h-4" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {appointments.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No appointments yet</p>}
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1e3a5f]">Contact Messages</h2>
                <Button onClick={loadMessages} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
              </div>
              <div className="p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-4 rounded-2xl border ${msg.is_read ? "bg-white border-gray-100" : "bg-blue-50 border-blue-200"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-[#1e3a5f]">{msg.name}</h4>
                          {!msg.is_read && <Badge className="bg-blue-500 text-xs">New</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{msg.email}</span>
                          {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{msg.phone}</span>}
                        </div>
                        <p className="text-sm text-gray-700">{msg.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(msg.created_at), "MMMM d, yyyy h:mm a")}</p>
                        {msg.admin_reply && <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl"><Badge className="bg-green-500 text-xs mb-1">Replied ✓</Badge><p className="text-sm text-gray-700">{msg.admin_reply}</p></div>}
                        {replyingTo === msg.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReplyToMessage(msg.id)} disabled={sendingReply || !replyText.trim()}><Send className="w-4 h-4 mr-1" />{sendingReply ? "Sending..." : "Send Reply"}</Button>
                              <Button size="sm" variant="outline" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => { setReplyingTo(replyingTo === msg.id ? null : msg.id); setReplyText(msg.admin_reply || ""); }}><Reply className="w-4 h-4" /></Button>
                        {!msg.is_read && <Button size="sm" variant="outline" onClick={() => handleMarkMessageRead(msg.id)}><Check className="w-4 h-4" /></Button>}
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => confirmDelete(msg, "message")}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No messages yet</p>}
              </div>
            </div>
          )}

          {activeTab === "applicants" && (
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1e3a5f]">All Applications</h2>
                <Button onClick={loadApplicants} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-400 text-xs">
                    <th className="py-3 px-2 font-medium">Name</th>
                    <th className="py-3 px-2 font-medium">Destination</th>
                    <th className="py-3 px-2 font-medium">Visa Type</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-2 font-medium">Applied</th>
                    <th className="py-3 px-2 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-[#faf8f5]">
                        <td className="py-3 px-2"><p className="font-medium text-[#1e3a5f]">{app.first_name} {app.last_name}</p><p className="text-xs text-gray-400">{app.email}</p>{app.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</p>}</td>
                        <td className="py-3 px-2">{app.destination_country === "japan" ? "🇯🇵 Japan" : app.destination_country === "australia" ? "🇦🇺 Australia" : app.destination_country}</td>
                        <td className="py-3 px-2 text-gray-600">{(app.visa_type || "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td className="py-3 px-2">
                          <Select value={app.status} onValueChange={async (s) => { try { await adminApi.updateApplicantStatus(app.id, { status: s }); toast.success("Status updated"); loadApplicants(); } catch { toast.error("Failed"); } }}>
                            <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="visa_processing">Visa Processing</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-xs">{app.created_at ? format(new Date(app.created_at), "PP") : "-"}</td>
                        <td className="py-3 px-2"><div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => viewDetail(app)}><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => confirmDelete(app, "applicant")}><Trash2 className="w-4 h-4" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {applicants.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No applications yet</p>}
              </div>
            </div>
          )}

          {activeTab === "slots" && (
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1e3a5f]">Appointment Slots</h2>
                <div className="flex gap-2">
                  <Button onClick={loadSlots} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
                  <Button onClick={() => setShowSlotDialog(true)} size="sm" className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"><Plus className="w-4 h-4 mr-2" />Add Slot</Button>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-400 text-xs">
                    <th className="py-3 px-2 font-medium">Date</th>
                    <th className="py-3 px-2 font-medium">Time</th>
                    <th className="py-3 px-2 font-medium">Service</th>
                    <th className="py-3 px-2 font-medium">Bookings</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-2 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot.id} className="border-b hover:bg-[#faf8f5]">
                        <td className="py-3 px-2 text-[#1e3a5f]">{format(new Date(slot.date), "MMM d, yyyy")}</td>
                        <td className="py-3 px-2 text-gray-600">{slot.start_time} - {slot.end_time}</td>
                        <td className="py-3 px-2 text-gray-600">{serviceLabels[slot.service_type] || slot.service_type}</td>
                        <td className="py-3 px-2 text-gray-600">{slot.current_bookings} / {slot.max_bookings}</td>
                        <td className="py-3 px-2"><Badge className={slot.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{slot.is_available ? "Available" : "Full"}</Badge></td>
                        <td className="py-3 px-2"><Button size="sm" variant="ghost" className="text-red-500" onClick={() => confirmDelete(slot, "slot")}><Trash2 className="w-4 h-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {slots.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No slots yet</p>}
              </div>
            </div>
          )}

          {/* Detail Dialog */}
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
              {selectedItem && (
                <div className="space-y-4">
                  <div className="bg-[#faf8f5] p-4 rounded-xl text-sm space-y-1">
                    <p className="font-semibold text-[#1e3a5f] text-base">{selectedItem.first_name} {selectedItem.last_name}</p>
                    <p className="text-gray-500">Email: {selectedItem.email}</p>
                    <p className="text-gray-500">Phone: {selectedItem.phone}</p>
                    <p className="text-gray-500">Destination: {selectedItem.destination_country}</p>
                    <p className="text-gray-500">Visa Type: {selectedItem.visa_type}</p>
                    <p className="text-gray-500">Status: {selectedItem.status}</p>
                    <p className="text-gray-500">Applied: {selectedItem.created_at ? format(new Date(selectedItem.created_at), "PP") : "-"}</p>
                    {selectedItem.admin_notes && <p className="text-blue-600">Notes: {selectedItem.admin_notes}</p>}
                  </div>
                  {Array.isArray(selectedItem.documents) && selectedItem.documents.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#1e3a5f] mb-2 text-sm">Submitted Documents</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedItem.documents.map((doc) => (
                          <div key={doc.id} className="border rounded-xl p-3 bg-[#faf8f5] w-44">
                            <p className="font-medium text-xs mb-2 truncate">{doc.title}</p>
                            {doc.file && (doc.file.endsWith(".pdf")
                              ? <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View PDF</a>
                              : <a href={doc.file} target="_blank" rel="noopener noreferrer"><img src={doc.file} alt={doc.title} className="w-full h-24 object-contain rounded" /></a>
                            )}
                            <a href={doc.file} download className="block text-xs text-gray-400 mt-1 underline">Download</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setShowDeleteDialog(false); setSelectedItem(null); setDeleteType(""); } }}>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Slot Dialog */}
          <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Time Slot</DialogTitle><DialogDescription>Add a new appointment slot for customers to book.</DialogDescription></DialogHeader>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div><Label>Date</Label><Input type="date" value={newSlot.date} onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Start Time</Label><Input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} required /></div>
                  <div><Label>End Time</Label><Input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} required /></div>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Select value={newSlot.service_type} onValueChange={(v) => setNewSlot({ ...newSlot, service_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(serviceLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Max Bookings</Label><Input type="number" min="1" value={newSlot.max_bookings} onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) })} required /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowSlotDialog(false)}>Cancel</Button>
                  <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2a4a6f]">Create Slot</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </Layout>
  );
}