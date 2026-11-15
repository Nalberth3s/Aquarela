import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const controlBase =
  'w-full rounded-2xl border bg-surface-container-low px-5 text-[0.95rem] text-on-surface placeholder:text-outline-variant transition-colors outline-none focus:bg-white focus:border-aqua-400 focus:ring-4 focus:ring-aqua-400/20'

function controlClass(error?: string) {
  return cn(controlBase, error ? 'border-coral-400' : 'border-transparent hover:border-surface-container-highest')
}

interface FieldShellProps {
  label: string
  error?: string
  hint?: ReactNode
  required?: boolean
  className?: string
  children: (id: string, describedBy?: string) => ReactNode
}

function FieldShell({ label, error, hint, required, className, children }: FieldShellProps) {
  const id = useId()
  const messageId = `${id}-msg`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-on-surface">
        {label}
        {required && <span className="ml-0.5 text-coral-600">*</span>}
      </label>
      {children(id, error || hint ? messageId : undefined)}
      {error ? (
        <p id={messageId} className="text-sm text-coral-600" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-sm text-outline">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

type Base = { label: string; error?: string; hint?: ReactNode; className?: string }

export function TextField({ label, error, hint, className, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={rest.required} className={className}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...rest}
          className={cn(controlClass(error), 'h-12')}
        />
      )}
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...rest
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={rest.required} className={className}>
      {(id, describedBy) => (
        <textarea
          id={id}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...rest}
          className={cn(controlClass(error), 'resize-y py-3 leading-relaxed')}
        />
      )}
    </FieldShell>
  )
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={rest.required} className={className}>
      {(id, describedBy) => (
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...rest}
          className={cn(controlClass(error), 'h-12 appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237c8494' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          {children}
        </select>
      )}
    </FieldShell>
  )
}
