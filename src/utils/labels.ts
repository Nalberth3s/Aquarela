import type {
  ActivityCategory,
  InteractionRating,
  MealRating,
  ParticipationRating,
  RestRating,
  DevelopmentLevel,
  EnrollmentStatus,
  ExperienceField,
  NoticeCategory,
  ObservationKind,
  ReportStatus,
  Shift,
  StudentStatus,
  Tone,
  UserRole,
} from '@/types'

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administração',
  teacher: 'Professor(a)',
  guardian: 'Família',
}

export const shiftLabels: Record<Shift, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
}

export const studentStatusLabels: Record<StudentStatus, string> = {
  ativo: 'Ativo',
  em_adaptacao: 'Em adaptação',
  inativo: 'Inativo',
}

export const studentStatusTone: Record<StudentStatus, Tone | 'neutral'> = {
  ativo: 'sage',
  em_adaptacao: 'sun',
  inativo: 'neutral',
}

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  arte: 'Arte e expressão',
  movimento: 'Corpo e movimento',
  linguagem: 'Linguagem',
  natureza: 'Natureza e descobertas',
}

export const experienceFields: Record<ExperienceField, { label: string; short: string; tone: Tone }> = {
  eu_outro_nos: { label: 'O eu, o outro e o nós', short: 'Convivência', tone: 'coral' },
  corpo_gestos: { label: 'Corpo, gestos e movimentos', short: 'Movimento', tone: 'sage' },
  tracos_sons_cores: { label: 'Traços, sons, cores e formas', short: 'Expressão', tone: 'lilac' },
  escuta_fala: { label: 'Escuta, fala, pensamento e imaginação', short: 'Linguagem', tone: 'aqua' },
  espacos_tempos: {
    label: 'Espaços, tempos, quantidades, relações e transformações',
    short: 'Descobertas',
    tone: 'sun',
  },
}

export const developmentLevels: Record<DevelopmentLevel, string> = {
  1: 'Observando',
  2: 'Em desenvolvimento',
  3: 'Consolidando',
  4: 'Consolidado',
}

export const reportStatusLabels: Record<ReportStatus, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
}

export const observationKindLabels: Record<ObservationKind, { label: string; tone: Tone }> = {
  conquista: { label: 'Conquista', tone: 'sage' },
  rotina: { label: 'Rotina', tone: 'aqua' },
  atencao: { label: 'Atenção', tone: 'coral' },
}

export const noticeCategoryLabels: Record<NoticeCategory, { label: string; tone: Tone }> = {
  aviso: { label: 'Aviso', tone: 'coral' },
  evento: { label: 'Evento', tone: 'lilac' },
  cardapio: { label: 'Cardápio', tone: 'sage' },
  pedagogico: { label: 'Pedagógico', tone: 'aqua' },
}

export const enrollmentStatusLabels: Record<EnrollmentStatus, { label: string; tone: Tone | 'neutral' }> = {
  novo: { label: 'Novo', tone: 'coral' },
  em_contato: { label: 'Em contato', tone: 'sun' },
  visita_agendada: { label: 'Visita agendada', tone: 'lilac' },
  matriculado: { label: 'Matriculado', tone: 'sage' },
  arquivado: { label: 'Arquivado', tone: 'neutral' },
}

// ---- Diário de Bordo ----

export const participationLabels: Record<ParticipationRating, string> = {
  excelente: 'Excelente',
  boa: 'Boa',
  em_desenvolvimento: 'Em desenvolvimento',
}

export const interactionLabels: Record<InteractionRating, string> = {
  colaborativa: 'Colaborativa',
  normal: 'Normal',
  com_mediacao: 'Com mediação',
}

export const mealLabels: Record<MealRating, string> = {
  comeu_tudo: 'Comeu tudo',
  comeu_bem: 'Comeu bem',
  pouco_apetite: 'Pouco apetite',
}

export const restLabels: Record<RestRating, string> = {
  dormiu: 'Dormiu',
  relaxou: 'Relaxou',
  agitada: 'Agitada',
}

export const messageSubjectLabels = {
  saida_antecipada: 'Saída antecipada',
  alimentacao_remedio: 'Alimentação / Remédio',
  outro: 'Outro assunto',
} as const
