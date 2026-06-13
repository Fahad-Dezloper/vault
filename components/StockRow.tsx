import Link from 'next/link'
import { TokenLogo } from './TokenLogo'
import { ChangeBadge } from './ChangeBadge'
import { formatPrice } from '@/lib/format'
import type { XStock } from '@/lib/types'

interface StockRowProps {
  stock: XStock
}

export function StockRow({ stock }: StockRowProps) {
  return (
    <Link
      href={`/stock/${stock.address}`}
      className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
    >
      <TokenLogo src={stock.logoURI} symbol={stock.symbol} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-black text-[15px] leading-tight">{stock.symbol}</p>
        <p className="text-gray-500 text-[13px] truncate">{stock.name}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="font-bold text-black text-[15px]">{formatPrice(stock.price)}</span>
        <ChangeBadge value={stock.priceChange24h} showBadge={stock.priceChange24h !== null} />
      </div>
    </Link>
  )
}
