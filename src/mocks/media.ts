/**
 * Fotos e vídeos REAIS da escola (pasta "fotos e videos" enviada pela escola).
 * Vídeos ficam em public/media/videos para serem transmitidos sob demanda,
 * sem entrar no bundle. Quadros dos vídeos foram extraídos para src/assets/images/escola.
 */
import capoeiraRoda from '@/assets/images/escola/capoeira-roda.jpg'
import capoeiraSalto from '@/assets/images/escola/capoeira-salto.jpg'
import patioEscola from '@/assets/images/escola/patio-escola.jpg'
import primeiroDia from '@/assets/images/escola/primeiro-dia-de-aula.jpg'
import sonhamosGrande from '@/assets/images/escola/sonhamos-grande.jpg'
import sopaBeterraba from '@/assets/images/escola/sopa-beterraba.jpg'
import sopaLegumes from '@/assets/images/escola/sopa-legumes.jpg'
import type { SchoolMedia } from '@/types'

export const VIDEO_CAPOEIRA = '/media/videos/capoeira.mp4'
export const VIDEO_SOPA_BERCARIO = '/media/videos/sopa-do-nenem-bercario.mp4'

export const mediaMock: SchoolMedia[] = [
  {
    id: 'video-capoeira',
    kind: 'video',
    title: 'Capoeira no pátio',
    description: 'A energia da capoeira transformando aprendizado em alegria: ginga, equilíbrio, circuitos e roda.',
    src: VIDEO_CAPOEIRA,
    poster: capoeiraSalto,
    orientation: 'vertical',
    tag: 'Corpo e movimento',
    tone: 'sun',
    featured: true,
  },
  {
    id: 'video-sopa',
    kind: 'video',
    title: 'O que tem na sopa do neném?',
    description:
      'Nos Berçários A e B, os bebês exploram abóbora, cenoura, beterraba e batata com as mãos — descobrindo cores, texturas e cheiros.',
    src: VIDEO_SOPA_BERCARIO,
    poster: sopaBeterraba,
    orientation: 'vertical',
    tag: 'Berçário',
    tone: 'coral',
    featured: true,
    credits: 'Professoras Gercilene, Andressa e Nathalia · Auxiliares Evilly e Ana Julia',
  },
  {
    id: 'foto-primeiro-dia',
    kind: 'foto',
    title: 'Primeiro dia de aula',
    description: 'Um começo cheio de sorrisos e acolhimento.',
    src: primeiroDia,
    orientation: 'vertical',
    tag: 'Acolhimento',
    tone: 'aqua',
  },
  {
    id: 'foto-sonhamos',
    kind: 'foto',
    title: 'Sonhamos grande desde pequenos',
    description: 'Nossas crianças com o uniforme da Aquarela do Saber.',
    src: sonhamosGrande,
    orientation: 'vertical',
    tag: 'Nossa turma',
    tone: 'lilac',
    featured: true,
  },
  {
    id: 'foto-sopa-legumes',
    kind: 'foto',
    title: 'Descobrindo os legumes',
    description: 'Exploração sensorial no berçário.',
    src: sopaLegumes,
    orientation: 'vertical',
    tag: 'Berçário',
    tone: 'coral',
  },
  {
    id: 'foto-roda',
    kind: 'foto',
    title: 'Roda de capoeira',
    description: 'Música, ritmo e escuta em roda com o mestre.',
    src: capoeiraRoda,
    orientation: 'vertical',
    tag: 'Corpo e movimento',
    tone: 'sun',
    featured: true,
  },
  {
    id: 'foto-patio',
    kind: 'foto',
    title: 'Nosso pátio',
    description: 'Espaço coberto e amplo para brincar, correr e aprender.',
    src: patioEscola,
    orientation: 'vertical',
    tag: 'Estrutura',
    tone: 'sage',
  },
]
