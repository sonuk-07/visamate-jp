import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

const WebSocketContext = createContext(null);

const WS_BASE = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const listenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !user) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type } = message;
        // Notify all listeners for this event type
        const callbacks = listenersRef.current.get(type);
        if (callbacks) {
          callbacks.forEach((cb) => cb(message));
        }
        // Also notify wildcard listeners
        const wildcardCallbacks = listenersRef.current.get('*');
        if (wildcardCallbacks) {
          wildcardCallbacks.forEach((cb) => cb(message));
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      // Reconnect with exponential backoff
      const delay = Math.min(
        RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptRef.current),
        RECONNECT_MAX_DELAY
      );
      reconnectAttemptRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      connect();
    }
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, connect]);

  const subscribe = useCallback((eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = listenersRef.current.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to subscribe to WebSocket notification events.
 * @param {string} eventType - Event type to listen for (e.g., 'message_update', 'appointment_update', '*' for all)
 * @param {Function} callback - Function called with the message data when event fires
 */
export function useWebSocket(eventType, callback) {
  const context = useContext(WebSocketContext);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!context) return;
    const stableCallback = (data) => callbackRef.current(data);
    return context.subscribe(eventType, stableCallback);
  }, [context, eventType]);
}

export function useWebSocketStatus() {
  const context = useContext(WebSocketContext);
  return context?.connected ?? false;
}
