

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


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
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [loading, setLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const send = async (text: string) => {
    const newUser: ChatMessage = { id: crypto.randomUUID(), role: "user", text }
    setMessages((m) => [...m, newUser])
    setLoading(true)
    try {
      const history = [...messages, newUser].map((m) => ({ role: m.role, text: m.text }))
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      })
      const data = (await res.json()) as { reply?: string; suggestions?: string[] }
      const reply = data.reply?.trim() || "Thanks! A human agent will follow up shortly."
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: reply }])
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

  return (
    <div className="bg-indigo-950 py-10 w-full min-h-screen">
  <Card className="mx-auto  w-full max-w-xl border-border">
      <header className="px-4 py-3 border-b border-border">
        <h1 className="text-lg font-semibold text-pretty">Customer Support</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Ask about your queries.
        </p>
      </header>

      <div
        ref={scrollRef}
          className="px-4 py-3 h-[48vh] overflow-y-auto space-y-3"
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

      <div className="px-4 pb-3 space-y-3 border-t border-border">
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
