import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Send, Globe, GraduationCap, FileText, User, Mail, Phone,
  CalendarDays, Upload, X, Check, CreditCard, BookOpen, Eye, Loader2, ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/lib/AuthContext';
import { applicantsApi, documentsApi } from '@/api/djangoClient';
import { toast } from 'sonner';
import PhoneInput from '@/components/PhoneInput';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardElement, useStripe, useElements
} from '@stripe/react-stripe-js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const REQUIRED_DOCUMENTS = [
  { key: 'passport', label: 'Passport Copy', description: 'Clear copy of your passport bio page' },
  { key: 'photo', label: 'Passport Size Photo', description: 'Recent passport-sized photograph' },
  { key: 'academic', label: 'Academic Transcripts', description: 'Latest academic transcripts/certificates' },
  { key: 'english_test', label: 'Language Test Score', description: 'IELTS/TOEFL/JLPT score report (if available)' },
  { key: 'financial', label: 'Financial Documents', description: 'Bank statement or sponsor letter' },
  { key: 'cv', label: 'CV / Resume', description: 'Updated curriculum vitae' },
];

const STEPS = [
  { key: 'personal', label: 'Personal Details', icon: User },
  { key: 'program', label: 'Program Details', icon: GraduationCap },
  { key: 'documents', label: 'Documents', icon: Upload },
  { key: 'review', label: 'Review & Pay', icon: Eye },
];

const COUNTRY_LABELS = { japan: '🇯🇵 Japan', australia: '🇦🇺 Australia' };
const VISA_LABELS = {
  student_visa: 'Student Visa', work_visa: 'Work Visa', skilled_worker: 'Specified Skilled Worker',
  skilled_migration: 'Skilled Migration', working_holiday: 'Working Holiday',
};
const EDUCATION_LABELS = {
  high_school: 'High School', bachelors: "Bachelor's Degree", masters: "Master's Degree",
  phd: 'PhD', other: 'Other',
};

// ---------------------------------------------------------------------------
// Stripe setup — load once at module level, never inside a component
// ---------------------------------------------------------------------------
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe element shared style — matches the app's design system
const STRIPE_ELEMENT_STYLE = {
  base: {
    fontSize: '14px',
    color: '#1e3a5f',
    fontFamily: 'inherit',
    '::placeholder': { color: '#9ca3af' },
  },
  invalid: { color: '#ef4444' },
};

// ---------------------------------------------------------------------------
// PaymentForm — must be rendered inside <Elements>
// ---------------------------------------------------------------------------
function PaymentForm({ applicantId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [cardReady, setCardReady] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleCardReady = () => {
    setCardReady(true);
  };

  const handlePay = async () => {
    if (!stripe || !elements) {
      setCardError('Stripe is not ready yet. Please wait a moment and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card field not found. Please refresh the page and try again.');
      console.error('[PaymentForm] elements.getElement(CardElement) returned null');
      return;
    }

    setPaying(true);
    setCardError(null);

    try {
      // 1. Get JWT token
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('[PaymentForm] token found:', !!accessToken);

      // 2. Create PaymentIntent on backend
      const res = await fetch('/api/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ applicant_id: applicantId }),
      });

      const data = await res.json();
      console.log('[PaymentIntent response]', res.status, data);

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Could not initialise payment. Please try again.');
      }

      // 3. Confirm card payment
      console.log('[PaymentForm] confirming card payment with cardElement:', cardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        console.error('[Stripe confirmCardPayment error]', error.type, error.code, error.message);
        setCardError(error.message);
        onError?.(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('[PaymentForm] payment succeeded:', paymentIntent.id);

        // Tell our backend to verify with Stripe and mark payment_status = "paid"
        try {
          const confirmRes = await fetch('/api/confirm-payment/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
              payment_intent_id: paymentIntent.id,
              applicant_id: applicantId,
            }),
          });
          const confirmData = await confirmRes.json();
          console.log('[confirm-payment response]', confirmRes.status, confirmData);
          if (!confirmRes.ok) {
            console.error('[confirm-payment failed]', confirmData);
          }
        } catch (confirmErr) {
          // Non-fatal — payment succeeded, DB update failed. Webhook will fix it.
          console.error('[confirm-payment fetch error]', confirmErr);
        }

        onSuccess(paymentIntent.id);
      } else {
        console.warn('[Stripe unexpected status]', paymentIntent.status);
        setCardError('Payment could not be completed. Please try again.');
      }
    } catch (err) {
      console.error('[PaymentForm catch]', err);
      setCardError(err.message || 'Payment failed. Please try again.');
      onError?.(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1e3a5f] ml-1">Card Details</label>
        <div className="border border-gray-200 rounded-xl bg-[#faf8f5] px-4 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c9a962]/20 focus-within:border-[#c9a962] transition-all">
          <CardElement
            options={{
              style: STRIPE_ELEMENT_STYLE,
              hidePostalCode: true,
            }}
            onChange={handleCardChange}
            onReady={handleCardReady}
          />
        </div>
      </div>

      {!cardReady && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading card field…
        </div>
      )}

      {cardError && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <X className="w-4 h-4 shrink-0" />
          {cardError}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        Payments are encrypted and processed securely via Stripe. We never store your card details.
      </div>

      <Button
        type="button"
        disabled={!stripe || paying || !cardComplete || !cardReady}
        onClick={handlePay}
        className="w-full h-12 rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-semibold text-sm disabled:opacity-50"
      >
        {paying ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing payment…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pay $25.00 USD
          </span>
        )}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main NewApplication component
// ---------------------------------------------------------------------------
export default function NewApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // applicantId is set after the application is saved to the backend,
  // so the PaymentForm can pass it to create-payment-intent
  const [applicantId, setApplicantId] = useState(null);

  // paymentStatus: 'idle' | 'pending' | 'succeeded' | 'failed'
  const [paymentStatus, setPaymentStatus] = useState('idle');

  const fileInputRefs = useRef({});

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    destination_country: '',
    visa_type: '',
    education_level: '',
    preferred_course: '',
    preferred_start_date: '',
    message: '',
  });

  const [documents, setDocuments] = useState({});

  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------
  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'destination_country') updated.visa_type = '';
      return updated;
    });
  };

  const handleFileSelect = (docKey, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setDocuments(prev => ({
      ...prev,
      [docKey]: prev[docKey] ? [...prev[docKey], file] : [file],
    }));
  };

  const removeFile = (docKey) => {
    setDocuments(prev => { const u = { ...prev }; delete u[docKey]; return u; });
  };

  const removeSingleFile = (docKey, idx) => {
    setDocuments(prev => {
      const u = { ...prev };
      if (Array.isArray(u[docKey])) {
        u[docKey] = u[docKey].filter((_, i) => i !== idx);
        if (u[docKey].length === 0) delete u[docKey];
      }
      return u;
    });
  };

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      if (!form.first_name || !form.last_name || !form.email || !form.phone) {
        toast.error('Please fill in all required personal details');
        return false;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    if (stepIndex === 1) {
      if (!form.destination_country || !form.visa_type) {
        toast.error('Please select destination country and visa type');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  // -------------------------------------------------------------------------
  // Step 1: Save application to backend (before payment)
  // -------------------------------------------------------------------------
  const saveApplication = async () => {
    if (applicantId) return applicantId; // already saved — reuse

    setSubmitting(true);
    try {
      const applicationData = { ...form };
      if (!applicationData.preferred_start_date) delete applicationData.preferred_start_date;

      const response = await applicantsApi.create(applicationData);
      const id = response.data.id;
      setApplicantId(id);

      // Upload documents straight away so they're attached before payment
      for (const [docKey, files] of Object.entries(documents)) {
        const docLabel = REQUIRED_DOCUMENTS.find(d => d.key === docKey)?.label || docKey;
        if (Array.isArray(files)) {
          for (const file of files) {
            const fd = new FormData();
            fd.append('applicant', id);
            fd.append('title', docLabel);
            fd.append('file', file);
            await documentsApi.upload(fd);
          }
        }
      }

      return id;
    } catch (error) {
      const msg = error.response?.data;
      const firstError = msg && typeof msg === 'object'
        ? Object.values(msg).flat()[0]
        : 'Failed to save application';
      toast.error(firstError);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Step 2: Called by PaymentForm after Stripe confirms payment
  // -------------------------------------------------------------------------
  const handlePaymentSuccess = async (paymentIntentId) => {
    setPaymentStatus('succeeded');
    toast.success('Payment successful! Your application has been submitted.');
    // Small delay so the success state is visible before redirect
    setTimeout(() => navigate('/Dashboard'), 2000);
  };

  const handlePaymentError = (message) => {
    setPaymentStatus('failed');
    toast.error(message || 'Payment failed. Please try again.');
  };

  // Called when user clicks "Proceed to Payment" on the review step
  const handleProceedToPayment = async () => {
    try {
      await saveApplication();
      setPaymentStatus('pending');
    } catch {
      // error already toasted inside saveApplication
    }
  };

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------
  const visaTypes = form.destination_country ? VISA_TYPES_BY_COUNTRY[form.destination_country] : [];
  const uploadedCount = Object.keys(documents).length;
  const inputClass = "h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]";

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div>
      <div className="max-w-2xl mx-auto relative z-10">
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
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">New Application</h1>
                <p className="text-white/70 text-sm mt-1">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
              </div>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = i === step;
                const isCompleted = i < step;
                return (
                  <div key={s.key} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full h-1.5 rounded-full transition-all ${
                      isCompleted ? 'bg-[#c9a962]' : isActive ? 'bg-white' : 'bg-white/20'
                    }`} />
                    <div className="flex items-center gap-1.5">
                      <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isCompleted ? 'text-[#c9a962]' : 'text-white/40'}`} />
                      <span className={`text-xs hidden sm:inline ${isActive ? 'text-white font-medium' : isCompleted ? 'text-[#c9a962]' : 'text-white/40'}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── Step 0: Personal Details ── */}
              {step === 0 && (
                <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1e3a5f] text-lg">Personal Details</h3>
                      <p className="text-sm text-gray-500">Pre-filled from your account</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1e3a5f] ml-1">First Name <span className="text-red-500">*</span></label>
                      <Input value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1e3a5f] ml-1">Last Name <span className="text-red-500">*</span></label>
                      <Input value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={`pl-12 ${inputClass}`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Phone Number <span className="text-red-500">*</span></label>
                    <PhoneInput value={form.phone} onChange={(val) => handleChange('phone', val)} />
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Program Details ── */}
              {step === 1 && (
                <motion.div key="program" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#c9a962]/10 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#c9a962]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1e3a5f] text-lg">Program Details</h3>
                      <p className="text-sm text-gray-500">Tell us about your study/work plan</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Destination Country <span className="text-red-500">*</span></label>
                    <Select value={form.destination_country} onValueChange={v => handleChange('destination_country', v)}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Select your destination" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="japan">🇯🇵 Japan</SelectItem>
                        <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Visa Type <span className="text-red-500">*</span></label>
                    <Select value={form.visa_type} onValueChange={v => handleChange('visa_type', v)} disabled={!form.destination_country}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={form.destination_country ? "Select visa type" : "Select a country first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {visaTypes.map(vt => <SelectItem key={vt.value} value={vt.value}>{vt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Preferred Course / Program</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input value={form.preferred_course} onChange={e => handleChange('preferred_course', e.target.value)} placeholder="e.g., Computer Science, Business Administration" className={`pl-12 ${inputClass}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1e3a5f] ml-1">Education Level</label>
                      <Select value={form.education_level} onValueChange={v => handleChange('education_level', v)}>
                        <SelectTrigger className={inputClass}><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {EDUCATION_LEVELS.map(el => <SelectItem key={el.value} value={el.value}>{el.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1e3a5f] ml-1">Preferred Start Date</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <Input type="date" value={form.preferred_start_date} onChange={e => handleChange('preferred_start_date', e.target.value)} className={`pl-12 ${inputClass}`} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1e3a5f] ml-1">Additional Notes</label>
                    <Textarea value={form.message} onChange={e => handleChange('message', e.target.value)} placeholder="Tell us about your goals, universities you're interested in, or questions..." rows={3} className="rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962]" />
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Documents ── */}
              {step === 2 && (
                <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Upload className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1e3a5f] text-lg">Upload Documents</h3>
                      <p className="text-sm text-gray-500">PDF, JPG, PNG — max 10MB each</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {REQUIRED_DOCUMENTS.map(doc => {
                      const files = documents[doc.key] || [];
                      return (
                        <div key={doc.key} className={`border rounded-xl p-4 transition-all ${files.length > 0 ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-[#faf8f5]'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {files.length > 0 ? <Check className="w-4 h-4 text-green-600 shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 shrink-0" />}
                                <span className="font-medium text-sm text-[#1e3a5f]">{doc.label}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 ml-6">{doc.description}</p>
                              {files.length > 0 && (
                                <ul className="ml-6 mt-1 space-y-1">
                                  {files.map((file, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-green-700">
                                      {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                      <button type="button" onClick={() => removeSingleFile(doc.key, idx)} className="text-red-400 hover:text-red-600 transition-colors">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <input ref={el => fileInputRefs.current[doc.key] = el} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileSelect(doc.key, e.target.files[0])} />
                              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRefs.current[doc.key]?.click()} className="text-xs h-8 rounded-lg">Add File</Button>
                              {files.length > 0 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(doc.key)} className="text-xs h-8 rounded-lg text-red-400 hover:text-red-600">Remove All</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                    <strong>Note:</strong> You can upload documents now or add them later from your dashboard.
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Review & Pay ── */}
              {step === 3 && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                  {/* Payment success state */}
                  {paymentStatus === 'succeeded' ? (
                    <div className="flex flex-col items-center gap-4 py-10 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1e3a5f]">Application Submitted!</h3>
                      <p className="text-sm text-gray-500">Payment confirmed. Redirecting you to your dashboard…</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#c9a962]/10 rounded-xl flex items-center justify-center">
                          <Eye className="w-5 h-5 text-[#c9a962]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1e3a5f] text-lg">Review Your Application</h3>
                          <p className="text-sm text-gray-500">Please verify all details before submitting</p>
                        </div>
                      </div>

                      {/* Personal Details Review */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
                          <h4 className="font-medium text-[#1e3a5f] text-sm flex items-center gap-2"><User className="w-4 h-4" /> Personal Details</h4>
                          <button type="button" onClick={() => setStep(0)} className="text-xs text-[#c9a962] hover:underline font-medium">Edit</button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">Name</span><p className="font-medium text-[#1e3a5f]">{form.first_name} {form.last_name}</p></div>
                          <div><span className="text-gray-500">Email</span><p className="font-medium text-[#1e3a5f]">{form.email}</p></div>
                          <div><span className="text-gray-500">Phone</span><p className="font-medium text-[#1e3a5f]">{form.phone}</p></div>
                        </div>
                      </div>

                      {/* Program Details Review */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
                          <h4 className="font-medium text-[#1e3a5f] text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Program Details</h4>
                          <button type="button" onClick={() => setStep(1)} className="text-xs text-[#c9a962] hover:underline font-medium">Edit</button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">Destination</span><p className="font-medium text-[#1e3a5f]">{COUNTRY_LABELS[form.destination_country] || '—'}</p></div>
                          <div><span className="text-gray-500">Visa Type</span><p className="font-medium text-[#1e3a5f]">{VISA_LABELS[form.visa_type] || '—'}</p></div>
                          {form.preferred_course && <div><span className="text-gray-500">Course</span><p className="font-medium text-[#1e3a5f]">{form.preferred_course}</p></div>}
                          {form.education_level && <div><span className="text-gray-500">Education</span><p className="font-medium text-[#1e3a5f]">{EDUCATION_LABELS[form.education_level]}</p></div>}
                          {form.preferred_start_date && <div><span className="text-gray-500">Start Date</span><p className="font-medium text-[#1e3a5f]">{form.preferred_start_date}</p></div>}
                          {form.message && <div className="col-span-2"><span className="text-gray-500">Notes</span><p className="font-medium text-[#1e3a5f]">{form.message}</p></div>}
                        </div>
                      </div>

                      {/* Documents Review */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
                          <h4 className="font-medium text-[#1e3a5f] text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Documents ({uploadedCount}/{REQUIRED_DOCUMENTS.length})</h4>
                          <button type="button" onClick={() => setStep(2)} className="text-xs text-[#c9a962] hover:underline font-medium">Edit</button>
                        </div>
                        <div className="p-4 space-y-2 text-sm">
                          {REQUIRED_DOCUMENTS.map(doc => (
                            <div key={doc.key} className="flex items-center gap-2">
                              {documents[doc.key] ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-300" />}
                              <span className={documents[doc.key] ? 'text-[#1e3a5f]' : 'text-gray-400'}>{doc.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment section */}
                      <div className="border border-[#c9a962]/30 bg-[#c9a962]/5 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#c9a962]/20">
                          <h4 className="font-medium text-[#1e3a5f] text-sm flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#c9a962]" /> Processing Fee — $25.00 USD
                          </h4>
                        </div>
                        <div className="p-4">
                          {paymentStatus === 'idle' && (
                            <>
                              <p className="text-xs text-gray-500 mb-4">
                                A non-refundable processing fee is required to submit your application. Your application details will be saved first, then payment collected.
                              </p>
                              <Button
                                type="button"
                                onClick={handleProceedToPayment}
                                disabled={submitting}
                                className="w-full h-12 rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-semibold"
                              >
                                {submitting ? (
                                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving application…</span>
                                ) : (
                                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Save & Proceed to Payment</span>
                                )}
                              </Button>
                            </>
                          )}

                          {/* Payment form — only shown after application is saved */}
                          {paymentStatus === 'pending' && applicantId && (
                            <Elements stripe={stripePromise}>
                              <PaymentForm
                                applicantId={applicantId}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                              />
                            </Elements>
                          )}

                          {paymentStatus === 'failed' && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <X className="w-4 h-4 shrink-0" /> Payment failed. You can try again below.
                              </div>
                              <Elements stripe={stripePromise}>
                                <PaymentForm
                                  applicantId={applicantId}
                                  onSuccess={handlePaymentSuccess}
                                  onError={handlePaymentError}
                                />
                              </Elements>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons — hidden on final step once payment flow has started */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 0 && paymentStatus === 'idle' ? (
                <Button type="button" variant="outline" onClick={prevStep} className="rounded-xl h-12 px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : <div />}

              {step < STEPS.length - 1 && (
                <Button type="button" onClick={nextStep} className="rounded-xl h-12 px-8 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}