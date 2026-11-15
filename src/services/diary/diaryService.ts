import type { DailyLog, DailyLogInput, DiaryPhoto, DiaryStatus, RollCallEntry, SchoolFeedItem } from '@/types'

export interface DailyLogFilters {
  studentId?: string
  date?: string
}

/**
 * Diário de Bordo e chamada do dia.
 * Famílias recebem apenas registros enviados e sem a observação interna.
 */
export interface DiaryService {
  listLogs(filters?: DailyLogFilters): Promise<DailyLog[]>
  getLog(id: string): Promise<DailyLog>
  /** Cria ou atualiza o registro da criança naquela data. */
  saveLog(input: DailyLogInput, status: DiaryStatus): Promise<DailyLog>
  markAsRead(id: string): Promise<void>
  /** Envia a foto e devolve a referência a ser anexada ao registro. */
  uploadPhoto(file: File, title: string): Promise<DiaryPhoto>
  listSchoolFeed(): Promise<SchoolFeedItem[]>
  getRollCall(date: string): Promise<RollCallEntry[]>
  saveRollCall(date: string, entries: RollCallEntry[]): Promise<void>
}
