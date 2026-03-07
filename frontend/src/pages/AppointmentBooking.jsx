import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { format, parseISO, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar, Clock, ArrowLeft, ArrowRight, Check, Loader2, User, Mail, Phone, MessageSquare, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/lib/AuthContext';
import { appointmentsApi, appointmentSlotsApi } from '@/api/djangoClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createPageUrl } from '../utils';

const services = [
  { value: 'visa_guidance', label: 'Visa Guidance', icon: '🛂', description: 'Get expert guidance on visa requirements and application process' },
  { value: 'university_selection', label: 'University Selection', icon: '🎓', description: 'Find the perfect university for your academic goals' },
  { value: 'application_support', label: 'Application Support', icon: '📝', description: 'Comprehensive support for your applications' },
  { value: 'pre_departure', label: 'Pre-Departure Prep', icon: '✈️', description: 'Everything you need before leaving for Japan' },
  { value: 'general_consultation', label: 'General Consultation', icon: '💬', description: 'General questions and guidance' },
];

export default function AppointmentBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // Selection state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Slots data
  const [availableSlots, setAvailableSlots] = useState([]);
  const [datesWithSlots, setDatesWithSlots] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  // Fetch dates with available slots
  useEffect(() => {
    fetchDatesWithSlots();
  }, []);

  // Fetch slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, selectedService]);

  const fetchDatesWithSlots = async () => {
    try {
      const response = await appointmentSlotsApi.datesWithSlots();
      setDatesWithSlots(response.data.map(d => new Date(d)));
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  };

  const fetchSlotsForDate = async (date) => {
    setSlotsLoading(true);
    try {
      const response = await appointmentSlotsApi.available({
        date: format(date, 'yyyy-MM-dd'),
        service_type: selectedService,
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        slot: selectedSlot.id,
        service_type: selectedService,
        appointment_date: `${selectedSlot.date}T${selectedSlot.start_time}`,
      };
      
      if (user) {
        data.user = user.id;
      }

      await appointmentsApi.create(data);
      toast.success('Appointment booked successfully!');
      setStep(4);
    } catch (error) {
      console.error('Booking error:', error);
      const errorMsg = error.response?.data?.slot?.[0] || error.response?.data?.detail || 'Failed to book appointment. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const hasSlots = (date) => {
    return datesWithSlots.some(d => isSameDay(d, date));
  };

  const isPastDate = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const renderCalendar = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startDayOfWeek = monthStart.getDay();
    const emptyDays = Array(startDayOfWeek).fill(null);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), -1))}
            className="text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-lg font-semibold text-[#1e3a5f]">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(prev => addDays(endOfMonth(prev), 1))}
            className="text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-10" />
          ))}
          {monthDays.map(day => {
            const dateHasSlots = hasSlots(day);
            const isPast = isPastDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => !isPast && dateHasSlots && handleDateSelect(day)}
                disabled={isPast || !dateHasSlots}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-all relative",
                  isPast && "text-gray-300 cursor-not-allowed",
                  !isPast && !dateHasSlots && "text-gray-400 cursor-not-allowed",
                  !isPast && dateHasSlots && "text-[#1e3a5f] hover:bg-[#c9a962]/10 cursor-pointer",
                  isSelected && "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]",
                  isCurrentDay && !isSelected && "ring-2 ring-[#c9a962] ring-offset-2"
                )}
              >
                {format(day, 'd')}
                {dateHasSlots && !isPast && (
                  <span className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                    isSelected ? "bg-white" : "bg-[#c9a962]"
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-[#c9a962]" />
            Available
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            Unavailable
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <div className="text-center py-12 text-gray-500">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a date to see available time slots</p>
        </div>
      );
    }

    if (slotsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </div>
      );
    }

    if (availableSlots.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No available slots for this date</p>
          <p className="text-sm mt-2">Try selecting another date</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-[#1e3a5f] mb-4">
          Available times for {format(selectedDate, 'EEEE, MMMM d')}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => handleSlotSelect(slot)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                selectedSlot?.id === slot.id
                  ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                  : "border-gray-100 hover:border-[#c9a962] bg-white"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#c9a962]" />
                <span className="font-medium text-[#1e3a5f]">
                  {slot.start_time.slice(0, 5)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {slot.spots_remaining} spot{slot.spots_remaining !== 1 ? 's' : ''} left
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-white pt-24 pb-12">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-[#1e3a5f] hover:text-[#c9a962] mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Book an Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule a consultation with our expert team</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-2 md:gap-4">
            {[
              { num: 1, label: 'Service' },
              { num: 2, label: 'Date & Time' },
              { num: 3, label: 'Details' },
              { num: 4, label: 'Confirmed' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    step >= s.num
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-gray-100 text-gray-400"
                  )}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 hidden sm:block",
                    step >= s.num ? "text-[#1e3a5f]" : "text-gray-400"
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={cn(
                    "w-8 md:w-16 h-0.5 transition-all",
                    step > s.num ? "bg-[#1e3a5f]" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-xl font-semibold text-[#1e3a5f] mb-6 text-center">
                What would you like help with?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <motion.button
                    key={service.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServiceSelect(service.value)}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all bg-white",
                      selectedService === service.value
                        ? "border-[#1e3a5f] shadow-lg"
                        : "border-gray-100 hover:border-[#c9a962] hover:shadow-md"
                    )}
                  >
                    <span className="text-3xl mb-3 block">{service.icon}</span>
                    <h3 className="font-semibold text-[#1e3a5f] mb-2">{service.label}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-[#1e3a5f]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h2 className="text-xl font-semibold text-[#1e3a5f]">
                    Select Date & Time
                  </h2>
                  <p className="text-sm text-gray-500">
                    {services.find(s => s.value === selectedService)?.label}
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  {renderCalendar()}
                </div>

                {/* Time Slots */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  {renderTimeSlots()}
                </div>
              </div>

              {selectedSlot && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Enter Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="text-[#1e3a5f]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-xl font-semibold text-[#1e3a5f]">
                  Complete Your Booking
                </h2>
              </div>

              {/* Booking Summary */}
              <Card className="mb-6 border-[#c9a962]/20 bg-[#faf8f5]">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[#1e3a5f] mb-4">Booking Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span className="font-medium text-[#1e3a5f]">
                        {services.find(s => s.value === selectedService)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium text-[#1e3a5f]">
                        {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium text-[#1e3a5f]">
                        {selectedSlot?.start_time?.slice(0, 5)} - {selectedSlot?.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Details</CardTitle>
                  <CardDescription>Please provide your contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="full_name"
                            name="full_name"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            required
                            className="pl-11 h-12 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-11 h-12 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+81 70-0000-0000"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="pl-11 h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Notes (Optional)</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Any specific questions or topics you'd like to discuss..."
                          value={formData.message}
                          onChange={handleInputChange}
                          className="pl-11 min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Booking...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          Confirm Booking
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-3">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your appointment has been successfully scheduled. We'll send you a confirmation email shortly.
                </p>

                <Card className="mb-6 bg-[#faf8f5] border-[#c9a962]/20 text-left">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service</span>
                      <span className="font-medium text-[#1e3a5f]">
                        {services.find(s => s.value === selectedService)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium text-[#1e3a5f]">
                        {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium text-[#1e3a5f]">
                        {selectedSlot?.start_time?.slice(0, 5)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/Dashboard')}
                    className="flex-1"
                  >
                    View My Appointments
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
