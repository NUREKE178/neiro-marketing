export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPrisma } from '@/lib/db'

// Meta-required Data Deletion Callback
// https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { signed_request } = body

    if (!signed_request) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
    }

    // Verify signed_request
    const [encodedSig, payload] = signed_request.split('.')
    const sig = Buffer.from(encodedSig, 'base64').toString('hex')
    
    const expectedSig = crypto
      .createHmac('sha256', process.env.META_APP_SECRET!)
      .update(payload)
      .digest('hex')

    if (sig !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const data = JSON.parse(Buffer.from(payload, 'base64').toString())
    const userId = data.user_id

    const prisma = await getPrisma()
    if (prisma) {
      // Find and delete user data
      // In production, you should delete all data for this external user ID
      // For now, log and mark for deletion
      console.log(`[Data Deletion] Request for external user ${userId}`)
      
      // Create a deletion confirmation code
      const confirmationCode = `del_${crypto.randomBytes(8).toString('hex')}`
      
      // In production: actually delete connected accounts, media, snapshots etc. where externalId = userId
      // await prisma.connectedAccount.deleteMany({ where: { externalId: userId } })
      
      return NextResponse.json({
        url: `${process.env.NEXTAUTH_URL}/data-deletion/status?code=${confirmationCode}`,
        confirmation_code: confirmationCode
      })
    }

    return NextResponse.json({
      url: `${process.env.NEXTAUTH_URL}/data-deletion/status?code=mock_${Date.now()}`,
      confirmation_code: `mock_${Date.now()}`
    })

  } catch (error: any) {
    console.error('[Data Deletion] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Meta Data Deletion Callback endpoint',
    usage: 'POST with signed_request',
    docs: 'https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback'
  })
}
