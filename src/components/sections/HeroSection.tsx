import { heroData } from '@/lib/chapters-data'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <div className="max-w-[1100px] mx-auto px-[18px] pt-8 pb-12 max-sm:px-[14px] max-sm:pt-[22px] max-sm:pb-10">
      <header className="min-h-screen flex flex-col justify-center gap-[18px] relative z-[2]">
        <div className="text-[0.85rem] tracking-[0.3em] uppercase text-[var(--text-muted)]">
          {heroData.kicker}
        </div>
        
        <div className="text-[clamp(2.3rem,4vw,3.2rem)] font-extrabold leading-[1.1]">
          {heroData.title}
          <br />
          <span className="bg-gradient-to-br from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
            {heroData.titleSpan}
          </span>
        </div>
        
        <p className="max-w-[60ch] text-[var(--text-muted)] text-[0.95rem]">
          {heroData.subtitle}
        </p>
        
        <div className="flex flex-wrap gap-2.5 mt-2">
          {heroData.tags.map((tag, index) => (
            <span
              key={index}
              className={cn(
                'px-2.5 py-1 rounded-full text-[0.75rem] uppercase tracking-[0.11em] border',
                tag.variant === 'good' &&
                  'border-[rgba(52,211,153,0.75)] text-[#bbf7d0] bg-[rgba(15,23,42,0.85)]',
                tag.variant === 'bad' &&
                  'border-[rgba(248,113,113,0.85)] text-[#fecaca] bg-[rgba(15,23,42,0.85)]',
                tag.variant === 'neutral' &&
                  'border-[rgba(148,163,184,0.7)] text-[var(--text-muted)] bg-[rgba(15,23,42,0.85)]'
              )}
            >
              {tag.text}
            </span>
          ))}
        </div>
        
        <p className="text-[0.8rem] text-[var(--text-muted)] max-w-[48ch]">
          Each visualization lives in its own HTML file (
          <code className="font-mono text-[0.9em]">vivek1.html</code>
          {', '}
          <code className="font-mono text-[0.9em]">sehas1.html</code>
          {', '}
          <code className="font-mono text-[0.9em]">samyogita1.html</code>
          {', '}
          <code className="font-mono text-[0.9em]">manya2.html</code>
          {', '}
          <code className="font-mono text-[0.9em]">razan1.html</code>
          {', etc.). This page stitches them into one continuous space story and scales them to fit your screen.'}
        </p>
      </header>
    </div>
  )
}

