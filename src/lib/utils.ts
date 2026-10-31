/** Convert *bold* and **bold** markers to HTML spans */
export function formatRichText(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-inherit">$1</strong>')
    .replace(/\*(.*?)\*/g, '<strong class="font-semibold text-inherit">$1</strong>')
    .replace(/\n/g, '<br/>')
}

export function getRelativeTime(iso: string | number): string {
  const ts = typeof iso === 'number' ? iso : new Date(iso).getTime()
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(ts).toLocaleDateString()
}

export function playSound(type: 'correct' | 'wrong' | 'click' | 'unlock') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1) // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2) // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } else if (type === 'wrong') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.05)
    } else if (type === 'unlock') {
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    }
  } catch {
    // Audio may be blocked by browser policy
  }
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
