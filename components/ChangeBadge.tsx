interface ChangeBadgeProps {
  value: number | null
  showBadge?: boolean
}

export function ChangeBadge({ value, showBadge = true }: ChangeBadgeProps) {
  if (value === null) {
    return <span className="text-gray-300 text-sm">—</span>
  }

  const isPos = value >= 0
  const label = `${isPos ? '▲' : '▼'} ${Math.abs(value).toFixed(2)}%`

  if (!showBadge) {
    return (
      <span className={`text-sm font-medium ${isPos ? 'text-green-600' : 'text-red-500'}`}>
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isPos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {label}
    </span>
  )
}
