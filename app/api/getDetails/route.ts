import { NextRequest, NextResponse } from 'next/server'
import { getUtoonMangaDetails } from '../../lib/utoon'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const siteId = typeof body?.siteId === 'string' ? body.siteId.trim() : ''
    const languageCodes = Array.isArray(body?.languageCodes) ? body.languageCodes : undefined

    if (!siteId) {
      return NextResponse.json(null)
    }

    return NextResponse.json(await getUtoonMangaDetails(siteId, languageCodes))
  } catch (error) {
    console.error('Error in getDetails:', error)
    return NextResponse.json(null)
  }
}
