/**
 * Star rating row — filled gold stars for the rating, soft grey for the rest.
 * Shared by the product card and the product detail page.
 */
export default function Stars({
  rating,
  size = 13,
  className = '',
  showValue = false,
}: {
  rating: number
  size?: number
  className?: string
  showValue?: boolean
}) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label={`Rated ${r} out of 5`}>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={i < r ? 'fill-[#e0b23a]' : 'fill-[#d9d2c8]'}
          >
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
          </svg>
        ))}
      </div>
      {showValue && <span className="text-xs text-muted">{r}.0</span>}
    </div>
  )
}
