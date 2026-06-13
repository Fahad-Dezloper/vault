'use client'

import { useState } from 'react'

interface TokenLogoProps {
  src: string | null
  symbol: string
  size?: number
  className?: string
}

export function TokenLogo({ src, symbol, size = 44, className = '' }: TokenLogoProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-black text-white font-bold select-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.33 }}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size, objectFit: 'cover' }}
      onError={() => setFailed(true)}
    />
  )
}
