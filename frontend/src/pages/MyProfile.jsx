import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff, Save, Loader2,
  Phone, Globe, FileText, Upload, Trash2, Download, Calendar, MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/lib/AuthContext';
import { authApi, userDocumentsApi } from '@/api/djangoClient';
import { toast } from 'sonner';

const SIDEBAR_SECTIONS = [
  { key: 'personal', label: 'Personal Information' },
  { key: 'additional_info', label: 'Additional Information' },
  { key: 'documents', label: 'My Documents' },
  { key: 'change_password', label: 'Change Password' },
];

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'academic_transcript', label: 'Academic Transcript' },
  { value: 'language_certificate', label: 'Language Certificate' },
  { value: 'resume', label: 'Resume / CV' },
  { value: 'photo', label: 'Photo' },
  { value: 'other', label: 'Other' },
];

export default function MyProfile() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(() => {
    const tab = searchParams.get('tab');
    const validTabs = SIDEBAR_SECTIONS.map(s => s.key);
    return validTabs.includes(tab) ? tab : 'personal';
  });
  const [loading, setLoading] = useState(false);
  const [additionalLoading, setAdditionalLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ document_type: 'passport', title: '', file: null });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [additionalData, setAdditionalData] = useState({
    phone: '',
    date_of_birth: '',
    nationality: '',
    passport_number: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const fetchDocuments = useCallback(async () => {
    setDocsLoading(true);
    try {
      const res = await userDocumentsApi.list();
      setDocuments(res.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTabs = SIDEBAR_SECTIONS.map(s => s.key);
    if (tab && validTabs.includes(tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
    });
    setAdditionalData({
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      nationality: user.nationality || '',
      passport_number: user.passport_number || '',
      address: user.address || '',
    });
  }, [user, navigate]);

  useEffect(() => {
    if (activeSection === 'documents' && user) {
      fetchDocuments();
    }
  }, [activeSection, user, fetchDocuments]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdditionalChange = (e) => {
    setAdditionalData({ ...additionalData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (error) {
      const msg = error.response?.data;
      if (msg?.email) {
        toast.error(msg.email[0]);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdditionalSubmit = async (e) => {
    e.preventDefault();
    setAdditionalLoading(true);
    try {
      await authApi.updateProfile(additionalData);
      await checkAuth();
      toast.success('Additional information updated');
    } catch {
      toast.error('Failed to update additional information');
    } finally {
      setAdditionalLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }
    if (uploadForm.file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    if (!uploadForm.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append('document_type', uploadForm.document_type);
      fd.append('title', uploadForm.title.trim());
      fd.append('file', uploadForm.file);
      await userDocumentsApi.upload(fd);
      toast.success('Document uploaded successfully');
      setUploadForm({ document_type: 'passport', title: '', file: null });
      // Reset file input
      const fileInput = document.getElementById('doc-file-input');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDocumentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await userDocumentsApi.delete(id);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      const msg = error.response?.data?.error;
      toast.error(msg || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  const inputClass = "h-11 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-[#1e3a5f]/10 focus:border-[#1e3a5f]";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">My Profile</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 shrink-0">
          <nav className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 overflow-hidden">
            {SIDEBAR_SECTIONS.map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeSection === section.key
                    ? 'bg-[#1e3a5f]/5 text-[#1e3a5f] border-l-[3px] border-l-[#1e3a5f]'
                    : 'text-gray-600 hover:bg-gray-50 border-l-[3px] border-l-transparent'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              <div className="flex-1">
                <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 p-6">
                  <h2 className="text-lg font-semibold text-[#1e3a5f] mb-1">Personal Information</h2>
                  <p className="text-sm text-gray-500 mb-6">View & update your personal information</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <Input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter your first name" className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <Input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter your last name" className={inputClass} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className={inputClass} />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" disabled={loading} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg h-11 px-6">
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Profile Card */}
              <div className="lg:w-72 shrink-0">
                <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {(user.first_name || user.email || '?')[0].toUpperCase()}
                    {(user.last_name || '')[0]?.toUpperCase() || ''}
                  </div>
                  <h3 className="font-semibold text-[#1e3a5f] mb-0.5">
                    Hello {user.first_name || 'there'},
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Welcome to your VisaMate profile. Update your information to keep your account current.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-[#c9a962]" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-[#c9a962]" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.nationality && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4 text-[#c9a962]" />
                        <span>{user.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Additional Information */}
          {activeSection === 'additional_info' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 p-6">
                <h2 className="text-lg font-semibold text-[#1e3a5f] mb-1">Additional Information</h2>
                <p className="text-sm text-gray-500 mb-6">Provide extra details to speed up your applications</p>

                <form onSubmit={handleAdditionalSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input name="phone" value={additionalData.phone} onChange={handleAdditionalChange} placeholder="+81 XX-XXXX-XXXX" className={`pl-10 ${inputClass}`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input name="date_of_birth" type="date" value={additionalData.date_of_birth} onChange={handleAdditionalChange} className={`pl-10 ${inputClass}`} />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nationality</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input name="nationality" value={additionalData.nationality} onChange={handleAdditionalChange} placeholder="e.g. Japanese" className={`pl-10 ${inputClass}`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Passport Number</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input name="passport_number" value={additionalData.passport_number} onChange={handleAdditionalChange} placeholder="e.g. AB1234567" className={`pl-10 ${inputClass}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={additionalData.address}
                        onChange={handleAdditionalChange}
                        placeholder="Enter your full address"
                        rows={3}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1e3a5f]/10 focus:border-[#1e3a5f] text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={additionalLoading} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg h-11 px-6">
                      {additionalLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Information</>}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Documents */}
          {activeSection === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Upload Form */}
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 p-6">
                <h2 className="text-lg font-semibold text-[#1e3a5f] mb-1">Upload Document</h2>
                <p className="text-sm text-gray-500 mb-6">Upload important documents like passport, ID, or certificates</p>

                <form onSubmit={handleDocumentUpload} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Document Type</label>
                      <select
                        value={uploadForm.document_type}
                        onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-[#1e3a5f]/10 focus:border-[#1e3a5f]"
                      >
                        {DOCUMENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Document Title</label>
                      <Input
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="e.g. My Passport Copy"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">File</label>
                    <input
                      id="doc-file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] || null })}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1e3a5f]/5 file:text-[#1e3a5f] file:font-medium hover:file:bg-[#1e3a5f]/10 file:cursor-pointer"
                    />
                    <p className="text-xs text-gray-400">PDF, JPG, PNG, DOC, DOCX (max 10MB)</p>
                  </div>

                  <div className="pt-1">
                    <Button type="submit" disabled={uploadLoading} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg h-11 px-6">
                      {uploadLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Document</>}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 p-6">
                <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">Uploaded Documents</h2>

                {docsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#1e3a5f]/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-[#1e3a5f]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                            <p className="text-xs text-gray-500">
                              {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                              {doc.uploaded_at && ` • ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.file && (
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-gray-400 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDocumentDelete(doc.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Change Password */}
          {activeSection === 'change_password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 p-6">
                <h2 className="text-lg font-semibold text-[#1e3a5f] mb-1">Change Password</h2>
                <p className="text-sm text-gray-500 mb-6">Keep your account secure with a strong password</p>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        name="current_password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="pl-10 pr-10 h-11 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-[#1e3a5f]/10 focus:border-[#1e3a5f]"
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        name="new_password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (min 8 characters)"
                        className="pl-10 pr-10 h-11 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-[#1e3a5f]/10 focus:border-[#1e3a5f]"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10 h-11 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-[#1e3a5f]/10 focus:border-[#1e3a5f]"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={passwordLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                      className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-lg h-11 px-6"
                    >
                      {passwordLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Changing...</>
                      ) : (
                        <><Lock className="w-4 h-4 mr-2" /> Change Password</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
