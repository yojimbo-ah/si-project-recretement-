'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Search, MessageSquare } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Notifications from '@/components/Notifications'

function MessagesContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const directMessageId = searchParams.get('to')

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 1. Initialisation de l'utilisateur et des conversations
  useEffect(() => {
    async function initMessages() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUser(user)

      const { data: msgData } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      
      const contactIds = new Set<string>()
      msgData?.forEach(m => {
        if (m.sender_id !== user.id) contactIds.add(m.sender_id)
        if (m.receiver_id !== user.id) contactIds.add(m.receiver_id)
      })

      if (directMessageId && directMessageId !== user.id) {
        contactIds.add(directMessageId)
      }

      if (contactIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(contactIds))
        
        setConversations(profiles || [])
        
        if (directMessageId) {
          const target = profiles?.find(p => p.id === directMessageId)
          if (target) setSelectedContact(target)
        } else if (profiles && profiles.length > 0) {
          setSelectedContact(profiles[0])
        }
      }
      setLoading(false)
    }
    initMessages()
  }, [directMessageId])

  // 2. Ecoute globale des nouveaux messages en temps réel
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`global-chat-${selectedContact?.id ?? 'none'}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMsg = payload.new as any
          
          if (selectedContact && (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedContact.id) ||
            (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === currentUser.id)
          )) {
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }

          if (newMsg.receiver_id === currentUser.id) {
            setConversations(prev => {
              if (prev.find(c => c.id === newMsg.sender_id)) return prev
              supabase.from('profiles').select('*').eq('id', newMsg.sender_id).single()
                .then(({ data }) => {
                  if (data) setConversations(p => [data, ...p])
                })
              return prev
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedContact, currentUser])

  // 3. Recharger le chat quand on change de contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return

    async function loadChat() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })
      
      setMessages(data || [])
    }
    loadChat()
  }, [selectedContact, currentUser])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || !currentUser) return

    const msgContent = newMessage
    setNewMessage('')

    const tempId = 'temp-' + Date.now()
    const tempMsg = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: msgContent,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: msgContent
    }).select().single()

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m))
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Messages</div>
          <div className="page-sub">Chat with other talents and recruiters</div>
        </div>
        <div className="topbar-actions">
          <Notifications />
        </div>
      </div>
      <div className="content" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)' }}>
        <div className="card" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border2)' }}>
            <div style={{ position: 'relative' }}>
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--hint)" />
              <input className="w-full bg-(--surface2) border-none rounded-lg py-2 pr-3 pl-7.5 text-[11px] outline-none" placeholder="Search conversations..." />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 && !loading && (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>
                No conversations yet. Start one from the Talent Community!
              </div>
            )}
            {conversations.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => setSelectedContact(contact)}
                style={{ 
                  padding: '12px 15px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border2)',
                  background: selectedContact?.id === contact.id ? 'var(--surface2)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div className="avatar-sm" style={{ width: '36px', height: '36px', background: 'var(--accent)' }}>
                  {(contact.first_name?.[0] || '') + (contact.last_name?.[0] || '')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contact.first_name} {contact.last_name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contact.location || 'Algeria'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          {selectedContact ? (
            <>
              <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar-sm" style={{ width: '32px', height: '32px' }}>
                  {(selectedContact.first_name?.[0] || '') + (selectedContact.last_name?.[0] || '')}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedContact.first_name} {selectedContact.last_name}</div>
                  <div style={{ fontSize: '10px', color: '#16a34a' }}>● Online</div>
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8f9fa' }}>
                {messages.map(m => {
                  const isMine = m.sender_id === currentUser?.id
                  return (
                    <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                      <div style={{ 
                        padding: '10px 14px', 
                        borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: isMine ? 'var(--accent)' : 'white',
                        color: isMine ? 'white' : 'var(--text)',
                        fontSize: '12px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        border: isMine ? 'none' : '1px solid var(--border2)'
                      }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--hint)', marginTop: '4px', textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid var(--border2)', display: 'flex', gap: '10px' }}>
                <input 
                  className="form-input" 
                  style={{ borderRadius: '20px', padding: '10px 18px' }}
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', gap: '10px' }}>
              <MessageSquare size={48} style={{ opacity: 0.1 }} />
              <div style={{ fontSize: '13px' }}>Select a conversation to start chatting</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}