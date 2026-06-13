import { buildXStockList, fetchTokenCounts } from '@/lib/api'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category') ?? 'stocks'
  const counts = searchParams.get('counts') === 'true'

  try {
    if (counts) {
      const tokenCounts = await fetchTokenCounts()
      return Response.json(tokenCounts)
    }
    const stocks = await buildXStockList('all', 20)
    return Response.json(stocks)
  } catch (err) {
    console.error('[xstocks route]', err)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
