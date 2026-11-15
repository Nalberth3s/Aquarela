/**
 * Diário de Bordo: registro diário da rotina de cada criança,
 * preenchido pela educadora e visível para a família.
 */
export type ParticipationRating = 'excelente' | 'boa' | 'em_desenvolvimento'
export type InteractionRating = 'colaborativa' | 'normal' | 'com_mediacao'
export type MealRating = 'comeu_tudo' | 'comeu_bem' | 'pouco_apetite'
export type RestRating = 'dormiu' | 'relaxou' | 'agitada'

export interface DiaryPhoto {
  id: string
  url: string
  title: string
  caption?: string
  time: string
}

export type DiaryStatus = 'rascunho' | 'enviado'

export interface DailyLogInput {
  studentId: string
  date: string
  participation?: ParticipationRating
  interaction?: InteractionRating
  meals?: MealRating
  rest?: RestRating
  restMinutes?: number
  /** Texto visível aos responsáveis. */
  dayNote: string
  /** Observação interna — apenas equipe. */
  internalNote?: string
  photos: DiaryPhoto[]
  /** Resumo da atividade principal do dia (ex.: "Pintura e cores"). */
  activity?: { title: string; detail: string }
  mood?: { title: string; detail: string }
}

export interface DailyLog extends DailyLogInput {
  id: string
  authorName: string
  status: DiaryStatus
  updatedAt: string
  /** Leitura confirmada pela família. */
  readByGuardian?: boolean
}

export type FeedIcon = 'arte' | 'refeicao' | 'descanso' | 'leitura'

/** Atividades recentes da escola (painel de gestão). */
export interface SchoolFeedItem {
  id: string
  icon: FeedIcon
  title: string
  time: string
  description: string
  status: string
  meta?: string
}

export interface Milestone {
  id: string
  studentId: string
  month: string
  status: 'concluido' | 'em_andamento'
  title: string
  description: string
}

export interface RollCallEntry {
  studentId: string
  present: boolean
}
