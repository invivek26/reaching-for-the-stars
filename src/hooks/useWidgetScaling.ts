import { useEffect, useRef, useState } from 'react'

/**
 * Hook to calculate and apply widget scaling based on viewport and design dimensions
 * Formula: scale = min(vw/designW, vh/designH, 1)
 */
export function useWidgetScaling(designWidth: number, designHeight: number) {
  const [scale, setScale] = useState(1)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      const maxW = vw
      const maxH = vh

      const calculatedScale = Math.min(
        maxW / designWidth,
        maxH / designHeight,
        1,
      )
      setScale(calculatedScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale, { passive: true })

    return () => {
      window.removeEventListener('resize', updateScale)
    }
  }, [designWidth, designHeight])

  return { scale, shellRef }
}
