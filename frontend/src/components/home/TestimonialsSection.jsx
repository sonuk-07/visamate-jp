import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % t.testimonials.items.length);
  const prev = () => setCurrent((prev) => (prev - 1 + t.testimonials.items.length) % t.testimonials.items.length);

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
  ];

  return (
    <section className="py-24 bg-[#1e3a5f] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#c9a962]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-white/70 text-lg">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12"
              >
                <Quote className="w-12 h-12 text-[#c9a962] mb-6" />
                
                <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                  "{t.testimonials.items[current].quote}"
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={avatars[current]}
                      alt={t.testimonials.items[current].name}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-[#c9a962]/30"
                    />
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {t.testimonials.items[current].name}
                      </div>
                      <div className="text-[#c9a962]">
                        {t.testimonials.items[current].school}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#c9a962] text-[#c9a962]" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex gap-2">
                {t.testimonials.items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === current ? 'bg-[#c9a962] w-8' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}