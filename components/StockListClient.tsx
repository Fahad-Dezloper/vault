'use client'

import { useState, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import { StockRow } from './StockRow'
import type { XStock } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useStocks() {
  return useSWR<XStock[]>(
    `/api/xstocks`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true, dedupingInterval: 10_000 }
  )
}

export function StockListClient() {
  const [query, setQuery] = useState('')

  const { data: stocks, isLoading, error } = useStocks()

  const filtered = useMemo(() => {
    if (!Array.isArray(stocks)) return []
    if (!query.trim()) return stocks
    const q = query.toLowerCase()
    return stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  }, [stocks, query])

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search stocks, tokens, lend pools…"
            value={query}
            onChange={handleQueryChange}
            className="flex-1 bg-transparent text-[15px] text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>


      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {isLoading && <SkeletonList />}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <p className="text-sm font-medium">Failed to load data</p>
            <p className="text-xs">Check your connection</p>
          </div>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">No results found</p>
          </div>
        )}
        {filtered.map((stock) => (
          <StockRow key={stock.address} stock={stock} />
        ))}
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="#9CA3AF" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded animate-pulse w-16" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <div className="h-3.5 bg-gray-100 rounded animate-pulse w-16" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
          </div>
        </div>
      ))}
    </>
  )
}
