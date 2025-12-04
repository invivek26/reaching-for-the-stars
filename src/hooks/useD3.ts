import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * Custom hook for D3-React integration
 * Provides a ref to the DOM element and calls the render function when dependencies change
 */
export function useD3<T extends SVGElement | HTMLElement>(
  renderFn: (element: T, ...args: any[]) => void,
  dependencies: any[] = []
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (ref.current) {
      renderFn(ref.current)
    }
  }, [renderFn, ...dependencies])

  return ref
}

/**
 * Custom hook for responsive D3 visualizations
 * Automatically handles resize events and provides current dimensions
 */
export function useResponsiveD3<T extends SVGElement | HTMLElement>(
  renderFn: (element: T, width: number, height: number) => void,
  dependencies: any[] = []
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        renderFn(element, width, height)
      }
    })

    resizeObserver.observe(element)
    
    // Initial render
    const rect = element.getBoundingClientRect()
    renderFn(element, rect.width, rect.height)

    return () => {
      resizeObserver.disconnect()
    }
  }, [renderFn, ...dependencies])

  return ref
}

/**
 * Utility function to clean up D3 selections
 */
export function cleanupD3(element: SVGElement | HTMLElement) {
  d3.select(element).selectAll('*').remove()
}

/**
 * Common D3 animation configuration for space theme
 */
export const spaceAnimations = {
  duration: 800,
  easing: d3.easeCubicInOut,
  stagger: 50,
} as const

/**
 * Space-themed color scales
 */
export const spaceColors = {
  // Primary space theme colors
  background: '#000510',
  starfield: '#0a0f23',
  primaryBlue: '#4a90e2',
  secondaryTeal: '#22c55e',
  accentOrange: '#f97316',
  
  // Gradient scales
  cooperation: d3.scaleOrdinal<string>()
    .range(['#22c55e', '#4a90e2', '#38bdf8', '#8b5cf6', '#f59e0b']),
  
  missions: d3.scaleSequential(d3.interpolateViridis),
  
  economics: d3.scaleOrdinal<string>()
    .range(['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']),
    
  debris: d3.scaleSequential(d3.interpolateOrRd),
  
  environment: d3.scaleOrdinal<string>()
    .range(['#ef4444', '#f59e0b', '#eab308', '#22c55e']),
} as const