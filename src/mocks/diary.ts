import criancaPintando from '@/assets/images/crianca-pintando.jpg'
import educadoraSala from '@/assets/images/educadora-sala.jpg'
import salaMontessori from '@/assets/images/sala-montessori.jpg'
import type { DailyLog, SchoolFeedItem } from '@/types'
import { todayISO } from '@/utils/format'

/** Registros do Diário de Bordo. Datas relativas a hoje para a demo sempre mostrar "Hoje". */
export function buildDailyLogsMock(): DailyLog[] {
  return [
    {
      id: 'd-01',
      studentId: 's-01',
      date: todayISO(),
      authorName: 'Fernanda Alves',
      status: 'enviado',
      updatedAt: `${todayISO()}T14:35:00`,
      readByGuardian: false,
      participation: 'excelente',
      interaction: 'colaborativa',
      meals: 'comeu_tudo',
      rest: 'dormiu',
      restMinutes: 45,
      dayNote:
        'Maria teve um dia cheio de alegria! Desenvolveu atividades de reconhecimento de cores com tinta atóxica e brincadeiras no jardim sensorial. Descobriu o verde ao misturar azul e amarelo.',
      internalNote: 'Manter estímulo à autonomia para guardar os lápis de cor.',
      activity: { title: 'Pintura e cores', detail: 'Sensorial com tintas' },
      mood: { title: 'Radiante e curiosa', detail: 'Super participativa' },
      photos: [
        {
          id: 'p-01',
          url: criancaPintando,
          title: 'Ateliê Criativo',
          caption: 'Descobrindo novas misturas de cores',
          time: '10:20',
        },
        {
          id: 'p-02',
          url: salaMontessori,
          title: 'Espaço Literário',
          caption: 'Roda de história com a turma: "O Menino e as Nuvens"',
          time: '11:45',
        },
      ],
    },
    {
      id: 'd-02',
      studentId: 's-01',
      date: todayISO(-1),
      authorName: 'Fernanda Alves',
      status: 'enviado',
      updatedAt: `${todayISO(-1)}T16:05:00`,
      readByGuardian: true,
      participation: 'boa',
      interaction: 'colaborativa',
      meals: 'comeu_bem',
      rest: 'relaxou',
      dayNote: 'Dia de horta! Maria regou os canteiros e observou as minhocas com muita curiosidade.',
      activity: { title: 'Horta e natureza', detail: 'Cuidado dos canteiros' },
      mood: { title: 'Tranquila', detail: 'Atenta às descobertas' },
      photos: [{ id: 'p-03', url: educadoraSala, title: 'Roda de conversa', time: '09:10' }],
    },
    {
      id: 'd-03',
      studentId: 's-03',
      date: todayISO(),
      authorName: 'Fernanda Alves',
      status: 'enviado',
      updatedAt: `${todayISO()}T16:10:00`,
      readByGuardian: true,
      participation: 'boa',
      interaction: 'normal',
      meals: 'comeu_bem',
      rest: 'dormiu',
      restMinutes: 60,
      dayNote: 'Sofia participou da oficina de pintura sensorial e ajudou a organizar os pincéis.',
      photos: [],
    },
    {
      id: 'd-04',
      studentId: 's-02',
      date: todayISO(-1),
      authorName: 'Fernanda Alves',
      status: 'enviado',
      updatedAt: `${todayISO(-1)}T17:15:00`,
      readByGuardian: false,
      participation: 'excelente',
      interaction: 'colaborativa',
      meals: 'comeu_tudo',
      rest: 'dormiu',
      dayNote: 'Lucas liderou a brincadeira de roda e contou uma história para os colegas.',
      photos: [],
    },
  ]
}

export const schoolFeedMock: SchoolFeedItem[] = [
  {
    id: 'f-01',
    icon: 'arte',
    title: 'Oficina de Pintura Sensorial',
    time: '15:40',
    description: 'Professora Fernanda registrou fotos e observações no diário de 12 crianças do Maternal II.',
    status: '100% entregue aos pais',
    meta: '10 leituras confirmadas',
  },
  {
    id: 'f-02',
    icon: 'refeicao',
    title: 'Lanche da Tarde · Cardápio Saudável',
    time: '14:30',
    description: 'Salada de frutas frescas e pãozinho integral caseiro. Todos aceitaram com ótimo apetite.',
    status: 'Validado pela Nutrição',
  },
  {
    id: 'f-03',
    icon: 'descanso',
    title: 'Hora do Soninho · Berçário',
    time: '13:00',
    description: 'Rotina de descanso concluída. 5 bebês descansaram confortavelmente com música instrumental.',
    status: 'Notificação enviada',
  },
]
