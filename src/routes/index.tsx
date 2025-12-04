import { createFileRoute } from '@tanstack/react-router'
import { useScrollProgress } from '@/hooks/useScrollTrigger'
import { ChapterSection } from '@/components/sections/ChapterSection'
import { chapters } from '@/lib/chapters-data'
import { HeroSection } from '@/components/sections/HeroSection'

export const Route = createFileRoute('/')({ component: SpaceExplorationApp })

function SpaceExplorationApp() {
  const scrollProgress = useScrollProgress()

  return (
    <div className="relative bg-black text-[var(--text-main)] overflow-x-hidden">
      {/* Space background */}
      <div className="space-background" />

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 h-1 w-0 z-[999] bg-gradient-to-r from-[var(--accent-1)] via-[var(--accent-2)] to-[var(--accent-3)] shadow-[0_0_16px_rgba(59,130,246,0.9)] transition-all duration-[0.18s] ease-out" style={{ width: `${scrollProgress}%` }} />

      {/* Hero Section */}
      <HeroSection />

      {/* Chapters Container */}
      <div className="relative z-[1]">
        {chapters.map((chapter) => (
          <ChapterSection key={chapter.index} chapter={chapter} />
        ))}
      </div>
    </div>
  )
}
