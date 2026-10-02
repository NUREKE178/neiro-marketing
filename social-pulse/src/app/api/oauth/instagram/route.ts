export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const state = crypto.randomBytes(16).toString('hex')
  const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/oauth/instagram/callback`
  
  // Store state in cookie for CSRF protection
  const response = NextResponse.redirect(
    `https://www.facebook.com/${process.env.META_GRAPH_VERSION || 'v19.0'}/dialog/oauth?` +
    new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri,
      state,
      scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
      response_type: 'code',
    }).toString()
  )
  
  response.cookies.set('ig_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 min
  })
  
  return response
}
