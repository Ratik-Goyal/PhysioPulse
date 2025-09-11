import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' })
    const text = await res.text()
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body: text }, { status: 502 })
    }
    return NextResponse.json({ ok: true, status: res.status, body: text })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 502 })
  }
}
