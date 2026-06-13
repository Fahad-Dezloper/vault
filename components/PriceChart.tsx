'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ChartPoint } from '@/lib/types'

interface PriceChartProps {
  data: ChartPoint[]
  isPositive: boolean
}

export function PriceChart({ data, isPositive }: PriceChartProps) {
  const color = isPositive ? '#22c55e' : '#ef4444'
  const gradientId = isPositive ? 'greenGrad' : 'redGrad'

  const chartData = useMemo(
    () => data.map((p) => ({ time: p.time, price: p.price })),
    [data]
  )

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-44 bg-gray-50 rounded-2xl mx-4">
        <p className="text-gray-400 text-sm">No chart data</p>
      </div>
    )
  }

  const minPrice = Math.min(...chartData.map((d) => d.price))
  const maxPrice = Math.max(...chartData.map((d) => d.price))
  const padding = (maxPrice - minPrice) * 0.1

  return (
    <div className="h-44 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={[minPrice - padding, maxPrice + padding]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const price = payload[0].value as number
              return (
                <div className="bg-black text-white text-xs px-2 py-1 rounded">
                  ${price.toFixed(2)}
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
