import { NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  })
}

export async function GET() {
  return NextResponse.json(
    {
      name: 'UTOON',
      tag: 'utoon',
      version: '2.0.0',
      contentTypes: ['manga', 'comic'],
      capabilities: ['metadata', 'content'],
      features: {
        onDemandPageList: true
      },
      languageCodes: ['en'],
      sources: [
        {
          id: 'utoon',
          name: 'UTOON',
          languageCodes: ['en'],
          isDefault: true
        }
      ]
    },
    {
      headers: CORS_HEADERS
    }
  )
}
