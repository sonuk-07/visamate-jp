import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown, LayoutDashboard, LogOut, Shield, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from './utils';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import Chatbot from '@/components/Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = language === 'en' 
    ? [
        { label: 'Home', section: '' },
        { label: 'Services', section: 'services' },
        { label: 'Destinations', section: 'destinations' },
        { label: 'Contact', section: 'contact' }
      ]
    : [
        { label: 'ホーム', section: '' },
        { label: 'サービス', section: 'services' },
        { label: '留学先', section: 'destinations' },
        { label: 'お問い合わせ', section: 'contact' }
      ];

  const handleNavClick = (e, section) => {
    e.preventDefault();
    const isHome = location.pathname === '/' || location.pathname === '/Home';
    if (isHome) {
      if (!section) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/Home');
      if (section) {
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/Home');
  };

  // Authenticated user navbar
  if (user) {
    return (
      <div className="min-h-screen">
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg"
        >
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to="/Dashboard" className="flex items-center gap-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69400f2c603e9672600c487c/f85b456f9_IMG_82332.jpg"
                  alt="VisaMate Japan"
                  className="h-10 w-10 object-contain"
                />
                <span className="text-xl font-bold text-[#1e3a5f]">
                  VisaMate Japan
                </span>
              </Link>

              {/* Right Side - Desktop */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Language Switcher */}
                <Button
                  variant="ghost"
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-[#1e3a5f]"
                >
                  <Globe className="w-4 h-4" />
                  {language === 'en' ? '日本語' : 'English'}
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 font-medium px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
                        {(user.first_name || user.username || '?')[0].toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate">{user.first_name || user.username}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/Dashboard')} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/MyProfile')} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Profile' : 'プロフィール'}
                    </DropdownMenuItem>
                    {user.is_staff && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-[#c9a962]">
                          <Shield className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Admin' : '管理者'}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Logout' : 'ログアウト'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2"
              >
                {isMobileMenuOpen ? <X className="text-[#1e3a5f]" /> : <Menu className="text-[#1e3a5f]" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Authenticated */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white border-t"
              >
                <div className="container mx-auto px-6 py-6 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
                      {(user.first_name || user.username || '?')[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-[#1e3a5f]">{user.first_name || user.username}</span>
                  </div>
                  <Link to="/Dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {language === 'en' ? 'Dashboard' : 'ダッシュボード'}
                    </Button>
                  </Link>
                  <Link to="/MyProfile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      {language === 'en' ? 'Profile & Settings' : 'プロフィール設定'}
                    </Button>
                  </Link>
                  {user.is_staff && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 border-[#c9a962] text-[#c9a962]">
                        <Shield className="w-4 h-4" />
                        {language === 'en' ? 'Admin' : '管理者'}
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    {language === 'en' ? '日本語' : 'English'}
                  </Button>
                  <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full justify-start gap-2 bg-red-600 mt-2">
                    <LogOut className="w-4 h-4" />
                    {language === 'en' ? 'Logout' : 'ログアウト'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        <main>{children}</main>
        <Chatbot />
      </div>
    );
  }

  // Public (non-authenticated) navbar
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
                isScrolled ? 'text-[#1e3a5f]' : 'text-white'
              }`}>
                VisaMate Japan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.section ? `#${item.section}` : '#'}
                  onClick={(e) => handleNavClick(e, item.section)}
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

              <Link to="/login">
                <Button className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-6 rounded-full">
                  {language === 'en' ? 'Login' : 'ログイン'}
                </Button>
              </Link>

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
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className={isScrolled ? 'text-[#1e3a5f]' : 'text-white'} />
              ) : (
                <Menu className={isScrolled ? 'text-[#1e3a5f]' : 'text-white'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Public */}
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
                    href={item.section ? `#${item.section}` : '#'}
                    onClick={(e) => { handleNavClick(e, item.section); setIsMobileMenuOpen(false); }}
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
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#1e3a5f]">
                      {language === 'en' ? 'Login' : 'ログイン'}
                    </Button>
                  </Link>
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