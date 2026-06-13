import { buildStockDetail } from '@/lib/api'
import type { NextRequest } from 'next/server'
import type { TimeRange } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params
  const { searchParams } = request.nextUrl
  const range = (searchParams.get('range') ?? '1D') as TimeRange

  try {
    const detail = await buildStockDetail(mint, range)
    if (!detail) return Response.json({ error: 'Token not found' }, { status: 404 })
    return Response.json(detail)
  } catch (err) {
    console.error('[stock route]', err)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
