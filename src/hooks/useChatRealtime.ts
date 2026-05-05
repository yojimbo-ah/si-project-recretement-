'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { type RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const DEBUG_REALTIME = true

type ChatMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

type HookStatus = 'connecting' | 'connected' | 'error'

type HookResult = {
  messages: ChatMessage[]
  status: HookStatus
  error?: string
}

function getSortedTopic(a: string, b: string) {
  const [first, second] = a < b ? [a, b] : [b, a]
  return `conversation:${first}:${second}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function getRecordFromPayload(payload: unknown) {
  const payloadRoot = isRecord(payload) ? payload : undefined
  const payloadEnvelope = payloadRoot && isRecord(payloadRoot.payload)
    ? payloadRoot.payload
    : undefined
  const operation =
    (payloadEnvelope && typeof payloadEnvelope.operation === 'string' && payloadEnvelope.operation) ||
    (payloadRoot && typeof payloadRoot.eventType === 'string' && payloadRoot.eventType) ||
    (payloadRoot && typeof payloadRoot.event === 'string' && payloadRoot.event) ||
    undefined

  const recordEnvelope = payloadEnvelope && isRecord(payloadEnvelope.record)
    ? payloadEnvelope.record
    : payloadRoot && isRecord(payloadRoot.new)
      ? payloadRoot.new
      : payloadRoot && isRecord(payloadRoot.record)
        ? payloadRoot.record
    : undefined

  const record = recordEnvelope && isRecord(recordEnvelope.record)
    ? recordEnvelope.record
    : recordEnvelope

  const oldRecordEnvelope = payloadEnvelope && isRecord(payloadEnvelope.old_record)
    ? payloadEnvelope.old_record
    : payloadRoot && isRecord(payloadRoot.old)
      ? payloadRoot.old
      : payloadRoot && isRecord(payloadRoot.old_record)
        ? payloadRoot.old_record
    : undefined

  const oldRecord = oldRecordEnvelope && isRecord(oldRecordEnvelope.record)
    ? oldRecordEnvelope.record
    : oldRecordEnvelope

  return { operation, record, oldRecord }
}

function getMessageId(record: Record<string, unknown> | undefined) {
  const id = record?.id
  return isString(id) ? id : null
}

function toChatMessage(record: Record<string, unknown> | undefined): ChatMessage | null {
  if (!record) return null

  const id = record.id
  const senderId = record.sender_id
  const receiverId = record.receiver_id
  const content = record.content
  const createdAt = record.created_at

  if (!isString(id) || !isString(senderId) || !isString(receiverId) || !isString(content) || !isString(createdAt)) {
    return null
  }

  return {
    id,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    created_at: createdAt,
  }
}

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort((left, right) => {
    const leftTime = left.created_at ? Date.parse(left.created_at) : 0
    const rightTime = right.created_at ? Date.parse(right.created_at) : 0
    return leftTime - rightTime
  })
}

function mergeMessages(
  previous: ChatMessage[],
  incoming: ChatMessage | null,
  incomingId: string | null,
  operation: string | undefined
) {
  if (!incomingId || !operation) return previous

  const nextMap = new Map(previous.map((message) => [String(message.id), message]))

  if (operation === 'INSERT') {
    if (!incoming) return previous
    if (!nextMap.has(incomingId)) {
      nextMap.set(incomingId, incoming)
    }
  } else if (operation === 'UPDATE') {
    if (!incoming) return previous
    nextMap.set(incomingId, incoming)
  } else if (operation === 'DELETE') {
    nextMap.delete(incomingId)
  }

  return sortMessages(Array.from(nextMap.values()))
}

function isConversationMessage(
  message: ChatMessage,
  currentUserId: string,
  otherUserId: string
) {
  return (
    (message.sender_id === currentUserId && message.receiver_id === otherUserId) ||
    (message.sender_id === otherUserId && message.receiver_id === currentUserId)
  )
}

export function useChatRealtime(params: {
  currentUserId?: string | null
  otherUserId?: string | null
} | null | undefined): HookResult {
  const currentUserId = params?.currentUserId ?? undefined
  const otherUserId = params?.otherUserId ?? undefined

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<HookStatus>('connecting')
  const [error, setError] = useState<string | undefined>()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const topic = useMemo(() => {
    if (!currentUserId || !otherUserId) return null
    return getSortedTopic(currentUserId, otherUserId)
  }, [currentUserId, otherUserId])

  useEffect(() => {
    if (!topic) return

    const activeTopic = topic
    const activeCurrentUserId = currentUserId
    const activeOtherUserId = otherUserId
    let active = true

    async function setup() {
      if (!activeCurrentUserId || !activeOtherUserId) return

      setStatus('connecting')
      setError(undefined)
      setMessages((prev) => sortMessages(prev))

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return

      if (sessionError || !data.session) {
        setStatus('error')
        setError(sessionError?.message || 'Missing active session.')
        return
      }

      supabase.realtime.setAuth(data.session.access_token)

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      const channel = supabase.channel(activeTopic, {
        config: { private: true }
      })

      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          if (DEBUG_REALTIME) {
            console.log('[realtime] raw payload', payload)
          }

          const { operation, record, oldRecord } = getRecordFromPayload(payload)
          const recordObject = isRecord(record) ? record : undefined
          const oldRecordObject = isRecord(oldRecord) ? oldRecord : undefined
          const messageRecord = toChatMessage(recordObject)
          const fallbackId = getMessageId(oldRecordObject)
          const messageId = messageRecord?.id ?? fallbackId

          if (!messageId) return

          const relevantMessage = messageRecord ?? toChatMessage(oldRecordObject)

          if (!relevantMessage || !isConversationMessage(relevantMessage, activeCurrentUserId, activeOtherUserId)) {
            return
          }

          setMessages((prev) => mergeMessages(prev, relevantMessage, messageId, operation))
        })
        .subscribe((state) => {
          if (!active) return
          const stateValue = String(state)

          if (stateValue === 'SUBSCRIBED' || stateValue === 'joined') {
            setStatus('connected')
          } else if (
            stateValue === 'CHANNEL_ERROR' ||
            stateValue === 'TIMED_OUT' ||
            stateValue === 'errored' ||
            stateValue === 'closed'
          ) {
            setStatus('error')
            setError(`Realtime status: ${stateValue}`)
          } else {
            setStatus('connecting')
          }
        })

      channelRef.current = channel
    }

    setup()

    return () => {
      active = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [topic, currentUserId, otherUserId, supabase])

  return { messages, status, error }
}