import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, User, Mail, Phone, FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { appointmentsApi } from '@/api/djangoClient';
import { useAuth } from '@/lib/AuthContext';

const formSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  service_type: z.string({ required_error: 'Please select a service.' }),
  appointment_date: z.date({ required_error: 'Please select a date.' }),
  message: z.string().optional(),
});

export default function AppointmentForm({ onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user ? `${user.first_name} ${user.last_name}`.trim() || user.username : '',
      email: user?.email || '',
      phone: '',
      service_type: '',
      message: '',
    },
  });

  async function onSubmit(values) {
    setLoading(true);
    try {
      // Format date for Django
      const data = {
        ...values,
        appointment_date: values.appointment_date.toISOString(),
      };
      if (user) {
        data.user = user.id;
      }
      await appointmentsApi.create(data);
      toast.success('Appointment booked successfully! We will contact you soon.');
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.detail || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const services = [
    { value: 'visa_guidance', label: 'Visa Guidance', icon: '🛂' },
    { value: 'university_selection', label: 'University Selection', icon: '🎓' },
    { value: 'application_support', label: 'Application Support', icon: '📝' },
    { value: 'pre_departure', label: 'Pre-Departure Prep', icon: '✈️' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[#1e3a5f]">Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                      className="pl-11 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[#1e3a5f]">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="john@example.com" 
                      {...field} 
                      className="pl-11 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Phone and Service Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[#1e3a5f]">Phone Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="+81 70-0000-0000" 
                      {...field} 
                      className="pl-11 h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-[#1e3a5f]">Service Interested In</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] transition-all">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <SelectValue placeholder="Select a service" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-200">
                    {services.map((service) => (
                      <SelectItem 
                        key={service.value} 
                        value={service.value}
                        className="rounded-lg focus:bg-[#faf8f5] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span>{service.icon}</span>
                          <span>{service.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Date Picker */}
        <FormField
          control={form.control}
          name="appointment_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium text-[#1e3a5f]">Preferred Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-12 rounded-xl border-gray-200 bg-[#faf8f5] hover:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] text-left font-normal transition-all justify-start",
                        !field.value && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
                      {field.value ? (
                        <span className="text-[#1e3a5f]">{format(field.value, "EEEE, MMMM d, yyyy")}</span>
                      ) : (
                        <span>Pick a date for your consultation</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#1e3a5f]">Additional Notes (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                  <Textarea 
                    placeholder="Tell us more about your goals, preferred study destinations, or any questions..." 
                    className="pl-11 min-h-[100px] rounded-xl border-gray-200 bg-[#faf8f5] focus:bg-white focus:ring-2 focus:ring-[#c9a962]/20 focus:border-[#c9a962] resize-none transition-all" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30 mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Booking your consultation...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Confirm Appointment</span>
            </div>
          )}
        </Button>

        {/* Info text */}
        <p className="text-xs text-center text-gray-500 mt-4">
          By booking, you agree to receive communication from VisaMate Japan regarding your consultation.
        </p>
      </form>
    </Form>
  );
}
