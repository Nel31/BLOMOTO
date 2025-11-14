import { useNavigate } from 'react-router-dom';
import ChatList from '../components/Chat/ChatList';

export default function GarageMessagesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen animate-fadeIn" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Bouton de retour au dashboard */}
        <button
          onClick={() => navigate("/garage")}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'var(--color-racine-600)', color: 'white' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au dashboard
        </button>
        
        <ChatList />
      </div>
    </div>
  );
}

