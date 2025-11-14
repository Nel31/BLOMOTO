import ChatList from '../components/Chat/ChatList';

export default function MessagesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <ChatList />
      </div>
    </div>
  );
}

