import type { CalendarEvent } from '@/types'
import { parseDate, todayISO } from './format'

const LOCALE = 'pt-BR'

/** Só a primeira letra maiúscula (ex.: "Segunda-feira, 5 de outubro"). */
export const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "5 de outubro" ou "5 a 9 de outubro" ou "13 de jul. a 24 de jul." */
export function formatEventDate(event: Pick<CalendarEvent, 'date' | 'endDate'>, withWeekday = false): string {
  const start = parseDate(event.date)
  if (!event.endDate || event.endDate === event.date) {
    return capitalizeFirst(
      new Intl.DateTimeFormat(LOCALE, {
        ...(withWeekday ? { weekday: 'long' as const } : {}),
        day: 'numeric',
        month: 'long',
      }).format(start),
    )
  }
  const end = parseDate(event.endDate)
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} a ${new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(end)}`
  }
  const short = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
  return `${short.format(start)} a ${short.format(end)}`
}

/** Dias até o evento (0 = hoje; negativo = já começou/passou). */
export function daysUntil(date: string): number {
  const ms = parseDate(date).getTime() - parseDate(todayISO()).getTime()
  return Math.round(ms / 86_400_000)
}

export type EventTiming = 'passado' | 'acontecendo' | 'hoje' | 'futuro'

export function eventTiming(event: Pick<CalendarEvent, 'date' | 'endDate'>): EventTiming {
  const today = todayISO()
  const end = event.endDate ?? event.date
  if (end < today) return 'passado'
  if (event.date === today && end === today) return 'hoje'
  if (event.date <= today) return 'acontecendo'
  return 'futuro'
}

export function countdownLabel(event: Pick<CalendarEvent, 'date' | 'endDate'>): string {
  const timing = eventTiming(event)
  if (timing === 'passado') return 'Realizado'
  if (timing === 'hoje') return 'É hoje!'
  if (timing === 'acontecendo') return 'Acontecendo agora'
  const days = daysUntil(event.date)
  return days === 1 ? 'É amanhã!' : `Faltam ${days} dias`
}

/** Link "Adicionar ao Google Agenda" (abre o Google com o evento preenchido). */
export function googleCalendarLink(event: CalendarEvent, location: string): string {
  const compact = (d: string) => d.replaceAll('-', '')
  const end = parseDate(event.endDate ?? event.date)
  end.setDate(end.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · Aquarela do Saber`,
    dates: `${compact(event.date)}/${endStr}`,
    details: `${event.summary}${event.time ? `\nHorário: ${event.time}` : ''}`,
    location: event.location ? `${event.location} — ${location}` : location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Todas as datas (YYYY-MM-DD) cobertas por um evento. */
export function eventDays(event: Pick<CalendarEvent, 'date' | 'endDate'>): string[] {
  const days: string[] = []
  const d = parseDate(event.date)
  const end = event.endDate ?? event.date
  const pad = (n: number) => String(n).padStart(2, '0')
  for (let i = 0; i < 60; i++) {
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    days.push(iso)
    if (iso >= end) break
    d.setDate(d.getDate() + 1)
  }
  return days
}
