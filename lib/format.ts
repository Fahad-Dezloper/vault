export function formatPrice(price: number | null): string {
  if (price === null) return '—'
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatChange(pct: number | null): string {
  if (pct === null) return '—'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

export function formatVolume(vol: number | null): string {
  if (vol === null) return '—'
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`
  return `$${vol.toFixed(0)}`
}

export function formatMarketCap(mc: number | null): string {
  if (mc === null) return '—'
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}m`
  return `$${mc.toFixed(0)}`
}
