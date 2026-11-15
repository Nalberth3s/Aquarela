import { calendarEventsMock } from '@/mocks/calendar'
import type { CalendarEvent, CalendarEventInput } from '@/types'
import { ApiError } from '../api/errors'
import { mockSession } from '../mock/session'
import { createId, respond, safeStorage } from '../mock/utils'
import type { CalendarService } from './calendarService'

/** Eventos cadastrados pela coordenação ficam salvos no navegador durante a demonstração. */
const STORAGE_KEY = 'aquarela.calendar'

function load(): CalendarEvent[] {
  return safeStorage.read<CalendarEvent[]>(STORAGE_KEY) ?? calendarEventsMock
}

function save(events: CalendarEvent[]) {
  safeStorage.write(STORAGE_KEY, events)
}

const byDate = (a: CalendarEvent, b: CalendarEvent) => a.date.localeCompare(b.date)

function requireAdmin() {
  const user = mockSession.requireUser()
  if (user.role !== 'admin') throw new ApiError('Apenas a coordenação pode editar o calendário.', 403, 'FORBIDDEN')
}

function validate(input: CalendarEventInput) {
  if (!input.title.trim()) throw new ApiError('Informe o nome do evento.', 422, 'VALIDATION')
  if (!input.date) throw new ApiError('Informe a data do evento.', 422, 'VALIDATION')
  if (input.endDate && input.endDate < input.date)
    throw new ApiError('A data final não pode ser anterior à inicial.', 422, 'VALIDATION')
}

/** Reduz a imagem (máx. 1000px) para caber no armazenamento local da demonstração. */
function resizeToDataUrl(file: File, max = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => reject(new ApiError('Não foi possível ler a imagem.', 422, 'INVALID_FILE'))
    img.src = url
  })
}

export const calendarServiceMock: CalendarService = {
  async listPublished() {
    return respond(load().filter((e) => e.published).sort(byDate))
  },

  async getPublished(id) {
    const event = load().find((e) => e.id === id && e.published)
    if (!event) throw new ApiError('Evento não encontrado.', 404, 'NOT_FOUND')
    return respond(event)
  },

  async listAll() {
    requireAdmin()
    return respond(load().sort(byDate))
  },

  async getById(id) {
    requireAdmin()
    const event = load().find((e) => e.id === id)
    if (!event) throw new ApiError('Evento não encontrado.', 404, 'NOT_FOUND')
    return respond(event)
  },

  async create(input) {
    requireAdmin()
    validate(input)
    const event: CalendarEvent = { ...input, id: createId('ev'), updatedAt: new Date().toISOString() }
    save([...load(), event])
    return respond(event, 600)
  },

  async update(id, input) {
    requireAdmin()
    validate(input)
    const events = load()
    if (!events.some((e) => e.id === id)) throw new ApiError('Evento não encontrado.', 404, 'NOT_FOUND')
    const updated: CalendarEvent = { ...input, id, updatedAt: new Date().toISOString() }
    save(events.map((e) => (e.id === id ? updated : e)))
    return respond(updated, 600)
  },

  async remove(id) {
    requireAdmin()
    save(load().filter((e) => e.id !== id))
    await respond(null, 300)
  },

  async uploadImage(file) {
    requireAdmin()
    if (!file.type.startsWith('image/')) throw new ApiError('Envie um arquivo de imagem.', 422, 'INVALID_FILE')
    return respond(await resizeToDataUrl(file), 300)
  },
}
