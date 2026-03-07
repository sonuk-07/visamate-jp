import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from './utils';
import { useAuth } from '@/lib/AuthContext';
import Chatbot from '@/components/Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ja' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    window.location.reload();
  };

  const navItems = language === 'en' 
    ? [
        { label: 'Home', href: '#' },
        { label: 'Services', href: '#services' },
        { label: 'Destinations', href: '#destinations' },
        { label: 'Contact', href: '#contact' }
      ]
    : [
        { label: 'ホーム', href: '#' },
        { label: 'サービス', href: '#services' },
        { label: '留学先', href: '#destinations' },
        { label: 'お問い合わせ', href: '#contact' }
      ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69400f2c603e9672600c487c/f85b456f9_IMG_82332.jpg"
                alt="VisaMate Japan"
                className="h-10 w-10 object-contain"
              />
              <span className={`text-xl font-bold transition-colors ${
                isScrolled ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]'
              }`}>
                VisaMate Japan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`font-medium transition-colors hover:text-[#c9a962] ${
                    isScrolled ? 'text-gray-700' : 'text-[#1e3a5f]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Switcher */}
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className={`flex items-center gap-2 font-medium ${
                  isScrolled ? 'text-gray-700 hover:text-[#1e3a5f]' : 'text-[#1e3a5f]'
                }`}
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? '日本語' : 'English'}
              </Button>

              {user ? (
                <>
                  <Link to="/Dashboard">
                    <Button
                      variant="outline"
                      className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white px-6 rounded-full"
                    >
                      {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
                    </Button>
                  </Link>
                  <Button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-full"
                  >
                    {language === 'en' ? 'Logout' : 'ログアウト'}
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button
                    className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-6 rounded-full"
                  >
                    {language === 'en' ? 'Login' : 'ログイン'}
                  </Button>
                </Link>
              )}

              <Button
                id="appointment-modal-trigger"
                onClick={() => navigate('/AppointmentBooking')}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-6 rounded-full"
              >
                {language === 'en' ? 'Book Now' : '予約する'}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className={isScrolled ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]'} />
              ) : (
                <Menu className={isScrolled ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t"
            >
              <div className="container mx-auto px-6 py-6 space-y-4">
                {navItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-700 font-medium py-2 hover:text-[#c9a962]"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleLanguage();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {language === 'en' ? '日本語' : 'English'}
                  </Button>
                  {user ? (
                    <>
                      <Link to="/Dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-[#1e3a5f] text-[#1e3a5f]">
                          {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
                        </Button>
                      </Link>
                      <Button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full bg-red-600">
                        {language === 'en' ? 'Logout' : 'ログアウト'}
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#1e3a5f]">
                        {language === 'en' ? 'Login' : 'ログイン'}
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={() => { navigate('/AppointmentBooking'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[#c9a962] hover:bg-[#b89852] text-white"
                  >
                    {language === 'en' ? 'Book Now' : '予約する'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}