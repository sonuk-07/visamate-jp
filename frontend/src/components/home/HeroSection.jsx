import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-[#c9a962]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-[#1e3a5f]/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-semibold rounded-full mb-6"
            >
              {t.hero.taglineHighlight} - {t.hero.tagline}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e3a5f] leading-tight mb-6"
            >
              {t.hero.title}{' '}
              <span className="relative">
                <span className="relative z-10 text-[#c9a962]">{t.hero.titleHighlight}</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke="#c9a962" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 leading-relaxed mb-8"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={() => document.getElementById('appointment-modal-trigger')?.click()}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white px-8 py-6 text-base rounded-full group transition-all duration-300 shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl hover:shadow-[#1e3a5f]/30"
              >
                {user ? t.hero.ctaLoggedIn : t.hero.cta}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              {user ? (
                <Link to="/Dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 px-8 py-6 text-base rounded-full transition-all duration-300"
                  >
                    <LayoutDashboard className="mr-2 w-5 h-5" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 px-8 py-6 text-base rounded-full transition-all duration-300"
                >
                  <Play className="mr-2 w-5 h-5" />
                  {t.hero.secondaryCta}
                </Button>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200"
            >
              {t.hero.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-[#1e3a5f]">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&h=500&fit=crop"
                    alt="Australia"
                    className="w-full h-64 object-cover"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop"
                    alt="University Campus, Australia"
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              </div>
              <div className="space-y-4 pt-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop"
                    alt="Japan"
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden shadow-2xl relative"
                >
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop"
                    alt="Working Holiday Program"
                    className="w-full h-64 object-cover"
                  />

                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}