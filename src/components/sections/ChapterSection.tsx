import { memo } from 'react'
import type { ChapterData } from '@/lib/chapters-data'
import { useSceneAnimation } from '@/hooks/useScrollTrigger'
import { useWidgetScaling } from '@/hooks/useWidgetScaling'
import { cn } from '@/lib/utils'

interface ChapterSectionProps {
  chapter: ChapterData
}

export const ChapterSection = memo(function ChapterSection({
  chapter,
}: ChapterSectionProps) {
  const { ref: chapterRef, transform } = useSceneAnimation(chapter.mode)
  const { scale, shellRef } = useWidgetScaling(chapter.designWidth, chapter.designHeight)

  const bgTransform = transform.bg
  const textTransform = transform.text

  // Build background transform string
  let bgTransformString = `translate(${bgTransform.x}px, ${bgTransform.y}px) scale(${bgTransform.scale.toFixed(3)})`
  if (bgTransform.rotateX !== undefined && bgTransform.rotateY !== undefined) {
    bgTransformString += ` rotateX(${bgTransform.rotateX}deg) rotateY(${bgTransform.rotateY}deg)`
  }

  // Build text transform string
  const textTransformString = `translate(${textTransform.x}px, ${textTransform.y}px)`

  return (
    <section
      ref={chapterRef}
      className="relative min-h-screen w-screen overflow-hidden text-[var(--text-main)]"
      style={{
        opacity: transform.opacity.toFixed(3),
      }}
    >
      {/* Background container with widget */}
      <div
        className="absolute inset-0 z-0 overflow-hidden origin-center will-change-transform"
        style={{
          transform: bgTransformString,
        }}
      >
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'radial-gradient(circle at top, rgba(15,23,42,0.5), transparent 65%)',
          }}
        />
        
        {/* Widget shell with iframe */}
        {chapter.iframeSrc && (
          <div
            ref={shellRef}
            className="absolute top-1/2 left-1/2 origin-top-left z-0"
            style={{
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <iframe
              src={chapter.iframeSrc}
              title={chapter.iframeTitle}
              className="block border-0"
              style={{
                width: `${chapter.designWidth}px`,
                height: `${chapter.designHeight}px`,
              }}
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Text overlay */}
      <div
        className={cn(
          'relative z-[2] max-w-[1100px] mx-auto px-[18px] py-[72px] flex items-center min-h-screen pointer-events-none',
          'max-md:px-4 max-md:py-16',
          'max-sm:px-[14px] max-sm:py-14',
          chapter.fullText && 'justify-center text-center'
        )}
      >
        <article
          className={cn(
            'bg-gradient-to-br from-[rgba(15,23,42,0.95)] to-[rgba(15,23,42,0.85)] rounded-[18px] border border-[rgba(148,163,184,0.45)] shadow-[var(--shadow-soft)] p-[18px_18px_16px] backdrop-blur-[10px] will-change-transform pointer-events-auto',
            chapter.fullText ? 'max-w-[48rem]' : 'max-w-[32rem]',
            'max-md:max-w-none'
          )}
          style={{
            transform: textTransformString,
          }}
        >
          {/* Act label */}
          <div className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2">
            <span
              className={cn(
                'px-[9px] py-[3px] rounded-full border backdrop-blur-[8px]',
                chapter.actVariant === 'act-1' &&
                  'border-[rgba(52,211,153,0.75)] text-[#bbf7d0] bg-[rgba(15,23,42,0.9)]',
                chapter.actVariant === 'act-2' &&
                  'border-[rgba(248,113,113,0.75)] text-[#fecaca] bg-[rgba(15,23,42,0.9)]',
                chapter.actVariant === 'act-3' &&
                  'border-[rgba(129,140,248,0.8)] text-[#c7d2fe] bg-[rgba(15,23,42,0.9)]'
              )}
            >
              {chapter.act}
            </span>
          </div>

          {/* Chapter lede */}
          <div className="text-[0.82rem] uppercase tracking-[0.16em] text-[var(--text-muted)] mb-1">
            {chapter.lede}
          </div>

          {/* Heading */}
          <h2 className="my-1 text-[1.4rem] font-semibold max-sm:text-[1.2rem]">{chapter.heading}</h2>

          {/* Paragraphs */}
          {chapter.paragraphs.map((para, index) => (
            <p
              key={index}
              className={cn(
                'my-1.5 text-[0.9rem]',
                para.strong
                  ? 'text-[var(--text-main)]'
                  : 'text-[var(--text-muted)]'
              )}
            >
              {para.text}
            </p>
          ))}

          {/* Chapter meta */}
          {chapter.meta && (
            <p className="text-[0.8rem] text-[var(--text-muted)] mt-1 italic">
              {chapter.meta}
            </p>
          )}

          {/* Final Earth animation for last chapter */}
          {chapter.fullText && (
            <div
              className="w-[260px] h-[260px] mx-auto mt-6 rounded-full shadow-[0_0_60px_rgba(56,189,248,0.7)]"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, rgba(249,250,251,0.9), transparent 55%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.75), transparent 60%), radial-gradient(circle at 40% 80%, rgba(22,163,74,0.85), transparent 65%), radial-gradient(circle at 10% 90%, rgba(59,130,246,0.75), transparent 70%)',
                animation: 'rotateEarth 40s linear infinite',
              }}
            />
          )}
        </article>
      </div>
    </section>
  )
})

