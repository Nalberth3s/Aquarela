import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Diálogo acessível baseado no <dialog> nativo (foco preso, Esc fecha).
 * No mobile abre como "bottom sheet".
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-[2rem] bg-surface-container-lowest p-0 text-on-surface shadow-lift backdrop:bg-on-surface/30 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg sm:rounded-[2rem]"
    >
      {open && (
        <div className="animate-fade-up p-6 sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            {icon && (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-aqua-50 text-primary">
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-xl">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full text-outline hover:bg-surface-container-low"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
