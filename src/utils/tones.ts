import type { Tone } from '@/types'

/**
 * Classes Tailwind por tom. Mantidas como strings literais completas
 * para que o Tailwind as detecte na compilação.
 */
export const toneClasses: Record<Tone | 'neutral', { bg: string; soft: string; text: string; ring: string; dot: string }> = {
  aqua: { bg: 'bg-aqua-100', soft: 'bg-aqua-50', text: 'text-aqua-600', ring: 'ring-aqua-200', dot: 'bg-aqua-400' },
  sage: { bg: 'bg-sage-100', soft: 'bg-sage-50', text: 'text-sage-600', ring: 'ring-sage-200', dot: 'bg-sage-400' },
  sun: { bg: 'bg-sun-100', soft: 'bg-sun-50', text: 'text-sun-600', ring: 'ring-sun-200', dot: 'bg-sun-400' },
  coral: { bg: 'bg-coral-100', soft: 'bg-coral-50', text: 'text-coral-600', ring: 'ring-coral-200', dot: 'bg-coral-400' },
  lilac: { bg: 'bg-lilac-100', soft: 'bg-lilac-50', text: 'text-lilac-600', ring: 'ring-lilac-200', dot: 'bg-lilac-400' },
  neutral: { bg: 'bg-surface-container-low', soft: 'bg-surface', text: 'text-on-surface-variant', ring: 'ring-surface-container-high', dot: 'bg-outline' },
}

/** Lavagens de aquarela para SVG (tons do design system Stitch). */
export const toneHex: Record<Tone, { light: string; mid: string }> = {
  aqua: { light: '#c4e7ff', mid: '#8ccff6' },
  sage: { light: '#cfe8d6', mid: '#8fd0ae' },
  sun: { light: '#ffe2bd', mid: '#ffc27a' },
  coral: { light: '#fbd5d3', mid: '#f59aa6' },
  lilac: { light: '#e9ddff', mid: '#c9b1fb' },
}

const rotation: Tone[] = ['aqua', 'sage', 'sun', 'coral', 'lilac']

/** Tom estável derivado de um texto (ex.: avatar por nome). */
export function toneFromString(value: string): Tone {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return rotation[hash % rotation.length]
}
