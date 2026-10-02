export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getTikTokAuthUrl } from '@/lib/tiktok'

export async function GET(req: NextRequest) {
  const state = crypto.randomBytes(16).toString('hex')
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/oauth/tiktok/callback`
  
  const authUrl = getTikTokAuthUrl(redirectUri, state)
  
  const response = NextResponse.redirect(authUrl)
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  })
  
  return response
}
