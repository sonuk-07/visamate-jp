import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Mail, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import { myMessagesApi } from "@/api/djangoClient";
import { useWebSocket } from "@/lib/WebSocketContext";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await myMessagesApi.list();
      const data = res.data;
      // handle both plain array and paginated response
      setMessages(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMessages();
  }, [user, navigate, fetchMessages]);

  // Re-fetch when admin replies to a message
  useWebSocket("message_update", () => {
    toast.info("You received a new reply!");
    fetchMessages();
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Messages</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </div>
      ) : !Array.isArray(messages) || messages.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a5f]/10 py-16 text-center">
          <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No messages yet
          </h3>
          <p className="text-gray-500">
            When the team replies to your inquiries, you'll see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(Array.isArray(messages) ? messages : []).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-3xl shadow-xl shadow-[#1e3a5f]/10 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#1e3a5f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[#1e3a5f]">
                          Reply from VisaMate
                        </h3>
                        {msg.replied_at && (
                          <span className="text-xs text-gray-400 shrink-0">
                            {format(new Date(msg.replied_at), "PPP p")}
                          </span>
                        )}
                      </div>
                      <div className="bg-[#1e3a5f]/5 rounded-lg p-4 mb-3">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {msg.admin_reply}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          Your original inquiry:
                        </p>
                        <p className="text-sm text-gray-600">{msg.message}</p>
                      </div>
                      {msg.destination && (
                        <div className="mt-2">
                          <Badge className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs">
                            {msg.destination}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
