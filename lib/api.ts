import type { XStock, StockDetail, ChartPoint, JupiterToken, TimeRange } from './types'

const JUP_TOKENS_BASE = 'https://api.jup.ag/tokens/v1'
const JUP_PRICE_API = 'https://api.jup.ag/price/v2'
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens'
const BIRDEYE_API = 'https://public-api.birdeye.so/defi/history_price'

const CATEGORY_TAG: Record<string, string> = {
  stocks: 'xstock',
  preipo: 'preipo',
  lend: 'lend',
}

async function fetchTaggedTokens(tag: string): Promise<JupiterToken[]> {
  const res = await fetch(`${JUP_TOKENS_BASE}/tagged/${tag}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function fetchTokensByCategory(category: string): Promise<JupiterToken[]> {
  const tag = CATEGORY_TAG[category]
  if (!tag) return []
  return fetchTaggedTokens(tag)
}

export async function fetchTokenCounts(): Promise<Record<string, number>> {
  const [stocks, preipo, lend] = await Promise.all([
    fetchTaggedTokens('xstock').then((t) => t.length).catch(() => 0),
    fetchTaggedTokens('preipo').then((t) => t.length).catch(() => 0),
    fetchTaggedTokens('lend').then((t) => t.length).catch(() => 0),
  ])
  return { stocks, preipo, lend }
}

export async function fetchJupiterPrices(mints: string[]): Promise<Record<string, number | null>> {
  if (!mints.length) return {}
  const chunks = chunkArray(mints, 100)
  const results: Record<string, number | null> = {}

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await fetch(`${JUP_PRICE_API}?ids=${chunk.join(',')}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        for (const [id, val] of Object.entries(data.data ?? {})) {
          results[id] = val ? parseFloat((val as any).price) : null
        }
      } catch {}
    })
  )
  return results
}

export async function fetchDexScreenerData(
  mints: string[]
): Promise<Record<string, DexScreenerPairData>> {
  const results: Record<string, DexScreenerPairData> = {}
  await Promise.all(
    mints.map(async (mint) => {
      try {
        const res = await fetch(`${DEXSCREENER_API}/${mint}`, { next: { revalidate: 60 } })
        if (!res.ok) return
        const data = await res.json()
        const pairs: any[] = data.pairs ?? []
        if (!pairs.length) return
        const best = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0]
        results[mint] = {
          priceUsd: parseFloat(best.priceUsd ?? '0'),
          priceChange1h: best.priceChange?.h1 ?? null,
          priceChange24h: best.priceChange?.h24 ?? null,
          priceChange7d: best.priceChange?.h7d ?? null,
          priceChange30d: best.priceChange?.m30 ?? null,
          volume24h: best.volume?.h24 ?? null,
          liquidity: best.liquidity?.usd ?? null,
          marketCap: best.marketCap ?? null,
          pairAddress: best.pairAddress ?? null,
          buyCount24h: best.txns?.h24?.buys ?? null,
          sellCount24h: best.txns?.h24?.sells ?? null,
        }
      } catch {}
    })
  )
  return results
}

export async function fetchChartData(mint: string, range: TimeRange): Promise<ChartPoint[]> {
  const now = Math.floor(Date.now() / 1000)
  const rangeMap: Record<TimeRange, { from: number; type: string }> = {
    '1D': { from: now - 86400, type: '15m' },
    '1W': { from: now - 7 * 86400, type: '1H' },
    '1M': { from: now - 30 * 86400, type: '1D' },
    '1Y': { from: now - 365 * 86400, type: '1W' },
  }
  const { from, type } = rangeMap[range]

  try {
    const url = `${BIRDEYE_API}?address=${mint}&address_type=token&type=${type}&time_from=${from}&time_to=${now}`
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { 'x-chain': 'solana' },
    })
    if (!res.ok) return []
    const data = await res.json()
    const items: Array<{ unixTime: number; value: number }> = data?.data?.items ?? []
    return items.map((item) => ({ time: item.unixTime, price: item.value }))
  } catch {
    return []
  }
}

export async function buildXStockList(category: string, limit = 20): Promise<XStock[]> {
  const res = await fetch('https://tokens.jup.ag/tokens?tags=verified', { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const allTokens: JupiterToken[] = await res.json()
  const top = allTokens.slice(0, limit)
  const mints = top.map((t) => t.address)

  const [prices, dexData] = await Promise.all([
    fetchJupiterPrices(mints),
    fetchDexScreenerData(mints),
  ])

  return top.map((token) => {
    const dex = dexData[token.address]
    const jupPrice = prices[token.address]
    return {
      ...token,
      price: jupPrice ?? dex?.priceUsd ?? null,
      priceChange24h: dex?.priceChange24h ?? null,
      priceChange7d: dex?.priceChange7d ?? null,
      priceChange30d: dex?.priceChange30d ?? null,
      priceChange1h: dex?.priceChange1h ?? null,
      volume24h: dex?.volume24h ?? null,
      liquidity: dex?.liquidity ?? null,
      marketCap: dex?.marketCap ?? null,
    }
  })
}

export async function buildStockDetail(mint: string, range: TimeRange = '1D'): Promise<StockDetail | null> {
  const res = await fetch(`${JUP_TOKENS_BASE}/token/${mint}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const token: JupiterToken = await res.json()
  if (!token?.address) return null

  const [prices, dexData, chartData] = await Promise.all([
    fetchJupiterPrices([mint]),
    fetchDexScreenerData([mint]),
    fetchChartData(mint, range),
  ])

  const dex = dexData[mint]
  const price = prices[mint] ?? dex?.priceUsd ?? null

  return {
    ...token,
    price,
    priceChange24h: dex?.priceChange24h ?? null,
    priceChange7d: dex?.priceChange7d ?? null,
    priceChange30d: dex?.priceChange30d ?? null,
    priceChange1h: dex?.priceChange1h ?? null,
    volume24h: dex?.volume24h ?? null,
    liquidity: dex?.liquidity ?? null,
    marketCap: dex?.marketCap ?? null,
    holders: null,
    buyCount24h: dex?.buyCount24h ?? null,
    sellCount24h: dex?.sellCount24h ?? null,
    chartData,
    nav: null,
    navDiff: null,
    description: buildDescription(token),
    pairAddress: dex?.pairAddress ?? null,
  }
}

function buildDescription(token: JupiterToken): string {
  return `${token.name} xStock is a Solana SPL tracker certificate token issued by Backed Assets that replicates the price of ${token.name} shares, providing blockchain-based access backed by professional custodians.`
}

interface DexScreenerPairData {
  priceUsd: number
  priceChange1h: number | null
  priceChange24h: number | null
  priceChange7d: number | null
  priceChange30d: number | null
  volume24h: number | null
  liquidity: number | null
  marketCap: number | null
  pairAddress: string | null
  buyCount24h: number | null
  sellCount24h: number | null
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
