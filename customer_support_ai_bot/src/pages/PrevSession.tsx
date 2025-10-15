
type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onLoad: () => void;
  session: { id: string; title?: string; messages?: ChatMessage[] } | null;
};


const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);


const BotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);


export default function PrevSessionModal({ open, onClose, onLoad, session }: Props) {
  if (!open || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2d3748;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col mx-4">

        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{session.title || 'Previous Conversation'}</h2>
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              onClick={onLoad}
            >
              Load Session
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>


        <div className="flex-grow p-4 overflow-y-auto max-h-[60vh] space-y-4 chat-scrollbar">
          {(!session.messages || session.messages.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500 dark:text-gray-400">No messages in this session.</p>
            </div>
          ) : (
            session.messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >

                {m.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 flex-shrink-0">
                    <BotIcon />
                  </div>
                )}

                <div
                  className={`max-w-md lg:max-w-lg px-4 py-2 rounded-xl whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>


                {m.sender === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    <UserIcon />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
