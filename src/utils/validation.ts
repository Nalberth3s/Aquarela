import { onlyDigits } from './format'

export type Errors<T> = Partial<Record<keyof T, string>>

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export const isPhone = (value: string) => {
  const digits = onlyDigits(value).length
  return digits === 10 || digits === 11
}

export const isFilled = (value: string | undefined) => !!value && value.trim().length > 0

export const isPastDate = (value: string) => !!value && new Date(value) <= new Date()

/** CPF com dígitos verificadores válidos. */
export const isCpf = (value: string) => {
  const d = onlyDigits(value)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const check = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return check(9) === Number(d[9]) && check(10) === Number(d[10])
}
