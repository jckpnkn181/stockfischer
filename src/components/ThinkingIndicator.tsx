export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <span className="text-xs text-[var(--text-secondary)]">Tänker</span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
