import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import ChatWindow from './ChatWindow';

interface Conversation {
  _id: string;
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export default function ChatList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get('userId'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedUserId(userId);
    }
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.conversations || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Erreur chargement conversations:', error);
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Route peut ne pas exister ou non autorisée
        console.warn('La route /messages/conversations n\'est peut-être pas disponible');
      }
      setConversations([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  const handleCloseChat = () => {
    setSelectedUserId(null);
    setSearchParams({});
  };

  if (selectedUserId) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleCloseChat}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'var(--color-racine-600)', color: 'white' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux conversations
        </button>
        <ChatWindow userId={selectedUserId} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Messages
      </h2>

      {conversations.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucune conversation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => {
                setSelectedUserId(conv.user._id);
                setSearchParams({ userId: conv.user._id });
              }}
              className="w-full p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-md border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-between"
              style={{ borderColor: 'var(--color-racine-200)' }}
            >
              <div className="flex items-center gap-3">
                {conv.user.avatar ? (
                  <img src={conv.user.avatar} alt={conv.user.name} className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--color-rouge-100)', color: 'var(--color-rouge-700)' }}>
                    {conv.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-left">
                  <h3 className="font-semibold" style={{ color: 'var(--color-noir)' }}>{conv.user.name}</h3>
                  <p className="text-sm truncate max-w-[200px]" style={{ color: 'var(--color-noir-600)' }}>
                    {conv.lastMessage?.content || 'Aucun message'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                  {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString('fr-FR') : ''}
                </p>
                {conv.unreadCount > 0 && (
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                  >
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

