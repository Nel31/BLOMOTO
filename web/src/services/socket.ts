import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';

class SocketService {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = this.resolveBaseUrl();
  }

  private resolveBaseUrl() {
    const env = (import.meta as any).env;

    if (env?.VITE_SOCKET_URL) {
      return env.VITE_SOCKET_URL;
    }

    const apiBase: string | undefined = env?.VITE_API_BASE_URL;
    if (!apiBase) {
      return 'http://localhost:5000';
    }

    try {
      const parsed = new URL(apiBase);
      parsed.pathname = '';
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString().replace(/\/$/, '');
    } catch {
      console.warn('[socket] Impossible de parser VITE_API_BASE_URL, fallback localhost');
      return 'http://localhost:5000';
    }
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = useAuthStore.getState().token;
    
    this.socket = io(this.baseURL, {
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.io');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur Socket.io');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket.io:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  sendMessage(data: { roomId: string; message: any }) {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  }

  onMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offMessage(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();

