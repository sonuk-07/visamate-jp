/**
 * Admin Dashboard
 * - Shows payment status per applicant
 * - Admin can send feedback/suggestions to user
 * - User can resubmit after feedback
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar, Users, MessageSquare, Clock, CheckCircle, XCircle,
  Trash2, Eye, RefreshCw, Plus, Mail, Phone, FileText, Check,
  Loader2, Reply, Send, LayoutDashboard, CreditCard, ShieldCheck,
  AlertCircle, MessageCircle, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuth } from "@/lib/AuthContext";
import { adminApi } from "@/api/djangoClient";
import { useWebSocket } from "@/lib/WebSocketContext";
import { toast } from "sonner";
import Layout from "../Layout";

// ─── Constants ───────────────────────────────────────────────────────────────

const statusColors = {
  pending:        "bg-yellow-100 text-yellow-800",
  confirmed:      "bg-blue-100 text-blue-800",
  completed:      "bg-green-100 text-green-800",
  cancelled:      "bg-red-100 text-red-800",
  applied:        "bg-purple-100 text-purple-800",
  reviewing:      "bg-orange-100 text-orange-800",
  interview:      "bg-indigo-100 text-indigo-800",
  visa_processing:"bg-cyan-100 text-cyan-800",
  approved:       "bg-green-100 text-green-800",
  rejected:       "bg-red-100 text-red-800",
};

const serviceLabels = {
  visa_guidance:        "Visa Guidance",
  university_selection: "University Selection",
  application_support:  "Application Support",
  pre_departure:        "Pre-Departure Prep",
  general_consultation: "General Consultation",
};

const COUNTRY_LABELS = { japan: "🇯🇵 Japan", australia: "🇦🇺 Australia" };
const VISA_LABELS = {
  student_visa:     "Student Visa",
  work_visa:        "Work Visa",
  skilled_worker:   "Specified Skilled Worker",
  skilled_migration:"Skilled Migration",
  working_holiday:  "Working Holiday",
};
const EDUCATION_LABELS = {
  high_school:"High School", bachelors:"Bachelor's Degree",
  masters:"Master's Degree", phd:"PhD", other:"Other",
};

// ─── Payment Badge ────────────────────────────────────────────────────────────
function PaymentBadge({ paymentStatus, intentId }) {
  if (paymentStatus === "paid") {
    return (
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span className="text-xs font-semibold text-green-700">Paid</span>
        {intentId && (
          <a
            href={`https://dashboard.stripe.com/test/payments/${intentId}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-600 hover:underline flex items-center gap-0.5"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }
  if (paymentStatus === "refunded") {
    return (
      <div className="flex items-center gap-1.5">
        <CreditCard className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Refunded</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <AlertCircle className="w-4 h-4 text-amber-500" />
      <span className="text-xs font-medium text-amber-600">Unpaid</span>
    </div>
  );
}

// ─── Applicant Detail Dialog ──────────────────────────────────────────────────
function ApplicantDetailDialog({ app, open, onClose, onStatusChange, onFeedbackSent, onPaymentStatusChange }) {
  const [status, setStatus]           = useState(app?.status || "applied");
  const [feedback, setFeedback]       = useState(app?.admin_notes || "");
  const [saving, setSaving]           = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(false);

  // Sync when app changes
  useEffect(() => {
    if (app) { setStatus(app.status); setFeedback(app.admin_notes || ""); }
  }, [app]);

  if (!app) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send status if it actually changed — avoids transition validation error
      const payload = { admin_notes: feedback };
      if (status !== app.status) {
        payload.status = status;
      }
      await adminApi.updateApplicantStatus(app.id, payload);
      toast.success(
        status !== app.status
          ? "Status updated and feedback sent to user"
          : "Feedback sent to user"
      );
      onStatusChange?.();
      onFeedbackSent?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update application";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1e3a5f]">
            Application — {app.first_name} {app.last_name}
          </DialogTitle>
          <DialogDescription>
            Review the application, update status, and send feedback to the user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Personal info */}
          <div className="bg-[#faf8f5] rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-semibold text-[#1e3a5f] text-base mb-2">Personal Details</p>
            <p className="text-gray-600"><span className="font-medium">Name:</span> {app.first_name} {app.last_name}</p>
            <p className="text-gray-600"><span className="font-medium">Email:</span> {app.email}</p>
            <p className="text-gray-600"><span className="font-medium">Phone:</span> {app.phone || "—"}</p>
            <p className="text-gray-600"><span className="font-medium">Applied:</span> {app.created_at ? format(new Date(app.created_at), "PPP") : "—"}</p>
          </div>

          {/* Program info */}
          <div className="bg-[#faf8f5] rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-semibold text-[#1e3a5f] text-base mb-2">Program Details</p>
            <p className="text-gray-600"><span className="font-medium">Destination:</span> {COUNTRY_LABELS[app.destination_country] || app.destination_country}</p>
            <p className="text-gray-600"><span className="font-medium">Visa Type:</span> {VISA_LABELS[app.visa_type] || app.visa_type}</p>
            {app.preferred_course && <p className="text-gray-600"><span className="font-medium">Course:</span> {app.preferred_course}</p>}
            {app.education_level && <p className="text-gray-600"><span className="font-medium">Education:</span> {EDUCATION_LABELS[app.education_level] || app.education_level}</p>}
            {app.preferred_start_date && <p className="text-gray-600"><span className="font-medium">Start Date:</span> {format(new Date(app.preferred_start_date), "PP")}</p>}
            {app.message && <p className="text-gray-600"><span className="font-medium">Notes:</span> {app.message}</p>}
          </div>

          {/* Payment status — admin can view and override */}
          <div className={`rounded-xl p-4 border ${
            app.payment_status === "paid"
              ? "bg-green-50 border-green-200"
              : app.payment_status === "refunded"
              ? "bg-gray-50 border-gray-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className={`w-5 h-5 shrink-0 ${
                  app.payment_status === "paid" ? "text-green-600"
                  : app.payment_status === "refunded" ? "text-gray-400"
                  : "text-amber-500"
                }`} />
                <div>
                  <p className="text-sm font-semibold text-[#1e3a5f]">Processing Fee — $25.00 USD</p>
                  {app.stripe_payment_intent_id && (
                    <a
                      href={`https://dashboard.stripe.com/test/payments/${app.stripe_payment_intent_id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" /> View in Stripe Dashboard
                    </a>
                  )}
                  {app.stripe_payment_intent_id && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Ref: {app.stripe_payment_intent_id}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={
                app.payment_status === "paid" ? "bg-green-100 text-green-700"
                : app.payment_status === "refunded" ? "bg-gray-100 text-gray-600"
                : "bg-amber-100 text-amber-700"
              }>
                {app.payment_status === "paid" ? "Paid"
                 : app.payment_status === "refunded" ? "Refunded"
                 : "Unpaid"}
              </Badge>
            </div>
            {/* Admin override controls */}
            <div className="border-t border-current/10 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Override payment status:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onPaymentStatusChange(app.id, "paid")}
                  disabled={app.payment_status === "paid"}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ✓ Mark as Paid
                </button>
                <button
                  onClick={() => onPaymentStatusChange(app.id, "unpaid")}
                  disabled={app.payment_status === "unpaid"}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ✗ Mark as Unpaid
                </button>
                <button
                  onClick={() => onPaymentStatusChange(app.id, "refunded")}
                  disabled={app.payment_status === "refunded"}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ↩ Mark as Refunded
                </button>
              </div>
            </div>
          </div>

          {/* Documents */}
          {Array.isArray(app.documents) && app.documents.length > 0 && (
            <div>
              <p className="font-semibold text-[#1e3a5f] text-sm mb-2">
                Submitted Documents ({app.documents.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {app.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-xl p-3 bg-[#faf8f5] w-44">
                    <p className="font-medium text-xs mb-2 truncate">{doc.title}</p>
                    {doc.file && (
                      doc.file.endsWith(".pdf")
                        ? <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View PDF</a>
                        : <a href={doc.file} target="_blank" rel="noopener noreferrer">
                            <img src={doc.file} alt={doc.title} className="w-full h-24 object-contain rounded" />
                          </a>
                    )}
                    <a href={doc.file} download className="block text-xs text-gray-400 mt-1 underline">Download</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status update */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#1e3a5f]">Update Application Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="visa_processing">Visa Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback / suggestion to user */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#c9a962]" />
                Feedback / Suggestions for User
              </Label>
              <span className="text-xs text-gray-400">Visible to applicant on their dashboard</span>
            </div>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                status === "rejected"
                  ? "e.g. Your IELTS score is below the required 6.5. Please retake and resubmit."
                  : status === "reviewing"
                  ? "e.g. Please upload a clearer copy of your passport. Current scan is too dark."
                  : "Add notes or suggestions for the applicant..."
              }
              rows={4}
              className="rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] text-sm"
            />
            {feedback && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>Preview:</strong> The user will see this message highlighted on their dashboard and will be prompted to resubmit if needed.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
          >
            {saving
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
              : <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {status !== app?.status ? "Update Status & Send Feedback" : "Send Feedback"}
              </span>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats]             = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages]       = useState([]);
  const [applicants, setApplicants]   = useState([]);
  const [slots, setSlots]             = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantDialog, setShowApplicantDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog]     = useState(false);
  const [selectedItem, setSelectedItem]             = useState(null);
  const [deleteType, setDeleteType]                 = useState("");
  const [showSlotDialog, setShowSlotDialog]         = useState(false);

  const [replyingTo, setReplyingTo]   = useState(null);
  const [replyText, setReplyText]     = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [newSlot, setNewSlot] = useState({
    date: "", start_time: "", end_time: "",
    service_type: "general_consultation", max_bookings: 3,
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!user.is_staff) { toast.error("Admin access required"); navigate("/Dashboard"); }
  }, [user, navigate]);

  useEffect(() => { if (user?.is_staff) loadAllData(); }, [user]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try { await Promise.all([loadStats(), loadAppointments(), loadMessages(), loadApplicants(), loadSlots()]); }
    catch (err) { console.error(err); toast.error("Failed to load admin data"); }
    finally { setLoading(false); }
  }, []);

  useWebSocket("new_appointment", (msg) => { toast.info(`New appointment from ${msg.data?.name || "a user"}`); loadAppointments(); loadStats(); });
  useWebSocket("new_enquiry",     (msg) => { toast.info(`New enquiry from ${msg.data?.name || "a user"}`); loadMessages(); });

  const loadStats        = async () => { try { const r = await adminApi.getAppointmentStats(); setStats(r.data); } catch {} };
  const loadAppointments = async () => { try { const r = await adminApi.getAllAppointments(); const d = r.data; setAppointments(Array.isArray(d) ? d : d.results || []); } catch {} };
  const loadMessages     = async () => { try { const [m, c] = await Promise.all([adminApi.getContactMessages(), adminApi.getUnreadCount()]); const d = m.data; setMessages(Array.isArray(d) ? d : d.results || []); setUnreadCount(c.data.unread_count); } catch {} };
  const loadApplicants   = async () => { try { const r = await adminApi.getAllApplicants(); const d = r.data; setApplicants(Array.isArray(d) ? d : d.results || []); } catch {} };
  const loadSlots        = async () => { try { const r = await adminApi.getAllSlots(); const d = r.data; setSlots(Array.isArray(d) ? d : d.results || []); } catch {} };

  const handleUpdatePaymentStatus = async (applicantId, newStatus) => {
    try {
      await adminApi.updateApplicantStatus(applicantId, { payment_status: newStatus });
      toast.success(`Payment marked as ${newStatus}`);
      loadApplicants();
    } catch {
      toast.error("Failed to update payment status");
    }
  };

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
      if (deleteType === "message")     { await adminApi.deleteContactMessage(selectedItem.id); toast.success("Deleted"); loadMessages(); }
      else if (deleteType === "appointment") { await adminApi.updateAppointmentStatus(selectedItem.id, "cancelled"); toast.success("Cancelled"); loadAppointments(); }
      else if (deleteType === "slot")   { await adminApi.deleteSlot(selectedItem.id); toast.success("Deleted"); loadSlots(); }
      else if (deleteType === "applicant") { await adminApi.deleteApplicant(selectedItem.id); toast.success("Deleted"); loadApplicants(); }
    } catch { toast.error("Delete failed"); }
    finally { setShowDeleteDialog(false); setSelectedItem(null); }
  };
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try { await adminApi.createSlot({ ...newSlot, is_active: true }); toast.success("Slot created"); setShowSlotDialog(false); setNewSlot({ date:"", start_time:"", end_time:"", service_type:"general_consultation", max_bookings:3 }); loadSlots(); }
    catch { toast.error("Failed to create slot"); }
  };
  const confirmDelete = (item, type) => { setSelectedItem(item); setDeleteType(type); setShowDeleteDialog(true); };

  const openApplicant = (app) => { setSelectedApplicant(app); setShowApplicantDialog(true); };

  if (!user?.is_staff) return null;
  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    </Layout>
  );

  const paidCount   = applicants.filter(a => a.payment_status === "paid").length;
  const unpaidCount = applicants.filter(a => a.payment_status !== "paid").length;

  return (
    <Layout>
      {/* Tab bar */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 lg:px-12">
          <nav className="flex gap-1 overflow-x-auto py-1.5">
            {[
              { value: "overview",     label: "Overview",     icon: LayoutDashboard },
              { value: "appointments", label: "Appointments", icon: Calendar },
              { value: "messages",     label: "Messages",     icon: MessageSquare, badge: unreadCount },
              { value: "applicants",   label: "Applicants",   icon: Users },
              { value: "slots",        label: "Time Slots",   icon: Clock },
            ].map(({ value, label, icon: Icon, badge }) => (
              <button key={value} onClick={() => setActiveTab(value)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                  activeTab === value
                    ? "bg-[#1e3a5f] text-white shadow-md shadow-[#1e3a5f]/20"
                    : "text-gray-600 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f]"
                }`}
              >
                <Icon className="w-4 h-4" />{label}
                {badge > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{badge}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea]">
        <div className="container mx-auto px-6 lg:px-12 pt-16 pb-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Admin</h1>
            <p className="text-gray-500 mt-1">Manage appointments, enquiries, and applicants</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Appointments", value: stats?.total || 0,    icon: Calendar,       color: "text-[#c9a962]" },
              { label: "Pending",            value: stats?.pending || 0,  icon: Clock,          color: "text-yellow-500" },
              { label: "Confirmed",          value: stats?.confirmed || 0,icon: CheckCircle,    color: "text-blue-500" },
              { label: "Completed",          value: stats?.completed || 0,icon: Check,          color: "text-green-500" },
              { label: "Fees Paid",          value: paidCount,            icon: ShieldCheck,    color: "text-green-600" },
              { label: "Fees Unpaid",        value: unpaidCount,          icon: AlertCircle,    color: "text-amber-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-0 rounded-3xl shadow-xl shadow-[#1e3a5f]/10">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold text-[#1e3a5f] mt-0.5">{value}</p></div>
                    <Icon className={`w-7 h-7 ${color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-[#1e3a5f]">Recent Appointments</h2></div>
                <div className="p-6 space-y-3">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl">
                      <div><p className="font-medium text-sm text-[#1e3a5f]">{apt.full_name}</p><p className="text-xs text-gray-500">{serviceLabels[apt.service_type] || apt.service_type}</p></div>
                      <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No appointments yet</p>}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-[#1e3a5f]">Recent Messages</h2></div>
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

          {/* ── Appointments ── */}
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
                        <td className="py-3 px-2">{apt.slot_details
                          ? <div><p className="text-[#1e3a5f]">{format(new Date(apt.slot_details.date), "MMM d, yyyy")}</p><p className="text-xs text-gray-400">{apt.slot_details.start_time}</p></div>
                          : <p>{format(new Date(apt.appointment_date), "MMM d, yyyy h:mm a")}</p>
                        }</td>
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

          {/* ── Messages ── */}
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

          {/* ── Applicants ── */}
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
                    <th className="py-3 px-2 font-medium">Visa</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-2 font-medium">Payment</th>
                    <th className="py-3 px-2 font-medium">Feedback</th>
                    <th className="py-3 px-2 font-medium">Applied</th>
                    <th className="py-3 px-2 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-[#faf8f5]">
                        <td className="py-3 px-2">
                          <p className="font-medium text-[#1e3a5f]">{app.first_name} {app.last_name}</p>
                          <p className="text-xs text-gray-400">{app.email}</p>
                          {app.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</p>}
                        </td>
                        <td className="py-3 px-2">{COUNTRY_LABELS[app.destination_country] || app.destination_country}</td>
                        <td className="py-3 px-2 text-gray-600 text-xs">{VISA_LABELS[app.visa_type] || app.visa_type}</td>
                        <td className="py-3 px-2"><Badge className={statusColors[app.status] || "bg-gray-100 text-gray-700"}>{app.status}</Badge></td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-1">
                            <PaymentBadge paymentStatus={app.payment_status} intentId={app.stripe_payment_intent_id} />
                            {app.payment_status !== "paid" && (
                              <button
                                onClick={() => handleUpdatePaymentStatus(app.id, "paid")}
                                className="text-xs text-green-600 hover:underline text-left"
                              >
                                + Mark paid
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {app.admin_notes
                            ? <span className="text-xs text-blue-600 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Sent</span>
                            : <span className="text-xs text-gray-300">—</span>
                          }
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-xs">{app.created_at ? format(new Date(app.created_at), "PP") : "-"}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openApplicant(app)} title="Review & Send Feedback">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => confirmDelete(app, "applicant")}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {applicants.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No applications yet</p>}
              </div>
            </div>
          )}

          {/* ── Slots ── */}
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

          {/* ── Applicant Detail + Feedback Dialog ── */}
          <ApplicantDetailDialog
            app={selectedApplicant}
            open={showApplicantDialog}
            onClose={() => { setShowApplicantDialog(false); setSelectedApplicant(null); }}
            onStatusChange={loadApplicants}
            onFeedbackSent={loadApplicants}
            onPaymentStatusChange={handleUpdatePaymentStatus}
          />

          {/* Delete Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={(o) => { if (!o) { setShowDeleteDialog(false); setSelectedItem(null); setDeleteType(""); } }}>
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