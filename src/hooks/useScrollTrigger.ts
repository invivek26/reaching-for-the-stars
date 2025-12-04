import { useEffect, useRef, useState } from 'react'

interface ScrollTriggerOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollTrigger(options: ScrollTriggerOptions = {}) {
  const { threshold = 0.3, rootMargin = '0px', triggerOnce = false } = options
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting

        if (triggerOnce) {
          if (isIntersecting && !hasTriggered) {
            setIsVisible(true)
            setHasTriggered(true)
          }
        } else {
          setIsVisible(isIntersecting)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return { ref: elementRef, isVisible, hasTriggered }
}

/**
 * Hook for scroll-based progress tracking
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(Math.max(progress, 0), 100))
    }

    updateProgress() // Initial calculation
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return progress
}

export interface SceneTransform {
  bg: {
    x: number
    y: number
    scale: number
    rotateX?: number
    rotateY?: number
  }
  text: {
    x: number
    y: number
  }
  opacity: number
}

/**
 * Hook for scroll-based scene animations matching exact HTML calculations
 */
export function useSceneAnimation(
  mode: 'orbit' | 'slide' | 'tilt' | 'zoom' = 'slide',
) {
  const [transform, setTransform] = useState<SceneTransform>({
    bg: { x: 0, y: 0, scale: 1 },
    text: { x: 0, y: 0 },
    opacity: 1,
  })
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const updateTransform = () => {
      const rect = element.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const vh = window.innerHeight
      const distance = (center - vh / 2) / vh // -1 to 1 range
      const d = Math.max(-1, Math.min(1, distance)) // clamp

      // Opacity calculation from HTML: 0.25 + (1 - min(1, abs(d) * 1.4)) * 0.75
      const opacity = 0.25 + (1 - Math.min(1, Math.abs(d) * 1.4)) * 0.75

      let bgTransform = {
        x: 0,
        y: 0,
        scale: 1,
        rotateX: undefined as number | undefined,
        rotateY: undefined as number | undefined,
      }
      let textTransform = { x: 0, y: 0 }

      switch (mode) {
        case 'orbit': {
          const radius = 40
          const angle = d * Math.PI
          bgTransform = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            scale: 1 - Math.abs(d) * 0.08,
            rotateX: undefined,
            rotateY: undefined,
          }
          textTransform = {
            x: 0,
            y: d * -30,
          }
          break
        }

        case 'slide': {
          const offset = d * 80
          bgTransform = {
            x: offset,
            y: 0,
            scale: 1 - Math.abs(d) * 0.12,
            rotateX: undefined,
            rotateY: undefined,
          }
          textTransform = {
            x: offset * -0.4,
            y: 0,
          }
          break
        }

        case 'tilt': {
          const tilt = d * 5
          bgTransform = {
            x: 0,
            y: d * 40,
            scale: 1,
            rotateX: tilt,
            rotateY: tilt * 0.7,
          }
          textTransform = {
            x: 0,
            y: d * -25,
          }
          break
        }

        case 'zoom': {
          bgTransform = {
            x: 0,
            y: d * 40,
            scale: 1 - Math.abs(d) * 0.18,
            rotateX: undefined,
            rotateY: undefined,
          }
          textTransform = {
            x: 0,
            y: d * -20,
          }
          break
        }
      }

      setTransform({
        bg: bgTransform,
        text: textTransform,
        opacity,
      })
    }

    updateTransform() // Initial calculation
    window.addEventListener('scroll', updateTransform, { passive: true })
    window.addEventListener('resize', updateTransform, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateTransform)
      window.removeEventListener('resize', updateTransform)
    }
  }, [mode])

  return { ref: elementRef, transform }
}
