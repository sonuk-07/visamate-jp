import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function LocationsSection() {
  const { language } = useLanguage();

  const locations = [
    {
      country: language === 'en' ? 'Japan' : '日本',
      address: 'Akabanenish 3-23-7, Kita-ku, Tokyo, Japan',
      phone: '+81 70 8338 5675',
      email: 'info@visamatejapan.com',
      website: null,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
      gradient: 'from-[#1e3a5f] to-[#2a4a6f]'
    },
    {
      country: language === 'en' ? 'Australia' : 'オーストラリア',
      address: 'Suite 101, L1, 22 Market Street, Sydney, NSW, Australia',
      phone: '+61 421 553 001',
      email: 'Admission@visamateeducation.com.au',
      website: 'visamateeducation.com.au',
      link: 'https://visamateeducation.com.au/',
      image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&h=600&fit=crop',
      gradient: 'from-[#2a5a7f] to-[#3a6a8f]'
    },
    {
      country: language === 'en' ? 'Nepal' : 'ネパール',
      address: 'Lions Chowk, Bharatpur, Nepal',
      phone: '+977 56-511288',
      email: 'support@visamateeducation.com.au',
      website: 'visamateseducation.com.np',
      link: 'https://visamateseducation.com.np/',
      social: {
        instagram: 'instagram.com/visamateseducation',
        tiktok: 'tiktok.com/@visamatesconsultancy'
      },
      image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop',
      gradient: 'from-[#3a7a9f] to-[#4a8aaf]'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[#faf8f5] to-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
            {language === 'en' ? 'Our Global Offices' : '世界のオフィス'}
          </h2>
          <p className="text-gray-600 text-lg">
            {language === 'en' 
              ? 'Connect with us at any of our international locations' 
              : '世界中のオフィスでご相談いただけます'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={location.image} 
                    alt={location.country}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${location.gradient} opacity-70`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white">{location.country}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm leading-relaxed">{location.address}</p>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" />
                    <a href={`tel:${location.phone}`} className="text-gray-700 text-sm hover:text-[#c9a962] transition-colors">
                      {location.phone}
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" />
                    <a href={`mailto:${location.email}`} className="text-gray-700 text-sm hover:text-[#c9a962] transition-colors break-all">
                      {location.email}
                    </a>
                  </div>

                  {/* Website Link */}
                  {location.website && (
                    <a 
                      href={location.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-[#1e3a5f] hover:text-[#c9a962] transition-colors group/link"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-sm font-medium">{location.website}</span>
                      <ExternalLink className="w-4 h-4 ml-auto group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {/* Social Links for Nepal */}
                  {location.social && (
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <a 
                        href={`https://${location.social.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-[#c9a962] transition-colors text-sm"
                      >
                        <Globe className="w-4 h-4" />
                        {location.social.instagram}
                      </a>
                      <a 
                        href={`https://${location.social.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-[#c9a962] transition-colors text-sm"
                      >
                        <Globe className="w-4 h-4" />
                        {location.social.tiktok}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}