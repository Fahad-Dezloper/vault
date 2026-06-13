'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { TokenLogo } from './TokenLogo'
import { ChangeBadge } from './ChangeBadge'
import { formatPrice, formatChange, formatVolume, formatMarketCap } from '@/lib/format'
import type { StockDetail, TimeRange } from '@/lib/types'

const PriceChart = dynamic(() => import('./PriceChart').then((m) => ({ default: m.PriceChart })), {
  ssr: false,
  loading: () => <div className="h-44 bg-gray-50 rounded-2xl mx-4 animate-pulse" />,
})

const RANGES: TimeRange[] = ['1D', '1W', '1M', '1Y']

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface DetailClientProps {
  mint: string
}

export function DetailClient({ mint }: DetailClientProps) {
  const router = useRouter()
  const [range, setRange] = useState<TimeRange>('1D')

  const { data: stock, isLoading } = useSWR<StockDetail>(
    `/api/stock/${mint}?range=${range}`,
    fetcher,
    { refreshInterval: 15_000, revalidateOnFocus: true }
  )

  const handleRange = useCallback((r: TimeRange) => setRange(r), [])

  if (isLoading || !stock) {
    return <DetailSkeleton onBack={() => router.back()} />
  }

  const change = range === '1D' ? stock.priceChange24h
    : range === '1W' ? stock.priceChange7d
    : range === '1M' ? stock.priceChange30d
    : stock.priceChange30d
  const isPositive = (change ?? 0) >= 0

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 shrink-0"
          aria-label="Go back"
        >
          <BackIcon />
        </button>
      </div>

      {/* Token info */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <TokenLogo src={stock.logoURI} symbol={stock.symbol} size={52} />
        <div>
          <p className="font-bold text-black text-xl">{stock.symbol}</p>
          <p className="text-gray-500 text-sm">{stock.name}</p>
        </div>
      </div>

      {/* Range picker */}
      <div className="flex gap-2 px-4 pb-4">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => handleRange(r)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              range === r
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Price + change */}
      <div className="flex items-baseline justify-between px-4 pb-4">
        <span className="text-3xl font-bold text-black">{formatPrice(stock.price)}</span>
        <span className={`text-base font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {formatChange(change)}
        </span>
      </div>

      {/* Chart */}
      <div className="pb-6 px-4">
        <PriceChart data={stock.chartData} isPositive={isPositive} />
      </div>

      {/* Period change cards */}
      <div className="grid grid-cols-4 gap-2 px-4 pb-4">
        {[
          { label: '1H', val: stock.priceChange1h },
          { label: '24H', val: stock.priceChange24h },
          { label: '7D', val: stock.priceChange7d },
          { label: '30D', val: stock.priceChange30d },
        ].map(({ label, val }) => (
          <div key={label} className="bg-gray-50 rounded-2xl p-3 flex flex-col gap-1">
            <span className="text-gray-400 text-[11px] font-medium">{label}</span>
            {val === null ? (
              <span className="text-gray-300 text-[13px]">—</span>
            ) : (
              <span className={`text-[13px] font-semibold ${val >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatChange(val)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <StatCard title="LIVE PRICE" value={formatPrice(stock.price)}>
          <ChangeBadge value={stock.priceChange24h} showBadge={false} />
          {stock.priceChange24h !== null && (
            <span className="text-gray-500 text-xs ml-0.5">24h</span>
          )}
        </StatCard>
        <StatCard title="MARKET CAP" value={formatMarketCap(stock.marketCap)} />
        <StatCard title="LIQUIDITY" value={formatVolume(stock.liquidity)} />
        <StatCard title="24H VOLUME" value={formatVolume(stock.volume24h)} />
        {(stock.buyCount24h !== null || stock.sellCount24h !== null) && (
          <StatCard
            title="NET BUYING"
            value={
              stock.buyCount24h !== null && stock.sellCount24h !== null
                ? `${stock.buyCount24h - stock.sellCount24h > 0 ? '+' : ''}${stock.buyCount24h - stock.sellCount24h}`
                : '—'
            }
          >
            {stock.buyCount24h !== null && stock.sellCount24h !== null && (
              <span className="text-xs text-gray-500">
                <span className="text-green-600">{stock.buyCount24h} buys</span>
                {' · '}
                <span className="text-red-500">{stock.sellCount24h} sells</span>
              </span>
            )}
          </StatCard>
        )}
      </div>

      {/* Description */}
      {stock.description && (
        <div className="mx-4 mb-6 p-4 bg-gray-50 rounded-2xl">
          <p className="text-sm text-gray-700 leading-relaxed">{stock.description}</p>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  children?: React.ReactNode
}

function StatCard({ title, value, children }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-gray-400 text-[11px] font-medium tracking-wide mb-1.5">{title}</p>
      <p className="text-black font-bold text-lg leading-tight">{value}</p>
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 13L5 8L10 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200">
          <BackIcon />
        </button>
      </div>
      <div className="flex items-center gap-3 px-4 pb-4">
        <div className="w-13 h-13 rounded-full bg-gray-100 animate-pulse" style={{ width: 52, height: 52 }} />
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded animate-pulse w-20" />
          <div className="h-3.5 bg-gray-100 rounded animate-pulse w-32" />
        </div>
      </div>
      <div className="h-44 mx-4 bg-gray-100 rounded-2xl animate-pulse mb-4" />
      <div className="grid grid-cols-2 gap-2 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
