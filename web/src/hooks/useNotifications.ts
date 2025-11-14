import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token || !user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const res = await api.get('/messages/conversations');
        const conversations = res.data.conversations || [];
        
        // Calculer le total de messages non lus
        const total = conversations.reduce((sum: number, conv: any) => {
          return sum + (conv.unreadCount || 0);
        }, 0);
        
        setUnreadCount(total);
      } catch (error: any) {
        // Si l'API n'est pas disponible ou erreur, on ignore
        console.error('Erreur chargement notifications:', error);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Recharger toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [token, user]);

  return { unreadCount, loading };
}

