export interface JupiterToken {
  address: string
  symbol: string
  name: string
  logoURI: string
  tags: string[]
  decimals: number
  extensions?: {
    coingeckoId?: string
    description?: string
    website?: string
  }
}

export interface XStock extends JupiterToken {
  price: number | null
  priceChange24h: number | null
  priceChange7d: number | null
  priceChange30d: number | null
  priceChange1h: number | null
  volume24h: number | null
  liquidity: number | null
  marketCap: number | null
}

export interface StockDetail extends XStock {
  holders: number | null
  buyCount24h: number | null
  sellCount24h: number | null
  chartData: ChartPoint[]
  nav: number | null
  navDiff: number | null
  description: string | null
  pairAddress: string | null
}

export interface ChartPoint {
  time: number
  price: number
}

export type TimeRange = '1D' | '1W' | '1M' | '1Y'
export type TabType = 'stocks' | 'preipo' | 'lend'
