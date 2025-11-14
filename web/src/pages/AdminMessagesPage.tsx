import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ChatWindow from '../components/Chat/ChatWindow';

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
    role?: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function AdminMessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get('userId'));
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
    loadAllUsers();
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
      setConversations([]);
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await api.get('/users');
      // Filtrer pour exclure les admins
      const filteredUsers = (res.data.users || []).filter((u: User) => u.role !== 'admin');
      setAllUsers(filteredUsers);
    } catch (error: any) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const handleCloseChat = () => {
    setSelectedUserId(null);
    setSearchParams({});
  };

  const handleStartNewConversation = (userId: string) => {
    setSelectedUserId(userId);
    setSearchParams({ userId });
    setShowNewConversation(false);
    setSearchQuery('');
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-noir)' }}>
          Messages
        </h2>
        <button
          onClick={() => setShowNewConversation(!showNewConversation)}
          className="px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
        >
          + Nouvelle conversation
        </button>
      </div>

      {/* Modal pour nouvelle conversation */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" style={{ maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-noir)' }}>Nouvelle conversation</h3>
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setSearchQuery('');
                }}
                className="text-2xl hover:opacity-70"
                style={{ color: 'var(--color-noir-600)' }}
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un utilisateur ou garagiste..."
              className="w-full px-4 py-2 rounded-lg border-2 mb-4 outline-none"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
            />
            <div className="overflow-y-auto flex-1">
              {filteredUsers.length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--color-noir-600)' }}>
                  Aucun utilisateur trouvé
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleStartNewConversation(user._id)}
                      className="w-full p-3 bg-white rounded-lg border hover:bg-[var(--color-racine-50)] transition-all duration-200 flex items-center gap-3"
                      style={{ borderColor: 'var(--color-racine-200)' }}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--color-rouge-100)', color: 'var(--color-rouge-700)' }}>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="text-left flex-1">
                        <p className="font-semibold" style={{ color: 'var(--color-noir)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
                          {user.email} • {user.role === 'garagiste' ? 'Garagiste' : 'Client'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liste des conversations */}
      {conversations.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucune conversation</p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-noir-500)' }}>Cliquez sur "Nouvelle conversation" pour commencer</p>
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

