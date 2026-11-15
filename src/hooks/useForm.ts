import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '@/services'
import type { Errors } from '@/utils/validation'

interface UseFormOptions<T> {
  initialValues: T
  validate: (values: T) => Errors<T>
  onSubmit: (values: T) => Promise<void>
}

/** Estado de formulário simples: valores, erros por campo e envio assíncrono. */
export function useForm<T extends object>({ initialValues, validate, onSubmit }: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Errors<T>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function setField<K extends keyof T>(key: K, value: T[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      const firstInvalid = (event.currentTarget as HTMLFormElement).querySelector<HTMLElement>('[aria-invalid="true"]')
      firstInvalid?.focus()
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
    setSubmitError(null)
  }

  return { values, errors, submitting, submitError, setField, handleSubmit, reset }
}
