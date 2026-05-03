'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Notifications() {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) return

      // 1. Chargement initial
      const { data } = await supabase
        .from('messages')
        .select('*, profiles:sender_id(first_name)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (data) {
        setNotifications(data.map(m => ({
          id: m.id,
          title: `New message from ${m.profiles?.first_name || 'User'}`,
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString('fr-DZ', { 
            timeZone: 'Africa/Algiers',
            hour: '2-digit', 
            minute: '2-digit' 
          })

        })))
      }

      // 2. Ecoute en temps réel
      if (channelRef.current) return

      const channelName = `notifs-${user.id}`
      const channel = supabase.channel(channelName)
      channelRef.current = channel

      channel
        // Listener pour les nouveaux messages
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${user.id}` 
          }, 
          async (payload) => {
            const newMsg = payload.new as any
            const { data: sender } = await supabase.from('profiles').select('first_name').eq('id', newMsg.sender_id).single()

            const newNotif = {
              id: newMsg.id,
              title: `New message from ${sender?.first_name || 'User'}`,
              text: newMsg.content,
              time: 'Just now'
            }
            setNotifications(prev => [newNotif, ...prev].slice(0, 5))
          }
        )
        // Listener pour les changements de statut (offres, interviews, etc)
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'applications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            const updatedApp = payload.new as any
            const { data: job } = await supabase.from('job_offers').select('title, company').eq('id', updatedApp.job_id).single()
            
            const statusLabels: Record<string, string> = {
              'pending': 'under review',
              'review': 'being reviewed',
              'interview': 'invited to interview',
              'offer': 'received an OFFER!',
              'rejected': 'not selected this time'
            }

            const newNotif = {
              id: updatedApp.id + updatedApp.status,
              title: `Application Update: ${job?.company || 'Job'}`,
              text: `Your application for ${job?.title} is now ${statusLabels[updatedApp.status] || updatedApp.status}.`,
              time: 'Just now'
            }
            setNotifications(prev => [newNotif, ...prev].slice(0, 5))
          }
        )
        .subscribe()


    }

    loadData()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="btn-ghost" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        <Bell size={16} />
        {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            Notifications
            <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', opacity: 0.5 }}>&times;</span>
          </div>
          <div className="notif-body">
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>
                No new notifications
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="notif-item">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-text">{n.text}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
              ))
            )}
          </div>
          <div className="notif-footer" onClick={() => setNotifications([])}>
            Clear all
          </div>
        </div>
      )}
    </div>
  )
}
