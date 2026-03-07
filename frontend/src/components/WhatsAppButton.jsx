/**
 * WhatsAppButton Component
 * ========================
 * 
 * A floating WhatsApp button that allows users to directly message
 * the VisaMate Japan support team via WhatsApp.
 * 
 * Features:
 * - Floating button in bottom-right corner
 * - Pulse animation to attract attention
 * - Pre-filled message for convenience
 * - Opens WhatsApp web/app directly
 * 
 * @module WhatsAppButton
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * WhatsApp phone number (without + or spaces)
 * Format: country code + number
 * @constant {string}
 */
const WHATSAPP_NUMBER = '818012345678'; // Replace with actual WhatsApp business number

/**
 * Default pre-filled message when opening WhatsApp
 * @constant {string}
 */
const DEFAULT_MESSAGE = "Hi! I'm interested in learning more about VisaMate Japan's study abroad services.";

/**
 * WhatsApp SVG Icon Component
 */
const WhatsAppIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/**
 * WhatsAppButton Component
 * 
 * Floating WhatsApp contact button with tooltip.
 * 
 * @component
 * @returns {JSX.Element} The WhatsApp button widget
 */
export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Opens WhatsApp with pre-filled message
   */
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-24 right-6 z-50">
        {/* Tooltip */}
        <AnimatePresence>
          {(showTooltip || isHovered) && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg px-4 py-3 whitespace-nowrap border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTooltip(false)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-800">Chat with us on WhatsApp!</p>
                  <p className="text-xs text-gray-500">We typically reply within minutes</p>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="border-8 border-transparent border-l-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <motion.button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5C] shadow-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Contact us on WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7 text-white" />
        </motion.button>

        {/* Pulse animation */}
        <span className="absolute inset-0 w-14 h-14 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
      </div>

      {/* Initial tooltip that appears after 3 seconds */}
      <InitialTooltip onShow={() => setShowTooltip(true)} />
    </>
  );
}

/**
 * Initial tooltip component that shows after a delay
 */
function InitialTooltip({ onShow }) {
  React.useEffect(() => {
    // Show tooltip after 3 seconds if user hasn't interacted
    const timer = setTimeout(() => {
      const hasSeenTooltip = sessionStorage.getItem('whatsapp_tooltip_seen');
      if (!hasSeenTooltip) {
        onShow();
        sessionStorage.setItem('whatsapp_tooltip_seen', 'true');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onShow]);

  return null;
}
