import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();

  const quickLinks = language === 'en' 
    ? ['Home', 'Services', 'Destinations', 'About Us', 'Contact']
    : ['ホーム', 'サービス', '留学先', '会社概要', 'お問い合わせ'];

  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69400f2c603e9672600c487c/f85b456f9_IMG_82332.jpg"
                alt="VisaMate Japan"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">VisaMate Japan</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              {t.footer.tagline}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-lg mb-6">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-white/70 hover:text-[#c9a962] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-lg mb-6">{t.footer.contactUs}</h4>
            <ul className="space-y-3 text-white/70">
              <li>Akabanenish 3-23-7</li>
              <li>Kita-ku, Tokyo, Japan</li>
              <li>+81 70 8338 5675</li>
              <li>info@visamatejapan.com</li>
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-lg mb-6">{t.footer.followUs}</h4>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#c9a962] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50">
          <p>© {new Date().getFullYear()} VisaMate Japan. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}