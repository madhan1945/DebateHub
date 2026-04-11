'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

function getSocketBaseUrl() {
  if (typeof window === 'undefined') {
    const serverApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.VITE_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? `http://127.0.0.1:${process.env.PORT || 10000}/api`
        : 'http://localhost:5000/api');

    return serverApiUrl.replace(/\/api$/, '');
  }

  return (process.env.VITE_API_URL || '/api').replace(/\/api$/, '') || window.location.origin;
}

function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socketInstance || socketInstance.disconnected) {
    const token   = localStorage.getItem('dh_token');
    const baseUrl = getSocketBaseUrl();

    socketInstance = io(baseUrl, {
      auth:  { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => console.log('🔌 Socket connected'));
    socketInstance.on('connect_error', (e) => console.warn('Socket error:', e.message));
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }
}

export function useSocket(debateId, handlers = {}) {
  const socketRef   = useRef(null);
  const handlersRef = useRef(handlers);
  const joinedRef   = useRef(false);

  useEffect(() => { handlersRef.current = handlers; });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    if (debateId && !joinedRef.current) {
      socket.emit('join_debate', { debateId });
      joinedRef.current = true;
    }

    const wrappers = {};
    Object.keys(handlersRef.current).forEach((event) => {
      wrappers[event] = (...args) => handlersRef.current[event]?.(...args);
      socket.on(event, wrappers[event]);
    });

    return () => {
      Object.keys(wrappers).forEach((event) => socket.off(event, wrappers[event]));
      if (debateId && joinedRef.current) {
        // Debounce leave for StrictMode dual-mounting
        setTimeout(() => {
          if (!joinedRef.current) socket.emit('leave_debate', { debateId });
        }, 800);
        joinedRef.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debateId]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit };
}
