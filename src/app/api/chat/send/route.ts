import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'

type SendBody = {
  receiverId?: string
  content?: string
}

export async function POST(request: Request) {
  const supabase = await getServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData?.user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: SendBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body.receiverId || !body.content?.trim()) {
    return NextResponse.json({ error: 'receiverId and content are required.' }, { status: 400 })
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: authData.user.id,
      receiver_id: body.receiverId,
      content: body.content.trim()
    })
    .select('id, sender_id, receiver_id, content, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(message)
}
