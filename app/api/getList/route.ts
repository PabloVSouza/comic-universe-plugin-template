import { NextRequest, NextResponse } from 'next/server'
import { getUtoonList } from '../../lib/utoon'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const languageCodes = Array.isArray(body?.languageCodes) ? body.languageCodes : undefined
    return NextResponse.json(await getUtoonList(languageCodes))
  } catch (error) {
    console.error('Error in getList:', error)
    return NextResponse.json([])
  }
}
