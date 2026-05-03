'use client'
import { useEffect, useState, useRef, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChatRealtime } from '@/hooks/useChatRealtime'
import { Send, Search, MessageSquare } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type Contact = {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

function MessagesContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [historicMessages, setHistoricMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages } = useChatRealtime({
  currentUserId: currentUser?.id ?? undefined,
  otherUserId: selectedContact?.id ?? undefined,
})

  // Fusionner historique + temps réel
  const allMessages = useMemo(() => {
    const map = new Map<string, Message>()
    historicMessages.forEach(m => map.set(m.id, m))
    messages.forEach((m: Message) => map.set(m.id, m))
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [historicMessages, messages])

  // 1. Récupérer l'utilisateur connecté
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setCurrentUser(data.user)
    }
    getUser()
  }, [])

  // 2. Récupérer les contacts (tous les users sauf soi)
  useEffect(() => {
    if (!currentUser) return
    async function loadContacts() {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .neq('id', currentUser.id)
      setContacts(data || [])

      // Pré-sélectionner via query param
      const targetId = searchParams.get('to') || searchParams.get('userId')
      if (targetId && data) {
        const target = data.find((c: Contact) => c.id === targetId)
        if (target) setSelectedContact(target)
      }
    }
    loadContacts()
  }, [currentUser])

  // 3. Charger l'historique quand on change de contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return
    setHistoricMessages([])

    async function loadChat() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact!.id}),and(sender_id.eq.${selectedContact!.id},receiver_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true })
      setHistoricMessages((data as Message[]) || [])
    }
    loadChat()
  }, [selectedContact, currentUser])

  // 4. Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  // 5. Envoyer un message
  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedContact || !currentUser) return

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: newMessage.trim(),
    })

    setNewMessage('')
  }

  const filteredContacts = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-content" style={{ display: 'flex', height: 'calc(100vh - 60px)', gap: 0, padding: 0 }}>
      {/* Liste des contacts */}
      <div className="card" style={{ width: '280px', borderRadius: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Messages</h2>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hint)' }} />
            <input
              className="input"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: selectedContact?.id === contact.id ? 'var(--accent-soft)' : 'transparent',
                borderLeft: selectedContact?.id === contact.id ? '3px solid var(--accent)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--accent-soft)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--accent)', flexShrink: 0
              }}>
                {contact.first_name?.[0]}{contact.last_name?.[0]}
              </div>
              <span style={{ fontSize: '14px', fontWeight: selectedContact?.id === contact.id ? 600 : 400 }}>
                {contact.first_name} {contact.last_name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedContact ? (
          <>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--accent-soft)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--accent)'
              }}>
                {selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}
              </div>
              <span style={{ fontWeight: 600 }}>{selectedContact.first_name} {selectedContact.last_name}</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '60%',
                    padding: '10px 14px',
                    borderRadius: msg.sender_id === currentUser?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.sender_id === currentUser?.id ? 'var(--accent)' : 'var(--surface2)',
                    color: msg.sender_id === currentUser?.id ? 'white' : 'var(--text)',
                    fontSize: '14px',
                    lineHeight: '1.4',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
              <input
                className="input"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={handleSendMessage} style={{ padding: '10px 16px' }}>
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--hint)' }}>
            <MessageSquare size={40} strokeWidth={1} />
            <p>Sélectionne un contact pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  )
}