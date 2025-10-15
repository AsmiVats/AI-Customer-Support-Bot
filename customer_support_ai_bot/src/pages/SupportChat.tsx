

import {useEffect,useState,useRef} from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessage, createSession, getSession, endSession } from "@/api/Session"
import PrevSessionModal from '@/pages/PrevSession'


type Role = "user" | "assistant"
type ChatMessage = { id: string; role: Role; text: string }

type BubbleProps = {
  role: "user" | "assistant"
  text: string
}

function MessageBubble({ role, text }: BubbleProps) {
  const isUser = role === "user"
  const base = "px-4 py-2 rounded-lg leading-relaxed text-pretty shadow-sm max-w-[80%]"
  const userStyles = "bg-primary text-primary-foreground rounded-br-sm ml-auto"
  const assistantStyles = "bg-secondary text-secondary-foreground rounded-bl-sm"

  return (
    <div className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(base, isUser ? userStyles : assistantStyles)} aria-live="polite">
        {text}
      </div>
    </div>
  )
}

export default function SupportChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<Array<{ id: string; title?: string; server?: boolean; messages?: ChatMessage[] }>>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<{ id: string; title?: string; messages?: ChatMessage[] } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  // load sessions from localStorage on mount, then create a new session for this page load
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem('cs_sessions')
        if (raw) {
          setSessions(JSON.parse(raw))
        }
      } catch (e) {
        // ignore
      }

      // create a new session for this page load and clear messages
      try { await createNewSession(true) } catch (e) { /* ignore */ }
    })()
  }, [])

  const send = async (text: string) => {
    setLoading(true)
    try {
      // ensure we have an active session id; auto-create when absent
      let sessionIdToUse = activeSession
      let createdMeta: { id: string; server: boolean } | null = null
      if (!sessionIdToUse) {
        // create session but don't clear messages so user's message isn't wiped
        createdMeta = await createNewSession(false)
        sessionIdToUse = createdMeta.id
      }

      // now add the user's message (after any potential session creation)
      const newUser: ChatMessage = { id: crypto.randomUUID(), role: "user", text }
      setMessages((m) => [...m, newUser])

      // determine if session is server-backed: prefer newly-created metadata when available
      const sess = createdMeta ?? sessions.find((s) => s.id === sessionIdToUse)
      if (sess?.server) {
        // server-backed: call API and append server reply when present
        const res = await sendMessage(sessionIdToUse, text)
        console.log(res);
        if (res?.reply) {
          setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: res.reply }])
        }
      } else {
        // local-only session: persist the user message into session metadata
        const next = sessions.map((s) => s.id === sessionIdToUse ? { ...s, messages: [...(s.messages || []), newUser] } : s)
        setSessions(next)
        try { localStorage.setItem('cs_sessions', JSON.stringify(next)) } catch (e) { /* ignore */ }
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = input.trim()
    if (!value) return
    setInput("")
    await send(value)
  }

  const quickAsk = async (text: string) => {
    if (loading) return
    await send(text)
  }

  const createNewSession = async (clearMessages = true): Promise<{ id: string; server: boolean }> => {
    // try server-backed createSession, fall back to local
    try {
      // try to include logged-in user id by decoding JWT from localStorage if available
      let userId: string | undefined = undefined
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const payload = token.split('.')[1]
          if (payload) {
            const decoded = JSON.parse(atob(payload))
            userId = decoded?.userId || decoded?.user?.id || decoded?.sub
          }
        }
      } catch (err) {
        // ignore decode errors
      }

      const res = await createSession(userId);
      const sessionId = res?.sessionId || crypto.randomUUID()
      const isServer = !!res?.sessionId
      const newSession = { id: sessionId, title: `Session ${new Date().toLocaleString()}`, server: isServer, messages: [] as ChatMessage[] }
      const next = [newSession, ...sessions]
      setSessions(next)
      setActiveSession(sessionId)
      if (clearMessages) setMessages([])
      try { localStorage.setItem('cs_sessions', JSON.stringify(next)) } catch (e) { /* ignore */ }
      return { id: sessionId, server: isServer }
    } catch (e) {
      // fallback to local-only session
      const sessionId = crypto.randomUUID()
      const newSession = { id: sessionId, title: `Session ${new Date().toLocaleString()}`, server: false, messages: [] as ChatMessage[] }
      const next = [newSession, ...sessions]
      setSessions(next)
      setActiveSession(sessionId)
      if (clearMessages) setMessages([])
      try { localStorage.setItem('cs_sessions', JSON.stringify(next)) } catch (e) { /* ignore */ }
      return { id: sessionId, server: false }
    }
  }

  const loadSession = async (sessionId: string) => {
    setActiveSession(sessionId)
    // load from server only if this is a server-backed session; otherwise load stored local messages
    const sess = sessions.find((s) => s.id === sessionId)
    if (sess?.server) {
      try {
        const res = await getSession(sessionId)
        const raw = (res?.messages || []) as Array<any>
        const loaded: ChatMessage[] = raw.map((m: any) => ({ id: crypto.randomUUID(), role: m.sender === 'user' ? 'user' : 'assistant', text: m.text }))
        setMessages(loaded)
      } catch (e) {
        setMessages([])
      }
    } else {
      setMessages(sess?.messages || [])
    }
  }

  const removeSession = async (sessionId: string) => {
    // mark ended locally and remove from list
    const next = sessions.filter(s => s.id !== sessionId)
    setSessions(next)
    if (activeSession === sessionId) {
      setActiveSession(null)
      setMessages([])
    }
    localStorage.setItem('cs_sessions', JSON.stringify(next))
    // optional server call to end
    try { await endSession(sessionId) } catch (e) { /* ignore */ }
  }

  const openPreview = async (s: { id: string; title?: string; server?: boolean; messages?: ChatMessage[] }) => {
    if (s.server) {
      try {
        const res = await getSession(s.id)
        const raw = (res?.messages || []) as Array<any>
        const loaded: ChatMessage[] = raw.map((m: any) => ({ id: crypto.randomUUID(), role: m.sender === 'user' ? 'user' : 'assistant', text: m.text }))
        setSelectedSession({ id: s.id, title: s.title, messages: loaded })
      } catch (e) {
        setSelectedSession({ id: s.id, title: s.title, messages: [] })
      }
    } else {
      setSelectedSession(s)
    }
    setModalOpen(true)
  }

  

  return (
    <div className="bg-indigo-950 py-10 w-full min-h-screen">
  <Card className="mx-auto  w-full max-w-xl border-border">
      <header className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-pretty">Customer Support</h1>
          <p className="text-sm text-muted-foreground text-pretty">Ask about your queries.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => createNewSession(true)}>+ New</Button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-48 border-r border-border p-3 hidden md:block">
          <h3 className="text-sm font-medium text-pretty mb-2">Past Conversations</h3>
          <div className="flex flex-col gap-2">
            {sessions.length === 0 ? (
              <div className="text-xs text-muted-foreground">No past sessions. Create one with + New.</div>
            ) : null}
            {sessions.map((s) => (
              <div key={s.id} className={"p-2 rounded hover:bg-accent/10 cursor-pointer " + (s.id === activeSession ? 'bg-accent/20' : '')}>
                <div className="flex items-center justify-between">
                    <button className="text-sm text-left w-full" onClick={() => openPreview(s)}>{s.title || s.id}</button>
                  <button className="text-xs text-muted-foreground ml-2" onClick={() => removeSession(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

          <PrevSessionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onLoad={() => {
              if (selectedSession) loadSession(selectedSession.id)
              setModalOpen(false)
            }}
            session={selectedSession}
          />

        <div
          ref={scrollRef}
          className="px-4 py-3 h-[48vh] overflow-y-auto space-y-3 flex-1"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">How can we help today? Try a quick question below.</div>
        ) : null}

        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} text={m.text} />
        ))}
      </div>

      </div>

      <div className="px-4 pb-3 space-y-3 border-t border-border">
        {sessions.find((s) => s.id === activeSession && !s.server) ? (
          <div className="px-3 py-2 rounded bg-yellow-600/10 text-yellow-200 text-sm">This session is local-only — sign in to store conversations and get server replies.</div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => quickAsk("I need help finding my order status.")}>
            Order status
          </Button>
          <Button variant="secondary" size="sm" onClick={() => quickAsk("How do I request a refund?")}>
            Refunds
          </Button>
          <Button variant="secondary" size="sm" onClick={() => quickAsk("I want to talk to a human agent.")}>
            Talk to human
          </Button>
        </div>

        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <label htmlFor="message" className="sr-only">
            Type your message
          </label>
          <Input
            id="message"
            name="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </Card>
    </div>
  )
}
