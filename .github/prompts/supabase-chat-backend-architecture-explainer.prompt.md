---
name: "Supabase Chat Socket Setup Explainer"
description: "Explain how the Supabase chat socket and realtime setup works in this codebase, including WebSocket channels, topic routing, auth, payload parsing, and failure modes."
argument-hint: "Explain how the chat socket setup works"
agent: "agent"
---

You are an expert Supabase architect. Explain, end-to-end, how the chat socket setup is handled in this codebase and why realtime updates behave the way they do.

Use plain language first, then move into technical detail.

## Required Scope

Cover these critical components:
- `public.messages` table writes
- database triggers or realtime change handlers that emit message events
- Supabase Realtime WebSocket channels and topic routing
- RLS policies and private-channel authorization
- client subscription code that opens the channel, sets auth, and parses incoming payloads

## Required Sections

### 1) Data flow overview
Explain the full path from send -> storage -> realtime event -> receive -> UI update.

### 2) Database layer
Describe the tables, columns, and constraints relevant to chat.

### 3) Realtime layer
Explain how the realtime event is produced. Compare client-side `realtime.send` style messages with database-change notifications such as `broadcast_changes` or `postgres_changes`. Explain what the trigger or listener does and why `SECURITY DEFINER` may be used when the database writes the event.

### 4) Topic strategy
Explain why the topic uses the least/greatest user-id ordering and how that guarantees both users share one channel.

### 5) Authorization
Explain how RLS policies, private channels, and `realtime.setAuth` work together. Make it clear that the topic is routing, not authorization by itself.

### 6) Payload contract
Explain what the frontend should expect inside the incoming payload, including where `operation` should live and where the record should be found for `INSERT`, `UPDATE`, and `DELETE`. Be explicit about the envelope shape the client parser expects.

### 7) Failure modes
List at least 8 concrete reasons the socket setup can stop updating even when rows are inserted. Include issues such as topic mismatch, payload nesting mismatch, missing operation, channel subscribed before auth is set, duplicate channels, cleanup bugs, RLS receiver mismatch, and missing indexes or filters.

### 8) Verification checklist
Provide a minimal verification checklist mapped to each stage:
- confirm trigger/broadcast execution
- confirm topic string
- confirm subscription auth
- inspect raw incoming payload
- confirm merge logic updates state

## Constraints

- Do not claim you verified actual trigger/function code unless it is explicitly provided.
- Explain what is expected and how to confirm it.
- Keep the focus on Supabase chat socket setup, realtime delivery, and backend authorization.
- Do not include links.

## Output Style

Write a structured Markdown answer with clear headings and bullet points.
Use technical words only where they add precision.
Keep the explanation clear, direct, and tied to the exact architecture described above.