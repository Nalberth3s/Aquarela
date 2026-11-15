/** Tons da paleta aquarela usados para identificar visualmente conteúdos. */
export type Tone = 'aqua' | 'sage' | 'sun' | 'coral' | 'lilac'

export interface SchoolInfo {
  name: string
  legalName: string
  tagline: string
  city: string
  state: string
  address: string
  neighborhood: string
  zipCode: string
  phone: string
  whatsapp: string
  /** Número internacional só com dígitos, usado nos links wa.me. */
  whatsappNumber: string
  email: string
  instagram: string
  instagramUrl: string
  openingHours: string
  foundedYear: number
  /** WhatsApp (só dígitos) que recebe as mensagens do formulário "Envie uma mensagem". */
  contactFormWhatsapp?: string
  latitude?: number
  longitude?: number
  /** Link do Google Maps da escola. */
  mapsUrl?: string
}

export interface Segment {
  id: string
  name: string
  ageRange: string
  description: string
  focus: string[]
  tone: Tone
}

export type ActivityCategory = 'arte' | 'movimento' | 'linguagem' | 'natureza'

export interface Activity {
  id: string
  title: string
  category: ActivityCategory
  description: string
  frequency: string
  segments: string[]
  imageUrl?: string
  /** Vídeo real da atividade (abre na galeria). */
  videoUrl?: string
  tone: Tone
}

export interface StructureSpace {
  id: string
  name: string
  description: string
  icon: string
  imageUrl?: string
  tone: Tone
}

export interface RoutineStep {
  time: string
  title: string
  description: string
}

export interface Faq {
  id: string
  question: string
  answer: string
}

export interface Pillar {
  id: string
  title: string
  description: string
  tone: Tone
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string | null
  photoUrl?: string | null
  tone: Tone
  sortOrder?: number
  visible?: boolean
}

export type TeamMemberInput = Omit<TeamMember, 'id'>

/** Mensagem recebida pelo formulário de contato do site. */
export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  protocol: string
  read: boolean
  leadId?: string | null
  createdAt: string
}

export interface ContactMessageInput {
  name: string
  email: string
  phone: string
  message: string
}

export interface SchoolValue {
  title: string
  text: string
}

export type MediaKind = 'video' | 'foto'

/** Fotos e vídeos reais da escola exibidos na galeria do site. */
export interface SchoolMedia {
  id: string
  kind: MediaKind
  title: string
  description: string
  /** Imagem (foto) ou arquivo de vídeo. */
  src: string
  /** Capa do vídeo. */
  poster?: string
  /** Proporção de exibição: vertical (9:16 / 3:4) ou quadrada. */
  orientation: 'vertical' | 'quadrada'
  tag: string
  tone: Tone
  /** Aparece na página inicial. */
  featured?: boolean
  credits?: string
}
