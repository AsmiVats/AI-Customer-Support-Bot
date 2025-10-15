type Role = 'user' | 'assistant'
type ChatMessage = { id: string; role: Role; text: string }

type Props = {
  open: boolean
  onClose: () => void
  onLoad: () => void
  session: { id: string; title?: string; messages?: ChatMessage[] } | null
}

export default function PrevSessionModal({ open, onClose, onLoad, session }: Props) {
  if (!open || !session) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{session.title || 'Previous Conversation'}</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-primary text-primary-foreground" onClick={onLoad}>Load into chat</button>
            <button className="px-3 py-1 rounded bg-muted text-muted-foreground" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2">
          {(!session.messages || session.messages.length === 0) ? (
            <div className="text-sm text-muted-foreground">No messages for this session.</div>
          ) : (
            session.messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={"inline-block px-3 py-2 rounded " + (m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>{m.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
