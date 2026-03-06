import React from 'react';
import { LanguageProvider } from '../components/LanguageContext';
import HeroSection from '../components/home/HeroSection';
import ServicesSection from '../components/home/ServicesSection';
import DestinationsSection from '../components/home/DestinationsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import LocationsSection from '../components/home/LocationsSection';
import ContactSection from '../components/home/ContactSection';
import Footer from '../components/home/Footer';

export default function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <HeroSection />
        <ServicesSection />
        <DestinationsSection />
        <TestimonialsSection />
        <LocationsSection />
        <ContactSection />
        <Footer />
      </div>
    </LanguageProvider>
  );
}