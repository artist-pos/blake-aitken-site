import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().max(500).optional(),
  message: z.string().min(1).max(5000),
})

// Simple in-memory rate limiting: max 3 submissions per IP per 10 minutes
const ipLog = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 3

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipLog.get(ip)
  if (!entry || now > entry.resetAt) {
    ipLog.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_PER_WINDOW) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('form_submissions').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject ?? null,
    message: parsed.data.message,
  })

  if (error) {
    console.error('Contact form DB error:', error)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
