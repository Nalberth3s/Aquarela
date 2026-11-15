import type { User } from '@/types'

/** Senha única para todos os usuários de demonstração. */
export const DEMO_PASSWORD = 'aquarela'

export const usersMock: User[] = [
  {
    id: 'u-admin',
    name: 'Camila Medeiros',
    email: 'coordenacao@aquarela.demo',
    role: 'admin',
  },
  {
    id: 'u-teacher',
    name: 'Fernanda Alves',
    email: 'professora@aquarela.demo',
    role: 'teacher',
    classIds: ['maternal-2', 'maternal-1'],
  },
  {
    id: 'u-guardian',
    name: 'Juliana Silva',
    email: 'familia@aquarela.demo',
    role: 'guardian',
    studentIds: ['s-01'],
  },
]
