/**
 * Conteúdo institucional DEMONSTRATIVO.
 * Contatos e endereço são reais (Instagram/WhatsApp da escola).
 * Equipe dos berçários, capoeira e culinária vêm dos vídeos reais da escola.
 * Ano de fundação é ILUSTRATIVO — confirmar com a escola.
 */
import type {
  Activity,
  Faq,
  Pillar,
  RoutineStep,
  SchoolInfo,
  SchoolValue,
  Segment,
  StructureSpace,
  TeamMember,
} from '@/types'
import capoeiraCircuito from '@/assets/images/escola/capoeira-circuito.jpg'
import sopaPanela from '@/assets/images/escola/sopa-panela.jpg'
import { VIDEO_CAPOEIRA, VIDEO_SOPA_BERCARIO } from './media'

export const schoolInfoMock: SchoolInfo = {
  name: 'Aquarela do Saber',
  legalName: 'Centro Educacional Aquarela do Saber',
  tagline: 'A infância é nosso ponto de partida',
  city: 'Senador Canedo',
  state: 'GO',
  address: 'Rua Carlos Gomes, Qd. 13, Lt. 17, Casa 2',
  neighborhood: 'Residencial Jardim Canedo I',
  zipCode: '75250-220',
  phone: '(62) 99280-6901',
  whatsapp: '(62) 99280-6901',
  whatsappNumber: '5562992806901',
  email: 'aquareladosaber2024@gmail.com',
  instagram: '@educacionalaquareladosaber',
  instagramUrl: 'https://www.instagram.com/educacionalaquareladosaber',
  openingHours: 'Segunda a sexta, das 07h00 às 18h30',
  contactFormWhatsapp: '5562995358008',
  latitude: -16.6926009,
  longitude: -49.113358,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-16.6926009%2C-49.113358',
  foundedYear: 2014,
}

export const segmentsMock: Segment[] = [
  {
    id: 'bercario',
    name: 'Berçário',
    ageRange: '4 meses a 1 ano e 11 meses',
    description:
      'Um ambiente acolhedor e seguro, pensado para os primeiros vínculos. Rotina respeitosa, estímulos sensoriais e muito colo.',
    focus: ['Berçários A e B', 'Exploração sensorial', 'Vínculo e acolhimento'],
    tone: 'aqua',
  },
  {
    id: 'maternal',
    name: 'Maternal',
    ageRange: '2 a 3 anos',
    description:
      'A fase das descobertas e da autonomia. As crianças ampliam a linguagem, brincam em grupo e começam a compreender combinados.',
    focus: ['Maternal I e Maternal II', 'Linguagem e autonomia', 'Brincar coletivo'],
    tone: 'sage',
  },
  {
    id: 'jardim',
    name: 'Jardim',
    ageRange: '4 a 5 anos',
    description:
      'Projetos investigativos, contato com a cultura escrita e o raciocínio lógico — sempre com ludicidade e respeito ao tempo de cada criança.',
    focus: ['Projetos investigativos', 'Letramento e numeramento', 'Preparação para o Ensino Fundamental'],
    tone: 'sun',
  },
]

export const activitiesMock: Activity[] = [
  {
    id: 'capoeira',
    title: 'Capoeira',
    category: 'movimento',
    description:
      'Ginga, equilíbrio, circuitos e roda com música. A capoeira fortalece o corpo, a confiança e o respeito ao colega.',
    frequency: 'Semanal',
    segments: ['maternal', 'jardim'],
    imageUrl: capoeiraCircuito,
    videoUrl: VIDEO_CAPOEIRA,
    tone: 'sun',
  },
  {
    id: 'culinaria',
    title: 'Culinária e descobertas',
    category: 'natureza',
    description:
      'Dos bebês aos maiores: tocar, cheirar e provar alimentos de verdade. No berçário, a “sopa do neném” vira uma grande exploração sensorial.',
    frequency: 'Quinzenal',
    segments: ['bercario', 'maternal', 'jardim'],
    imageUrl: sopaPanela,
    videoUrl: VIDEO_SOPA_BERCARIO,
    tone: 'coral',
  },
  {
    id: 'musicalizacao',
    title: 'Musicalização',
    category: 'arte',
    description: 'Ritmo, canto, escuta e instrumentos simples. A música como linguagem e como forma de estar junto.',
    frequency: 'Semanal',
    segments: ['bercario', 'maternal', 'jardim'],
    tone: 'lilac',
  },
  {
    id: 'atelie',
    title: 'Ateliê de artes',
    category: 'arte',
    description: 'Pintura com aquarela, argila, colagem e materiais naturais. O processo importa mais que o resultado.',
    frequency: 'Duas vezes por semana',
    segments: ['maternal', 'jardim'],
    tone: 'coral',
  },
  {
    id: 'historias',
    title: 'Roda de histórias',
    category: 'linguagem',
    description: 'Leitura compartilhada, reconto e dramatização. Um momento diário para imaginar e ampliar o vocabulário.',
    frequency: 'Diária',
    segments: ['bercario', 'maternal', 'jardim'],
    tone: 'aqua',
  },
  {
    id: 'psicomotricidade',
    title: 'Psicomotricidade',
    category: 'movimento',
    description: 'Circuitos, equilíbrio e brincadeiras corporais que fortalecem a coordenação e a confiança.',
    frequency: 'Duas vezes por semana',
    segments: ['bercario', 'maternal', 'jardim'],
    tone: 'sage',
  },
  {
    id: 'horta',
    title: 'Horta e natureza',
    category: 'natureza',
    description: 'Plantar, regar, observar e colher. As crianças acompanham o ciclo das plantas e cuidam do espaço coletivo.',
    frequency: 'Semanal',
    segments: ['maternal', 'jardim'],
    tone: 'sage',
  },
  {
    id: 'ingles',
    title: 'Inglês lúdico',
    category: 'linguagem',
    description: 'Contato natural com a língua inglesa por meio de músicas, jogos e rotinas do dia a dia.',
    frequency: 'Duas vezes por semana',
    segments: ['jardim'],
    tone: 'sun',
  },
  {
    id: 'brincar-livre',
    title: 'Brincar livre',
    category: 'movimento',
    description: 'Tempo protegido para a criança escolher, inventar e negociar com os colegas — com olhar atento dos educadores.',
    frequency: 'Diária',
    segments: ['bercario', 'maternal', 'jardim'],
    tone: 'lilac',
  },
]

export const structureMock: StructureSpace[] = [
  {
    id: 'salas',
    name: 'Salas amplas e arejadas',
    description: 'Mobiliário na altura das crianças, iluminação natural e cantinhos organizados por interesse.',
    icon: 'armchair',
    tone: 'aqua',
  },
  {
    id: 'parque',
    name: 'Parque com área coberta',
    description: 'Brinquedos seguros, piso emborrachado e sombra para brincar em qualquer estação.',
    icon: 'trees',
    tone: 'sage',
  },
  {
    id: 'solario',
    name: 'Solário do berçário',
    description: 'Espaço exclusivo para os bebês tomarem sol e explorarem com tranquilidade.',
    icon: 'sun',
    tone: 'sun',
  },
  {
    id: 'biblioteca',
    name: 'Cantinho de leitura',
    description: 'Acervo infantil selecionado, almofadas e um convite permanente para folhear histórias.',
    icon: 'book',
    tone: 'lilac',
  },
  {
    id: 'refeitorio',
    name: 'Refeitório',
    description: 'Cardápio elaborado por nutricionista, com preparo na própria escola e atenção a restrições alimentares.',
    icon: 'utensils',
    tone: 'coral',
  },
  {
    id: 'horta',
    name: 'Horta pedagógica',
    description: 'Canteiros cuidados pelas turmas, onde se aprende sobre alimentação, paciência e natureza.',
    icon: 'sprout',
    tone: 'sage',
  },
  {
    id: 'seguranca',
    name: 'Segurança e monitoramento',
    description: 'Acesso controlado, câmeras nas áreas comuns e entrega das crianças apenas a pessoas autorizadas.',
    icon: 'shield',
    tone: 'aqua',
  },
  {
    id: 'brinquedoteca',
    name: 'Brinquedoteca',
    description: 'Jogos, blocos de montar e materiais não estruturados para o brincar simbólico.',
    icon: 'blocks',
    tone: 'sun',
  },
]

export const routineMock: RoutineStep[] = [
  { time: '7h', title: 'Acolhida', description: 'Chegada tranquila, conversa com as famílias e brincadeiras livres.' },
  { time: '8h', title: 'Café da manhã', description: 'Refeição em grupo, com incentivo à autonomia.' },
  { time: '8h30', title: 'Roda de conversa', description: 'Combinados do dia, calendário e escuta das crianças.' },
  { time: '9h', title: 'Projeto do dia', description: 'Atividade dirigida ligada ao projeto da turma.' },
  { time: '10h', title: 'Parque e movimento', description: 'Tempo ao ar livre, circuitos e brincar livre.' },
  { time: '11h', title: 'Almoço e descanso', description: 'Almoço balanceado e um momento de pausa e sono.' },
  { time: '14h30', title: 'Oficinas', description: 'Música, artes, inglês, horta ou culinária, conforme o dia.' },
  { time: '16h', title: 'Lanche e histórias', description: 'Lanche da tarde e roda de leitura antes da saída.' },
]

export const pillarsMock: Pillar[] = [
  {
    id: 'escuta',
    title: 'Escuta atenta',
    description:
      'Partimos do que as crianças perguntam, observam e desejam. Os projetos nascem do interesse real da turma.',
    tone: 'aqua',
  },
  {
    id: 'brincar',
    title: 'Brincar como eixo',
    description:
      'Brincar é a forma mais potente de aprender na infância. Organizamos tempos, espaços e materiais para isso.',
    tone: 'sun',
  },
  {
    id: 'vinculo',
    title: 'Vínculo e cuidado',
    description:
      'Cuidar e educar são inseparáveis. Alimentação, higiene e descanso também são momentos de aprendizagem.',
    tone: 'coral',
  },
  {
    id: 'familia',
    title: 'Parceria com as famílias',
    description:
      'Comunicação próxima, reuniões periódicas e registros do desenvolvimento compartilhados com transparência.',
    tone: 'sage',
  },
]

export const valuesMock: SchoolValue[] = [
  { title: 'Respeito à infância', text: 'Cada criança tem seu tempo, sua história e seu jeito de aprender.' },
  { title: 'Afeto com intenção', text: 'O carinho é ponto de partida, e a intencionalidade pedagógica dá direção.' },
  { title: 'Transparência', text: 'Famílias bem informadas e presentes na vida escolar.' },
  { title: 'Curiosidade', text: 'Perguntar, experimentar e errar fazem parte do processo.' },
]

/** Equipe dos Berçários A e B (créditos do vídeo "O que tem na sopa do neném?"). */
export const teamMock: TeamMember[] = [
  { id: 'gercilene', name: 'Gercilene', role: 'Professora · Berçários A e B', tone: 'aqua' },
  { id: 'andressa', name: 'Andressa', role: 'Professora · Berçários A e B', tone: 'lilac' },
  { id: 'nathalia', name: 'Nathalia', role: 'Professora · Berçários A e B', tone: 'coral' },
  { id: 'evilly', name: 'Evilly', role: 'Auxiliar · Berçários A e B', tone: 'sun' },
  { id: 'ana-julia', name: 'Ana Julia', role: 'Auxiliar · Berçários A e B', tone: 'sage' },
]

export const faqMock: Faq[] = [
  {
    id: 'idade',
    question: 'A partir de qual idade a escola recebe crianças?',
    answer: 'Recebemos bebês a partir de 4 meses no Berçário e acompanhamos a criança no Maternal e no Jardim, até os 5 anos.',
  },
  {
    id: 'turnos',
    question: 'Quais são os turnos disponíveis?',
    answer:
      'Oferecemos meio período (manhã ou tarde) e período integral, com alimentação completa preparada na escola.',
  },
  {
    id: 'adaptacao',
    question: 'Como funciona o período de adaptação?',
    answer:
      'A adaptação é gradual e combinada com cada família. Nos primeiros dias, o tempo de permanência aumenta aos poucos, com a presença de um responsável quando necessário.',
  },
  {
    id: 'acompanhamento',
    question: 'Como acompanho o desenvolvimento do meu filho?',
    answer:
      'Pelo Diário de Bordo digital: todos os dias a professora registra participação, alimentação, descanso, fotos e um recado sobre o dia. Também entregamos relatórios de desenvolvimento organizados pelos campos de experiência da BNCC.',
  },
  {
    id: 'visita',
    question: 'Posso visitar a escola antes da matrícula?',
    answer: 'Sim, e recomendamos! Agende pelo formulário do site ou pelo WhatsApp (62) 99280-6901.',
  },
]
