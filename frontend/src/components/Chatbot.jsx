/**
 * Chatbot Component
 * ==================
 * 
 * A floating chatbot widget for VisaMate Japan powered by Groq AI.
 * Provides intelligent answers about visa services, appointments, and
 * study abroad programs.
 * 
 * @module Chatbot
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import api from '@/api/djangoClient';

/**
 * Quick action buttons displayed in the chat.
 */
const quickActions = [
  { label: '📅 Book Appointment', action: 'appointment' },
  { label: '✉️ Submit Enquiry', action: 'enquiry' },
  { label: '🛂 Visa Info', action: 'visa' },
  { label: '🎓 Universities', action: 'university' },
  { label: '💰 Costs', action: 'cost' },
];

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
   * Tries to parse a JSON action block from the bot's reply.
   * Returns { action, data, cleanText } or null.
   */
  const parseAction = (reply) => {
    const jsonMatch = reply.match(/\{\s*"action"\s*:.+\}/s);
    if (!jsonMatch) return null;
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.action && parsed.data) {
        const cleanText = reply.replace(jsonMatch[0], '').trim();
        return { ...parsed, cleanText };
      }
    } catch { /* not valid JSON */ }
    return null;
  };

  /**
   * Executes a booking or enquiry action detected from the AI reply.
   */
  const executeAction = async (action, data) => {
    try {
      const response = await api.post('chat/', { action, data });
      return response.data.reply;
    } catch {
      return 'Sorry, something went wrong while processing your request. Please try again.';
    }
  };

  /**
   * Sends a message and gets Groq AI response.
   * Detects inline booking/enquiry JSON and executes automatically.
   * @param {string} text - The message text to send
   */
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Build conversation history for Groq (last 10 messages for context)
    const history = [...messages, userMessage]
      .slice(-10)
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const response = await api.post('chat/', { messages: history });
      const reply = response.data.reply;

      // Check if the AI returned a booking/enquiry action
      const actionData = parseAction(reply);
      if (actionData) {
        // Show a brief collecting message
        if (actionData.cleanText) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            text: actionData.cleanText,
            timestamp: new Date()
          }]);
        }
        // Execute the action on backend
        const actionReply = await executeAction(actionData.action, actionData.data);
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          type: 'bot',
          text: actionReply,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          text: reply,
          timestamp: new Date()
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again or book a consultation with our team for immediate help! 😊",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handles quick action button clicks.
   * @param {string} action - The action type
   */
  const handleQuickAction = (action) => {
    if (action === 'appointment') {
      handleSendMessage('I want to book an appointment');
    } else if (action === 'enquiry') {
      handleSendMessage('I want to submit an enquiry');
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
