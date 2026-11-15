const LOCALE = 'pt-BR'

/** Converte 'YYYY-MM-DD' em Date local sem deslocamento de fuso. */
export function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }): string {
  return new Intl.DateTimeFormat(LOCALE, options).format(parseDate(value))
}

export function formatShortDate(value: string): string {
  return formatDate(value, { day: '2-digit', month: 'short' }).replace('.', '')
}

export function formatDateTime(value: string): string {
  return formatDate(value, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Idade legível para a Educação Infantil: meses até 2 anos, depois anos e meses. */
export function formatAge(birthDate: string, reference: Date = new Date()): string {
  const birth = parseDate(birthDate)
  let months = (reference.getFullYear() - birth.getFullYear()) * 12 + (reference.getMonth() - birth.getMonth())
  if (reference.getDate() < birth.getDate()) months -= 1
  if (months < 0) return '—'
  if (months < 24) return `${months} ${months === 1 ? 'mês' : 'meses'}`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest ? `${years} anos e ${rest} ${rest === 1 ? 'mês' : 'meses'}` : `${years} anos`
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export function percent(value: number, total: number): number {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

/** Remove acentos e caixa para buscas simples. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Máscara de telefone brasileiro: (62) 99999-9999 */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

/** Número para links do WhatsApp: só dígitos, com DDI 55. */
export function whatsappNumber(phone?: string | null): string {
  const d = onlyDigits(phone ?? '')
  if (!d) return ''
  return d.startsWith('55') && d.length > 11 ? d : `55${d}`
}

/** Data local de hoje no formato YYYY-MM-DD. */
export function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "Hoje às 15:40", "Ontem às 17:15" ou "12 set. às 09:00". */
export function formatRelativeDateTime(iso: string): string {
  const d = new Date(iso)
  const time = d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (day === todayISO()) return `Hoje às ${time}`
  if (day === todayISO(-1)) return `Ontem às ${time}`
  return `${formatShortDate(day)} às ${time}`
}
