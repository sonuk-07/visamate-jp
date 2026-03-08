import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar, User, FileText, Clock, CheckCircle, XCircle, Plus,
  MapPin, GraduationCap, Globe, MessageSquare, Loader2,
  CreditCard, ShieldCheck, ExternalLink, Pencil, Upload,
  X, Check, ArrowLeft, Save, BookOpen, CalendarDays, Phone,
  Mail, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/AuthContext";
import { applicantsApi, documentsApi } from "@/api/djangoClient";
import { useWebSocket } from "@/lib/WebSocketContext";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: "applied",        label: "Applied",        icon: FileText },
  { key: "reviewing",      label: "Under Review",   icon: Clock },
  { key: "interview",      label: "Interview",      icon: User },
  { key: "visa_processing",label: "Visa Processing",icon: Globe },
  { key: "approved",       label: "Approved",       icon: CheckCircle },
];

const COUNTRY_LABELS = { japan: "🇯🇵 Japan", australia: "🇦🇺 Australia" };
const VISA_TYPES_BY_COUNTRY = {
  japan: [
    { value: "student_visa",  label: "Student Visa" },
    { value: "work_visa",     label: "Work Visa" },
    { value: "skilled_worker",label: "Specified Skilled Worker" },
  ],
  australia: [
    { value: "student_visa",     label: "Student Visa" },
    { value: "skilled_migration",label: "Skilled Migration" },
    { value: "working_holiday",  label: "Working Holiday" },
  ],
};
const VISA_LABELS = {
  student_visa:"Student Visa", work_visa:"Work Visa",
  skilled_worker:"Specified Skilled Worker",
  skilled_migration:"Skilled Migration", working_holiday:"Working Holiday",
};
const EDUCATION_LEVELS = [
  { value:"high_school", label:"High School" },
  { value:"bachelors",   label:"Bachelor's Degree" },
  { value:"masters",     label:"Master's Degree" },
  { value:"phd",         label:"PhD" },
  { value:"other",       label:"Other" },
];
const REQUIRED_DOCUMENTS = [
  { key:"passport",     label:"Passport Copy",        description:"Clear copy of your passport bio page" },
  { key:"photo",        label:"Passport Size Photo",  description:"Recent passport-sized photograph" },
  { key:"academic",     label:"Academic Transcripts", description:"Latest academic transcripts/certificates" },
  { key:"english_test", label:"Language Test Score",  description:"IELTS/TOEFL/JLPT score report" },
  { key:"financial",    label:"Financial Documents",  description:"Bank statement or sponsor letter" },
  { key:"cv",           label:"CV / Resume",          description:"Updated curriculum vitae" },
];
const STATUS_CONFIG = {
  applied:        { label:"Applied",             className:"bg-blue-100 text-blue-800" },
  reviewing:      { label:"Under Review",        className:"bg-yellow-100 text-yellow-800" },
  interview:      { label:"Interview Scheduled", className:"bg-purple-100 text-purple-800" },
  visa_processing:{ label:"Visa Processing",     className:"bg-orange-100 text-orange-800" },
  approved:       { label:"Approved",            className:"bg-green-100 text-green-800" },
  rejected:       { label:"Rejected",            className:"bg-red-100 text-red-800" },
};

// Statuses where user is allowed to edit their application
const EDITABLE_STATUSES = ["applied", "reviewing", "rejected"];

const inputClass = "h-11 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]";

// ─── Payment Receipt ──────────────────────────────────────────────────────────
function PaymentReceipt({ application }) {
  const { payment_status, stripe_payment_intent_id } = application;
  if (!payment_status || payment_status === "unpaid") {
    return (
      <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-sm text-amber-700 font-medium">Processing fee not yet paid</span>
      </div>
    );
  }
  if (payment_status === "paid") {
    return (
      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm font-semibold text-green-700">Processing Fee Paid — $25.00 USD</span>
          </div>
          <Badge className="bg-green-100 text-green-700 text-xs">Paid</Badge>
        </div>
        {stripe_payment_intent_id && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <p className="text-xs text-green-600 font-mono truncate">Ref: {stripe_payment_intent_id}</p>
            <a
              href={`https://dashboard.stripe.com/test/payments/${stripe_payment_intent_id}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-green-700 hover:underline shrink-0"
            >
              View receipt <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }
  if (payment_status === "refunded") {
    return (
      <div className="mt-4 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500">Processing fee refunded</span>
        {stripe_payment_intent_id && (
          <span className="text-xs text-gray-400 font-mono ml-auto truncate">Ref: {stripe_payment_intent_id}</span>
        )}
      </div>
    );
  }
  return null;
}

// ─── Edit Application Modal ───────────────────────────────────────────────────
function EditApplicationModal({ application, onClose, onSaved }) {
  const fileInputRefs = useRef({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // "info" | "documents"

  const [form, setForm] = useState({
    first_name:          application.first_name || "",
    last_name:           application.last_name || "",
    email:               application.email || "",
    phone:               application.phone || "",
    destination_country: application.destination_country || "",
    visa_type:           application.visa_type || "",
    education_level:     application.education_level || "",
    preferred_course:    application.preferred_course || "",
    preferred_start_date:application.preferred_start_date || "",
    message:             application.message || "",
  });

  // New files to upload — keyed by doc type
  const [newFiles, setNewFiles] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => {
      const u = { ...prev, [field]: value };
      if (field === "destination_country") u.visa_type = "";
      return u;
    });
  };

  const handleFileSelect = (docKey, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }
    setNewFiles(prev => ({ ...prev, [docKey]: file }));
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      // 1. Update application info
      const payload = { ...form };
      if (!payload.preferred_start_date) delete payload.preferred_start_date;
      await applicantsApi.update(application.id, payload);

      // 2. Upload any new documents
      for (const [docKey, file] of Object.entries(newFiles)) {
        const docLabel = REQUIRED_DOCUMENTS.find(d => d.key === docKey)?.label || docKey;
        const fd = new FormData();
        fd.append("applicant", application.id);
        fd.append("title", docLabel);
        fd.append("file", file);
        await documentsApi.upload(fd);
      }

      toast.success("Application updated successfully");
      onSaved();
      onClose();
    } catch (err) {
      const msg = err?.response?.data;
      const firstError = msg && typeof msg === "object"
        ? Object.values(msg).flat()[0]
        : "Failed to update application";
      toast.error(firstError);
    } finally {
      setSaving(false);
    }
  };

  const visaTypes = form.destination_country ? VISA_TYPES_BY_COUNTRY[form.destination_country] || [] : [];
  const existingDocs = application.documents || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Edit Application</h2>
              <p className="text-white/60 text-xs">Address the feedback and update your details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[
            { key: "info",      label: "Application Info", icon: FileText },
            { key: "documents", label: "Documents",        icon: Upload },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === key
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-gray-500 hover:text-[#1e3a5f]"
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <AnimatePresence mode="wait">

            {/* ── Info Tab ── */}
            {activeTab === "info" && (
              <motion.div key="info" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1e3a5f] ml-1">First Name <span className="text-red-500">*</span></label>
                    <Input value={form.first_name} onChange={e => handleChange("first_name", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1e3a5f] ml-1">Last Name <span className="text-red-500">*</span></label>
                    <Input value={form.last_name} onChange={e => handleChange("last_name", e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1e3a5f] ml-1">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} className={`pl-10 ${inputClass}`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1e3a5f] ml-1">Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={form.phone} onChange={e => handleChange("phone", e.target.value)} className={`pl-10 ${inputClass}`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1e3a5f] ml-1">Destination Country</label>
                  <Select value={form.destination_country} onValueChange={v => handleChange("destination_country", v)}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="japan">🇯🇵 Japan</SelectItem>
                      <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1e3a5f] ml-1">Visa Type</label>
                  <Select value={form.visa_type} onValueChange={v => handleChange("visa_type", v)} disabled={!form.destination_country}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={form.destination_country ? "Select visa type" : "Select country first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {visaTypes.map(vt => <SelectItem key={vt.value} value={vt.value}>{vt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1e3a5f] ml-1">Education Level</label>
                    <Select value={form.education_level} onValueChange={v => handleChange("education_level", v)}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map(el => <SelectItem key={el.value} value={el.value}>{el.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1e3a5f] ml-1">Preferred Start Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input type="date" value={form.preferred_start_date} onChange={e => handleChange("preferred_start_date", e.target.value)} className={`pl-10 ${inputClass}`} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1e3a5f] ml-1">Preferred Course</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={form.preferred_course} onChange={e => handleChange("preferred_course", e.target.value)} placeholder="e.g. Computer Science" className={`pl-10 ${inputClass}`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1e3a5f] ml-1">Additional Notes</label>
                  <Textarea value={form.message} onChange={e => handleChange("message", e.target.value)} rows={3} placeholder="Any additional information..." className="rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] text-sm" />
                </div>
              </motion.div>
            )}

            {/* ── Documents Tab ── */}
            {activeTab === "documents" && (
              <motion.div key="docs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                {/* Existing documents */}
                {existingDocs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Already Submitted ({existingDocs.length})
                    </p>
                    <div className="space-y-2">
                      {existingDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1e3a5f] truncate">{doc.title}</p>
                          </div>
                          <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">View</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new / replacement documents */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Upload New / Updated Documents
                  </p>
                  <div className="space-y-3">
                    {REQUIRED_DOCUMENTS.map(doc => {
                      const file = newFiles[doc.key];
                      return (
                        <div key={doc.key} className={`border rounded-xl p-3.5 transition-all ${file ? "border-green-300 bg-green-50/50" : "border-gray-200 bg-[#faf8f5]"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {file ? <Check className="w-4 h-4 text-green-600 shrink-0" /> : <Upload className="w-4 h-4 text-gray-400 shrink-0" />}
                                <span className="text-sm font-medium text-[#1e3a5f]">{doc.label}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 ml-6">{doc.description}</p>
                              {file && (
                                <p className="text-xs text-green-700 ml-6 mt-1 flex items-center gap-1">
                                  {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                  <button type="button" onClick={() => setNewFiles(prev => { const u = {...prev}; delete u[doc.key]; return u; })}>
                                    <X className="w-3 h-3 text-red-400 hover:text-red-600" />
                                  </button>
                                </p>
                              )}
                            </div>
                            <div>
                              <input
                                ref={el => fileInputRefs.current[doc.key] = el}
                                type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                                onChange={e => handleFileSelect(doc.key, e.target.files[0])}
                              />
                              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRefs.current[doc.key]?.click()} className="text-xs h-8 rounded-lg">
                                {file ? "Replace" : "Upload"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-8">
            {saving
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
              : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
            }
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────
function ApplicationCard({ application, onEdit }) {
  const statusOrder = ["applied", "reviewing", "interview", "visa_processing", "approved"];
  const currentIndex = statusOrder.indexOf(application.status);
  const isRejected = application.status === "rejected";
  const canEdit = EDITABLE_STATUSES.includes(application.status);
  const hasFeedback = !!application.admin_notes;
  const config = STATUS_CONFIG[application.status] || { label: application.status, className: "bg-gray-100 text-gray-800" };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`rounded-3xl shadow-xl shadow-[#1e3a5f]/10 border-0 ${isRejected ? "!border !border-red-200" : ""}`}>
        <CardContent className="p-6">
          {/* Header */}
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
                  Applied {format(new Date(application.created_at), "PP")}
                </span>
                {application.preferred_start_date && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Start: {format(new Date(application.preferred_start_date), "PP")}
                  </span>
                )}
              </div>
            </div>

            {/* Edit button — shown when status allows editing */}
            {canEdit && (
              <Button
                onClick={() => onEdit(application)}
                variant="outline"
                size="sm"
                className={`shrink-0 rounded-xl gap-2 ${
                  hasFeedback
                    ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                    : "border-gray-200 text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                {hasFeedback ? "Edit & Resubmit" : "Edit Application"}
              </Button>
            )}
          </div>

          {/* Feedback banner — prominent when admin has left notes */}
          {hasFeedback && (
            <div className={`mb-4 rounded-xl p-4 border ${isRejected ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <div className={`flex items-center gap-2 font-semibold text-sm mb-2 ${isRejected ? "text-red-700" : "text-amber-700"}`}>
                <AlertTriangle className="w-4 h-4" />
                Feedback from VisaMate — Action Required
              </div>
              <p className={`text-sm leading-relaxed ${isRejected ? "text-red-600" : "text-amber-700"}`}>
                {application.admin_notes}
              </p>
              {canEdit && (
                <button
                  onClick={() => onEdit(application)}
                  className={`mt-3 text-xs font-semibold flex items-center gap-1.5 ${isRejected ? "text-red-600 hover:text-red-800" : "text-amber-700 hover:text-amber-900"}`}
                >
                  <Pencil className="w-3 h-3" /> Click here to edit your application and resubmit →
                </button>
              )}
            </div>
          )}

          {/* Status progress */}
          {isRejected ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <XCircle className="w-5 h-5" /> Application Rejected
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Desktop */}
              <div className="hidden md:flex items-center justify-between mb-2">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative">
                      {index > 0 && (
                        <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-0 ${index <= currentIndex ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${isCurrent ? "bg-[#1e3a5f] text-white ring-4 ring-[#1e3a5f]/20" : isCompleted ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-400"}`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs mt-2 text-center ${isCurrent ? "font-semibold text-[#1e3a5f]" : isCompleted ? "text-[#1e3a5f]" : "text-gray-400"}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step.key} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? "bg-[#1e3a5f]/5" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-400"}`}>
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-sm ${isCurrent ? "font-semibold text-[#1e3a5f]" : isCompleted ? "text-[#1e3a5f]" : "text-gray-400"}`}>{step.label}</span>
                      {isCurrent && <Badge className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs ml-auto">Current</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment receipt */}
          <PaymentReceipt application={application} />

          <p className="text-xs text-gray-400 mt-4">
            Last updated: {format(new Date(application.updated_at), "PPP p")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicantsApi.list();
      const data = res.data;
      setApplications(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchApplications();
  }, [user, navigate, fetchApplications]);

  useWebSocket("application_update", () => {
    toast.info("Your application status was updated");
    fetchApplications();
  });

  if (!user) return null;

  const inProgress = applications.filter(a => !["approved", "rejected"].includes(a.status));
  const completed  = applications.filter(a =>  ["approved", "rejected"].includes(a.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Applications</h1>
        <Button onClick={() => navigate("/NewApplication")} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> New Application
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
          <Button onClick={() => navigate("/NewApplication")} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> New Application
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">In Progress ({inProgress.length})</h2>
            {inProgress.length === 0
              ? <p className="text-sm text-gray-400">No applications in progress</p>
              : <div className="space-y-4">{inProgress.map(app => <ApplicationCard key={app.id} application={app} onEdit={setEditingApp} />)}</div>
            }
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Completed ({completed.length})</h2>
            {completed.length === 0
              ? <p className="text-sm text-gray-400">No completed applications</p>
              : <div className="space-y-4">{completed.map(app => <ApplicationCard key={app.id} application={app} onEdit={setEditingApp} />)}</div>
            }
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingApp && (
          <EditApplicationModal
            application={editingApp}
            onClose={() => setEditingApp(null)}
            onSaved={fetchApplications}
          />
        )}
      </AnimatePresence>
    </div>
  );
}