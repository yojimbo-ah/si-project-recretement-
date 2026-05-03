import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'

export async function GET(
  _request: Request,
  context: { params: { conversationUserId: string } }
) {
  const otherUserId = context.params.conversationUserId

  if (!otherUserId) {
    return NextResponse.json({ error: 'Missing otherUserId.' }, { status: 400 })
  }

  const supabase = await getServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData?.user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const currentUserId = authData.user.id

  // Backend emits broadcast topics using least(sender_id, receiver_id) + greatest().
  const userA = currentUserId < otherUserId ? currentUserId : otherUserId
  const userB = currentUserId < otherUserId ? otherUserId : currentUserId

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, created_at')
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
    )
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    conversation: { userA, userB },
    messages: messages ?? []
  })
}
