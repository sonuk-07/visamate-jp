import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { toast } from "sonner";
import { contactApi } from '@/api/djangoClient';

export default function ContactSection() {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    message: ''
  });

  const destinations = language === 'en' 
    ? ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Japan', 'Other']
    : ['アメリカ', 'イギリス', 'カナダ', 'オーストラリア', 'ドイツ', '日本', 'その他'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await contactApi.send(formData);
      toast.success(language === 'en' ? 'Thank you! We will contact you soon.' : 'ありがとうございます！まもなくご連絡いたします。');
      setFormData({ name: '', email: '', phone: '', destination: '', message: '' });
    } catch (error) {
      toast.error(language === 'en' ? 'Something went wrong. Please try again later.' : 'エラーが発生しました。後でもう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {t.contact.title}
            </h2>
            <p className="text-gray-600 text-lg mb-12">
              {t.contact.subtitle}
            </p>

            <div className="space-y-6">
              {[
                { icon: MapPin, label: language === 'en' ? 'Address' : '所在地', value: 'Akabanenish 3-23-7, Kita-ku, Tokyo, Japan' },
                { icon: Phone, label: language === 'en' ? 'Contact Us' : 'お問い合わせ', value: '+81 70 8338 5675' },
                { icon: Mail, label: language === 'en' ? 'Email Us' : 'メール', value: 'info@visamatejapan.com' },
                { icon: Clock, label: language === 'en' ? 'Business Hours' : '営業時間', value: language === 'en' ? 'Mon - Fri: 9:00 AM - 6:00 PM' : '月〜金: 9:00 - 18:00' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                    <div className="text-[#1e3a5f] font-medium">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 rounded-3xl overflow-hidden h-64"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
                alt="Map"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#faf8f5] rounded-3xl p-8 md:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.name}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-gray-200 rounded-xl h-12 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.email}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white border-gray-200 rounded-xl h-12 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.phone}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white border-gray-200 rounded-xl h-12 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.destination}
                  </label>
                  <Select
                    value={formData.destination}
                    onValueChange={(value) => setFormData({ ...formData, destination: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-xl h-12 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]">
                      <SelectValue placeholder={t.contact.form.selectDestination} />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.contact.form.message}
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-white border-gray-200 rounded-xl min-h-32 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white h-14 rounded-xl text-base font-medium transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === 'en' ? 'Sending...' : '送信中...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {t.contact.form.submit}
                  </div>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}