export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
      style={{ backgroundColor: 'var(--bg, #0b0f19)' }}
    >
      <div className="logo-text text-4xl sm:text-5xl tracking-tight select-none">
        PZX ARENA
      </div>

      {/* Fast shimmer line */}
      <div
        className="h-1 w-40 overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--bg-elevated, #1e293b)' }}
      >
        <div
          className="h-full w-1/2 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent, #38bdf8), transparent)',
            animation: 'pzx-shimmer 0.9s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes pzx-shimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  )
}
