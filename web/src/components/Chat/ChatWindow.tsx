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

interface Quote {
  _id: string;
  quoteNumber: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  total: number;
  clientId?: any;
}

export default function ChatWindow({ userId, appointmentId, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [processingQuote, setProcessingQuote] = useState<string | null>(null);
  const [showQuoteMenu, setShowQuoteMenu] = useState(false);
  const [showInvoiceMenu, setShowInvoiceMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadConversation();
    setupSocket();
    // Charger les devis si l'utilisateur est un client
    if (currentUser?.role === 'client') {
      loadQuotes();
    }
    // Charger les devis et factures si l'utilisateur est un garagiste
    if (currentUser?.role === 'garagiste') {
      loadGarageQuotes();
      loadGarageInvoices();
    }
    return () => {
      socketService.offMessage();
    };
  }, [userId, currentUser]);

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

  const loadQuotes = async () => {
    try {
      const res = await api.get("/quotes/client/me");
      setQuotes(res.data.quotes || []);
    } catch (err) {
      console.error('Erreur chargement devis:', err);
    }
  };

  const loadGarageQuotes = async () => {
    try {
      const res = await api.get("/quotes/garage/me");
      setQuotes(res.data.quotes || []);
    } catch (err) {
      console.error('Erreur chargement devis garagiste:', err);
    }
  };

  const loadGarageInvoices = async () => {
    try {
      const res = await api.get("/invoices/garage/me");
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Erreur chargement factures:', err);
    }
  };

  const sendQuoteViaChat = async (quoteId: string) => {
    try {
      await api.post(`/quotes/${quoteId}/send`, {
        sendViaChat: true,
        sendViaEmail: false,
      });
      setShowQuoteMenu(false);
      await loadConversation(); // Recharger les messages
      alert("Devis envoyé avec succès !");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  const sendInvoiceViaChat = async (invoiceId: string) => {
    try {
      await api.post(`/invoices/${invoiceId}/send`, {
        sendViaChat: true,
        sendViaEmail: false,
      });
      setShowInvoiceMenu(false);
      await loadConversation(); // Recharger les messages
      alert("Facture envoyée avec succès !");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  const extractQuoteNumber = (content: string): string | null => {
    // Chercher un pattern comme "Devis DEV-2025-0001" ou "Devis DEV-2025-0001 -"
    const match = content.match(/Devis\s+([A-Z]+-\d{4}-\d+)/i);
    return match ? match[1] : null;
  };

  const getQuoteFromMessage = (msg: Message): Quote | null => {
    if (currentUser?.role !== 'client') return null;
    const quoteNumber = extractQuoteNumber(msg.content);
    if (!quoteNumber) return null;
    return quotes.find(q => q.quoteNumber === quoteNumber) || null;
  };

  const acceptQuote = async (quoteId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir accepter ce devis ?")) {
      return;
    }

    setProcessingQuote(quoteId);
    try {
      await api.put(`/quotes/${quoteId}/accept`);
      await loadQuotes();
      alert("Devis accepté avec succès !");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'acceptation");
    } finally {
      setProcessingQuote(null);
    }
  };

  const rejectQuote = async (quoteId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter ce devis ?")) {
      return;
    }

    setProcessingQuote(quoteId);
    try {
      await api.put(`/quotes/${quoteId}/reject`);
      await loadQuotes();
      alert("Devis rejeté");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors du rejet");
    } finally {
      setProcessingQuote(null);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Fermer les menus en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.quote-menu') && !target.closest('.invoice-menu')) {
        setShowQuoteMenu(false);
        setShowInvoiceMenu(false);
      }
    };

    if (showQuoteMenu || showInvoiceMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showQuoteMenu, showInvoiceMenu]);

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
                  
                  {/* Attachments (PDFs, images, etc.) */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((attachment, idx) => {
                        const isPDF = attachment.toLowerCase().endsWith('.pdf') || attachment.includes('pdf') || attachment.includes('application/pdf');
                        const quote = !isOwn && currentUser?.role === 'client' && isPDF ? getQuoteFromMessage(msg) : null;
                        const canAccept = quote && quote.status === 'sent' && new Date(quote.validUntil) >= new Date();
                        
                        return (
                          <div key={idx} className="border rounded-lg p-3 bg-white/50">
                            {isPDF ? (
                              <div>
                                <a
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-3"
                                >
                                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Document PDF</p>
                                    <p className="text-xs text-gray-500">Cliquez pour télécharger</p>
                                  </div>
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                                
                                {/* Boutons d'action en bas du PDF pour les devis */}
                                {quote && (
                                  <div className="pt-3 border-t border-gray-200">
                                    {quote.status === 'accepted' ? (
                                      <div className="flex items-center gap-2 p-2 rounded bg-green-50">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-semibold text-green-700">✓ Devis accepté</p>
                                      </div>
                                    ) : quote.status === 'rejected' ? (
                                      <div className="flex items-center gap-2 p-2 rounded bg-red-50">
                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-semibold text-red-700">✗ Devis rejeté</p>
                                      </div>
                                    ) : canAccept ? (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => acceptQuote(quote._id)}
                                          disabled={processingQuote === quote._id}
                                          className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 hover:shadow-md"
                                          style={{ backgroundColor: '#10b981', color: 'white' }}
                                        >
                                          {processingQuote === quote._id ? 'Traitement...' : '✓ Accepter le devis'}
                                        </button>
                                        <button
                                          onClick={() => rejectQuote(quote._id)}
                                          disabled={processingQuote === quote._id}
                                          className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 hover:shadow-md"
                                          style={{ backgroundColor: '#ef4444', color: 'white' }}
                                        >
                                          {processingQuote === quote._id ? 'Traitement...' : '✗ Refuser le devis'}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 p-2 rounded bg-yellow-50">
                                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-semibold text-yellow-700">Devis expiré</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <a
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img src={attachment} alt="Attachment" className="max-w-full h-auto rounded" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
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
        {/* Boutons pour envoyer devis/facture (uniquement pour garagiste) */}
        {currentUser?.role === 'garagiste' && (
          <div className="flex gap-2 mb-2">
            <div className="relative quote-menu">
              <button
                onClick={() => {
                  setShowQuoteMenu(!showQuoteMenu);
                  setShowInvoiceMenu(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all hover:shadow-md"
                style={{ 
                  borderColor: 'var(--color-racine-300)', 
                  color: 'var(--color-racine-700)',
                  backgroundColor: showQuoteMenu ? 'var(--color-racine-100)' : 'white'
                }}
              >
                📄 Envoyer un devis
              </button>
              {showQuoteMenu && quotes.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border-2 z-50 max-h-60 overflow-y-auto min-w-[250px]" style={{ borderColor: 'var(--color-racine-200)' }}>
                  <div className="p-2">
                    <p className="text-xs font-semibold mb-2 px-2" style={{ color: 'var(--color-noir-700)' }}>Sélectionner un devis :</p>
                    {quotes
                      .filter((q: any) => q.clientId?._id === userId || q.clientId === userId)
                      .map((quote: any) => (
                        <button
                          key={quote._id}
                          onClick={() => sendQuoteViaChat(quote._id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg mb-1 transition-colors"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          <div className="font-semibold">{quote.quoteNumber}</div>
                          <div className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            {quote.total.toLocaleString()} XOF - {quote.status === 'sent' ? 'Envoyé' : quote.status === 'accepted' ? 'Accepté' : quote.status}
                          </div>
                        </button>
                      ))}
                    {quotes.filter((q: any) => q.clientId?._id === userId || q.clientId === userId).length === 0 && (
                      <p className="text-xs px-2 py-2" style={{ color: 'var(--color-noir-500)' }}>Aucun devis pour ce client</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative invoice-menu">
              <button
                onClick={() => {
                  setShowInvoiceMenu(!showInvoiceMenu);
                  setShowQuoteMenu(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all hover:shadow-md"
                style={{ 
                  borderColor: 'var(--color-rouge-300)', 
                  color: 'var(--color-rouge-700)',
                  backgroundColor: showInvoiceMenu ? 'var(--color-rouge-100)' : 'white'
                }}
              >
                🧾 Envoyer une facture
              </button>
              {showInvoiceMenu && invoices.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border-2 z-50 max-h-60 overflow-y-auto min-w-[250px]" style={{ borderColor: 'var(--color-rouge-200)' }}>
                  <div className="p-2">
                    <p className="text-xs font-semibold mb-2 px-2" style={{ color: 'var(--color-noir-700)' }}>Sélectionner une facture :</p>
                    {invoices
                      .filter((inv: any) => inv.clientId?._id === userId || inv.clientId === userId)
                      .map((invoice: any) => (
                        <button
                          key={invoice._id}
                          onClick={() => sendInvoiceViaChat(invoice._id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg mb-1 transition-colors"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          <div className="font-semibold">{invoice.invoiceNumber}</div>
                          <div className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            {invoice.total.toLocaleString()} XOF - {invoice.status}
                          </div>
                        </button>
                      ))}
                    {invoices.filter((inv: any) => inv.clientId?._id === userId || inv.clientId === userId).length === 0 && (
                      <p className="text-xs px-2 py-2" style={{ color: 'var(--color-noir-500)' }}>Aucune facture pour ce client</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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

