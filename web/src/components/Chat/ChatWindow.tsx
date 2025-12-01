import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { socketService } from '../../services/socket';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiverId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

interface ChatWindowProps {
  userId: string;
  appointmentId?: string;
  onClose?: () => void;
}

export default function ChatWindow({ userId, appointmentId, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadConversation();
    setupSocket();
    return () => {
      socketService.offMessage();
    };
  }, [userId]);

  const setupSocket = () => {
    socketService.connect();
    const currentUserId = currentUser?._id || currentUser?.id;
    const roomId = `conversation-${currentUserId}-${userId}`;
    socketService.joinRoom(roomId);

    socketService.onMessage((data: any) => {
      if (data.message && (data.message.senderId._id === userId || data.message.receiverId._id === userId)) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });
  };

  const loadConversation = async () => {
    try {
      const convRes = await api.get(`/messages/conversation/${userId}`);
      setMessages(convRes.data.messages || []);
      
      // Extraire l'utilisateur de la conversation
      if (convRes.data.messages && convRes.data.messages.length > 0) {
        const firstMessage = convRes.data.messages[0];
        const currentUserId = currentUser?._id || currentUser?.id;
        const otherUserData = firstMessage.senderId._id === currentUserId 
          ? firstMessage.receiverId 
          : firstMessage.senderId;
        // S'assurer que le nom de l'admin est "Promoto"
        if (otherUserData.role === 'admin') {
          otherUserData.name = 'Promoto';
        }
        setOtherUser(otherUserData);
      } else {
        // Si pas de messages, essayer de récupérer l'utilisateur via l'API
        try {
          const userRes = await api.get(`/users/${userId}/public`);
          const userData = userRes.data.user;
          // S'assurer que le nom de l'admin est "Promoto"
          if (userData.role === 'admin') {
            userData.name = 'Promoto';
          }
          setOtherUser(userData);
        } catch (err) {
          console.error('Erreur récupération utilisateur:', err);
          setOtherUser({ _id: userId, name: 'Utilisateur', email: '' });
        }
      }
      
      setLoading(false);
      scrollToBottom();
    } catch (error: any) {
      console.error('Erreur chargement conversation:', error);
      // Essayer de récupérer au moins les infos utilisateur
      try {
        const userRes = await api.get(`/users/${userId}/public`);
        const userData = userRes.data.user;
        // S'assurer que le nom de l'admin est "Promoto"
        if (userData.role === 'admin') {
          userData.name = 'Promoto';
        }
        setOtherUser(userData);
      } catch (err) {
        setOtherUser({ _id: userId, name: 'Utilisateur', email: '' });
      }
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post('/messages', {
        receiverId: userId,
        appointmentId: appointmentId || undefined,
        content: messageText,
      });

      setMessages((prev) => [...prev, res.data.message]);
      setMessageText('');
      scrollToBottom();

      // Marquer comme lu
      await api.put('/messages/read', { senderId: userId });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white/90 backdrop-blur-md rounded-xl shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-racine-200)' }}>
        <div className="flex items-center gap-3 flex-1">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-opacity-50 rounded-lg transition-all duration-300 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-racine-100)' }}
              title="Retour aux conversations"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-noir-700)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {otherUser?.avatar ? (
            <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ backgroundColor: 'var(--color-rouge-100)', color: 'var(--color-rouge-700)' }}>
              {otherUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate" style={{ color: 'var(--color-noir)' }}>{otherUser?.name || 'Utilisateur'}</h3>
            <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>En ligne</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ backgroundColor: '#efeae2', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 40 0 L 0 0 0 40\' fill=\'none\' stroke=\'%23d4d1c7\' stroke-width=\'0.5\' opacity=\'0.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")' }}>
        {messages.map((msg, index) => {
          const currentUserId = currentUser?._id || currentUser?.id;
          const isOwn = msg.senderId._id === currentUserId;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId._id !== msg.senderId._id);
          const showTime = !prevMessage || 
            new Date(msg.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000; // 5 minutes
          
          return (
            <div key={msg._id} className={`flex items-end gap-2 ${isOwn ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
              {/* Avatar pour les messages reçus */}
              {!isOwn && (
                <div className="flex-shrink-0 w-8 h-8">
                  {showAvatar ? (
                    msg.senderId.avatar ? (
                      <img src={msg.senderId.avatar} alt={msg.senderId.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-rouge-100)', color: 'var(--color-rouge-700)' }}>
                        {(msg.senderId.name || 'U')?.[0]?.toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}
              
              {/* Bulle de message */}
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                    isOwn 
                      ? 'rounded-br-sm' // Coin pointu en bas à droite pour WhatsApp
                      : 'rounded-bl-sm' // Coin pointu en bas à gauche pour WhatsApp
                  }`}
                  style={{
                    backgroundColor: isOwn ? '#dcf8c6' : 'white', // Vert clair pour messages envoyés (style WhatsApp)
                    color: isOwn ? '#000' : '#000', // Texte noir pour meilleure lisibilité
                    border: !isOwn ? '1px solid #e5e5e5' : 'none', // Bordure légère pour messages reçus
                    boxShadow: isOwn ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.08)',
                  }}
                >
                  <p className="text-sm leading-relaxed break-words" style={{ color: isOwn ? '#000' : '#303030' }}>{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <p className="text-xs" style={{ color: isOwn ? '#667781' : '#667781', opacity: 0.8 }}>
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {isOwn && (
                      <svg className="w-3.5 h-3.5" style={{ color: '#667781' }} fill="currentColor" viewBox="0 0 16 15">
                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.175a.366.366 0 0 0-.063-.51z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Espace pour les messages envoyés */}
              {isOwn && <div className="flex-shrink-0 w-8" />}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300"
            style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !messageText.trim()}
            className="px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
          >
            <span className="relative z-10">Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

