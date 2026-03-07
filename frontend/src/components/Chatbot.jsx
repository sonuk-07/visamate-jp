/**
 * Chatbot Component
 * ==================
 * 
 * A floating chatbot widget for VisaMate Japan that provides instant
 * answers to common questions about visa services, appointments, and
 * study abroad programs.
 * 
 * Features:
 * - Floating button in bottom-right corner
 * - Expandable chat interface
 * - Predefined quick action buttons
 * - AI-like responses based on keyword matching
 * - Typing indicator for natural feel
 * - Chat history within session
 * 
 * @module Chatbot
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';

/**
 * Knowledge base for the chatbot responses.
 * Maps keywords to appropriate responses about VisaMate Japan services.
 */
const knowledgeBase = {
  greetings: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'konnichiwa', 'こんにちは'],
    response: "Hello! 👋 Welcome to VisaMate Japan! I'm here to help you with your study abroad journey to Japan. How can I assist you today?"
  },
  services: {
    keywords: ['service', 'services', 'what do you offer', 'help with', 'what can you do'],
    response: "We offer comprehensive study abroad services:\n\n🛂 **Visa Guidance** - Expert help with visa applications\n🎓 **University Selection** - Find your perfect Japanese university\n📝 **Application Support** - Complete application assistance\n✈️ **Pre-Departure Prep** - Everything you need before leaving\n💬 **General Consultation** - Any questions you have\n\nWould you like to learn more about any of these?"
  },
  visa: {
    keywords: ['visa', 'student visa', 'visa requirements', 'visa application', 'visa process'],
    response: "For studying in Japan, you'll typically need a **Student Visa (留学)**. Here's what you need:\n\n📋 Valid passport\n📄 Certificate of Eligibility (CoE)\n🎓 Admission letter from Japanese institution\n💰 Proof of financial support\n📸 Passport photos\n\nThe process usually takes 1-3 months. Would you like to book a consultation for personalized guidance?"
  },
  appointment: {
    keywords: ['book', 'appointment', 'schedule', 'consultation', 'meeting', '予約'],
    response: "Great! I can help you book an appointment! 📅\n\nWe offer consultations for:\n• Visa Guidance\n• University Selection\n• Application Support\n• Pre-Departure Preparation\n\nClick the button below to book your appointment, or I can guide you through the process!"
  },
  university: {
    keywords: ['university', 'universities', 'school', 'college', 'institution', 'study', '大学'],
    response: "Japan has excellent universities! 🎓\n\n**Top Options:**\n• University of Tokyo (東京大学)\n• Kyoto University (京都大学)\n• Osaka University (大阪大学)\n• Waseda University (早稲田大学)\n• Keio University (慶應義塾大学)\n\nWe help match you with the best fit based on your goals, budget, and preferences. Want to discuss your options?"
  },
  cost: {
    keywords: ['cost', 'price', 'fee', 'how much', 'expensive', 'money', 'tuition', '費用'],
    response: "Study costs in Japan vary:\n\n💴 **Tuition (per year):**\n• National universities: ¥535,800 (~$4,000)\n• Private universities: ¥800,000-1,500,000 (~$6,000-11,000)\n\n🏠 **Living expenses (monthly):**\n• Tokyo: ¥100,000-150,000\n• Other cities: ¥70,000-100,000\n\n💰 **Scholarships available!** MEXT, JASSO, and university-specific scholarships can significantly reduce costs."
  },
  scholarship: {
    keywords: ['scholarship', 'scholarships', 'financial aid', 'funding', 'mext', 'jasso', '奨学金'],
    response: "Great news - many scholarships are available! 🎉\n\n**Top Scholarships:**\n🏆 **MEXT Scholarship** - Full tuition + living stipend\n📚 **JASSO** - For exchange students\n🎓 **University Scholarships** - Varies by institution\n🌏 **Private Foundations** - Various options\n\nWould you like help finding scholarships you're eligible for?"
  },
  language: {
    keywords: ['japanese', 'language', 'jlpt', 'nihongo', 'english', '日本語', 'level'],
    response: "Language requirements vary by program:\n\n🇯🇵 **Japanese-taught programs:**\n• Usually require JLPT N2 or N1\n• Some accept N3 with conditions\n\n🇬🇧 **English-taught programs:**\n• TOEFL iBT 80+ or IELTS 6.0+\n• Many universities offer these!\n\nDon't worry if your Japanese isn't perfect - we can find programs that match your level!"
  },
  timeline: {
    keywords: ['when', 'timeline', 'how long', 'duration', 'start', 'deadline', 'apply'],
    response: "Here's a typical timeline:\n\n📅 **12-18 months before:** Research & choose universities\n📝 **10-12 months before:** Prepare applications\n📮 **8-10 months before:** Submit applications\n✅ **6-8 months before:** Receive admission\n🛂 **3-6 months before:** Apply for visa\n✈️ **1 month before:** Prepare for departure\n\nJapanese semesters start in April (main) and October."
  },
  contact: {
    keywords: ['contact', 'email', 'phone', 'reach', 'talk', 'human', 'agent', '連絡'],
    response: "You can reach us through:\n\n📧 **Email:** contact@visamate.jp\n📞 **Phone:** Available during consultations\n📅 **Book a meeting:** Schedule a personal consultation\n\nOr continue chatting with me - I'm here to help 24/7! 🤖"
  },
  thanks: {
    keywords: ['thank', 'thanks', 'thank you', 'arigatou', 'ありがとう', 'helpful'],
    response: "You're welcome! 😊 It's my pleasure to help you on your journey to Japan. Is there anything else you'd like to know about studying abroad?"
  },
  bye: {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'さようなら'],
    response: "Goodbye! 👋 Best of luck with your study abroad plans! Feel free to come back anytime you have questions. がんばって! (Good luck!)"
  }
};

/**
 * Quick action buttons displayed in the chat.
 */
const quickActions = [
  { label: '📅 Book Appointment', action: 'appointment' },
  { label: '🛂 Visa Info', action: 'visa' },
  { label: '🎓 Universities', action: 'university' },
  { label: '💰 Costs', action: 'cost' },
];

/**
 * Finds the best matching response based on user input.
 * @param {string} input - User's message
 * @returns {string} Bot's response
 */
const findResponse = (input) => {
  const lowerInput = input.toLowerCase();
  
  for (const [key, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(keyword => lowerInput.includes(keyword))) {
      return data.response;
    }
  }
  
  // Default response if no match found
  return "I'd be happy to help! Here are some things I can assist with:\n\n• Visa requirements and applications\n• University selection in Japan\n• Scholarship information\n• Costs and budgeting\n• Application timelines\n\nOr you can book a consultation with our experts for personalized guidance! 😊";
};

/**
 * Chatbot Component
 * 
 * Floating chat widget that provides instant answers to user questions.
 * 
 * @component
 * @returns {JSX.Element} The chatbot widget
 */
export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi there! 👋 I'm VisaBot, your study abroad assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Scrolls to the bottom of the chat when new messages arrive.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Focuses the input when chat opens.
   */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /**
   * Handles sending a message.
   * @param {string} text - The message text to send
   */
  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking and respond
    setTimeout(() => {
      const response = findResponse(text);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  /**
   * Handles quick action button clicks.
   * @param {string} action - The action type
   */
  const handleQuickAction = (action) => {
    if (action === 'appointment') {
      handleSendMessage('I want to book an appointment');
      setTimeout(() => {
        navigate('/AppointmentBooking');
        setIsOpen(false);
      }, 2000);
    } else {
      handleSendMessage(`Tell me about ${action}`);
    }
  };

  /**
   * Handles form submission.
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen ? 'bg-gray-600' : 'bg-[#1e3a5f] hover:bg-[#2a4a6f]'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat pulse indicator when closed */}
      {!isOpen && (
        <span className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#1e3a5f] animate-ping opacity-30" />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    VisaBot
                    <Sparkles className="w-4 h-4 text-[#c9a962]" />
                  </h3>
                  <p className="text-xs text-white/70">Your Study Abroad Assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-[#1e3a5f] text-white rounded-br-md'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs bg-[#faf8f5] text-[#1e3a5f] rounded-full border border-[#c9a962]/30 hover:bg-[#c9a962]/10 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border-gray-300 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-full bg-[#1e3a5f] hover:bg-[#2a4a6f] p-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
