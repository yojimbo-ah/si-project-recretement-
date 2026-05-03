'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChatRealtime } from '@/hooks/useChatRealtime'
import { Send, Search, MessageSquare } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Notifications from '@/components/Notifications'

export default function MessagesPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const directMessageId = searchParams.get('to')

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [historicMessages, setHistoricMessages] = useState<any[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { messages: realtimeMessages, status: realtimeStatus, error: realtimeError } = useChatRealtime({
    currentUserId: currentUser?.id,
    otherUserId: selectedContact?.id
  })

  // Fusionner historique + temps réel
  const allMessages = useMemo(() => {
    const map = new Map()
    historicMessages.forEach(m => map.set(m.id, m))
    realtimeMessages.forEach(m => map.set(m.id, m))
    return Array.from(map.values()).sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [historicMessages, realtimeMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  // 1. Initialisation de l'utilisateur et des conversations
  useEffect(() => {
    async function initMessages() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

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
        
        if (profiles) {
          setConversations(profiles)
          if (directMessageId) {
            const target = profiles.find(p => p.id === directMessageId)
            if (target) setSelectedContact(target)
          } else if (profiles.length > 0) {
            setSelectedContact(profiles[0])
          }
        }
      }
      setLoading(false)
    }
    initMessages()
  }, [directMessageId])

  // 2. Charger l'historique quand on change de contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return
    setHistoricMessages([])

    async function loadChat() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })
      
      setHistoricMessages(data || [])
    }
    loadChat()
  }, [selectedContact, currentUser])

  // 3. Ecoute globale pour mettre à jour la liste des conversations
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`user-messages-${currentUser.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const newMsg = payload.new as any

          if (newMsg.receiver_id === currentUser.id || newMsg.sender_id === currentUser.id) {
            const otherPartyId = newMsg.sender_id === currentUser.id ? newMsg.receiver_id : newMsg.sender_id
            
            setConversations(prev => {
              const exists = prev.find(c => c.id === otherPartyId)
              if (exists) return prev
              
              supabase.from('profiles').select('*').eq('id', otherPartyId).single()
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
  }, [currentUser])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || !currentUser) return

    const msgContent = newMessage
    setNewMessage('')

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: msgContent
    })
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

      <div className="content" style={{ display: 'flex', gap: '20px', height: '100%', overflow: 'hidden' }}>

        {/* Liste des conversations */}
        <div className="card" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border2)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--hint)]" />
              <input 
                className="w-full bg-[var(--surface2)] border-none rounded-lg py-2 pr-3 pl-[30px] text-[11px] outline-none" 
                placeholder="Search conversations..." 
              />
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

        {/* Zone de Chat */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', height: '100%' }}>
          {selectedContact ? (
            <>
              {/* Header */}
              <div style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid var(--border2)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: 'white', 
                zIndex: 10,
                flexShrink: 0
              }}>
                <div className="avatar-sm" style={{ width: '32px', height: '32px' }}>
                  {(selectedContact.first_name?.[0] || '') + (selectedContact.last_name?.[0] || '')}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedContact.first_name} {selectedContact.last_name}</div>
                  <div style={{ fontSize: '10px', color: realtimeStatus === 'connected' ? '#16a34a' : 'var(--muted)' }}>
                    ● {realtimeStatus === 'connected' ? 'Live' : 'Connecting'}
                  </div>
                  {realtimeError && (
                    <div style={{ fontSize: '10px', color: '#ef4444' }}>{realtimeError}</div>
                  )}
                </div>
              </div>
              
              {/* Zone des messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8f9fa' }}>
                {allMessages.map((m, index) => {
                  const isMine = m.sender_id === currentUser?.id
                  const msgDate = new Date(m.created_at)
                  const prevMsg = index > 0 ? allMessages[index - 1] : null
                  const prevDate = prevMsg ? new Date(prevMsg.created_at) : null
                  const options: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Algiers' }
                  const isNewDay = !prevDate || 
                    msgDate.toLocaleDateString('en-US', options) !== prevDate.toLocaleDateString('en-US', options)

                  const formatDateLabel = (date: Date) => {
                    const options: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Algiers', year: 'numeric', month: 'numeric', day: 'numeric' }
                    const now = new Date()
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    const dateStr = date.toLocaleDateString('en-US', options)
                    const nowStr = now.toLocaleDateString('en-US', options)
                    const yesterdayStr = yesterday.toLocaleDateString('en-US', options)
                    if (dateStr === nowStr) return "Today"
                    if (dateStr === yesterdayStr) return "Yesterday"
                    return date.toLocaleDateString('en-US', { 
                      timeZone: 'Africa/Algiers',
                      day: 'numeric', 
                      month: 'long', 
                      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
                    })
                  }

                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      {isNewDay && (
                        <div style={{ 
                          textAlign: 'center', 
                          margin: '20px 0 10px', 
                          fontSize: '10px', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.5px',
                          color: 'var(--muted)',
                          fontWeight: 600
                        }}>
                          {formatDateLabel(msgDate)}
                        </div>
                      )}
                      <div style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
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
                          {msgDate.toLocaleTimeString('fr-DZ', { 
                            timeZone: 'Africa/Algiers', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSendMessage} style={{ 
                padding: '15px', 
                borderTop: '1px solid var(--border2)', 
                display: 'flex', 
                gap: '10px', 
                background: 'white', 
                zIndex: 10,
                flexShrink: 0
              }}>
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