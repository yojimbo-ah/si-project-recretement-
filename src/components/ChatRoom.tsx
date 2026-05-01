'use client'

import { useEffect, useMemo, useState } from 'react'
import { useChatRealtime } from '@/hooks/useChatRealtime'

type ChatMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

type ChatRoomProps = {
  currentUserId: string
  otherUserId: string
}

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort((left, right) => {
    const leftTime = Date.parse(left.created_at)
    const rightTime = Date.parse(right.created_at)
    return leftTime - rightTime
  })
}

export default function ChatRoom({ currentUserId, otherUserId }: ChatRoomProps) {
  const { messages, status, error } = useChatRealtime({ currentUserId, otherUserId })
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [composer, setComposer] = useState('')
  const [sending, setSending] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadHistory() {
      setLoadError(null)
      const response = await fetch(`/api/chat/${otherUserId}`)
      if (!response.ok) {
        setLoadError('Failed to load messages.')
        return
      }
      const payload = await response.json()
      if (!active) return
      setHistory(sortMessages(payload.messages || []))
    }

    if (currentUserId && otherUserId) {
      loadHistory()
    }

    return () => {
      active = false
    }
  }, [currentUserId, otherUserId])

  const mergedMessages = useMemo(() => {
    const map = new Map<string, ChatMessage>()
    history.forEach((message) => map.set(message.id, message))
    messages.forEach((message) => {
      map.set(message.id, message)
    })
    return sortMessages(Array.from(map.values()))
  }, [history, messages])

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!composer.trim() || sending) return
    setSending(true)

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: otherUserId, content: composer.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to send message.')
      }

      setComposer('')
    } catch (sendError: unknown) {
      const message = sendError instanceof Error ? sendError.message : 'Failed to send message.'
      setLoadError(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chat-room">
      <header className="chat-room__header">
        <h2>Conversation</h2>
        <span className="chat-room__status">
          {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Error'}
        </span>
      </header>

      {(error || loadError) && (
        <p className="chat-room__error">{error || loadError}</p>
      )}

      <div className="chat-room__messages">
        {mergedMessages.length === 0 ? (
          <p className="chat-room__empty">No messages yet.</p>
        ) : (
          mergedMessages.map((message) => (
            <article key={message.id} className="chat-room__message">
              <p className="chat-room__content">{message.content}</p>
              <span className="chat-room__meta">
                {message.sender_id === currentUserId ? 'You' : message.sender_id}
              </span>
            </article>
          ))
        )}
      </div>

      <form className="chat-room__composer" onSubmit={handleSend}>
        <input
          className="chat-room__input"
          placeholder="Type a message..."
          value={composer}
          onChange={(event) => setComposer(event.target.value)}
          disabled={sending}
        />
        <button className="chat-room__send" type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  )
}
