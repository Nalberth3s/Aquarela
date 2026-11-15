import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ToastContext, type ToastTone } from './ToastContext'

const icons = { info: Info, success: CircleCheck, error: CircleAlert }
const iconColor = { info: 'text-primary', success: 'text-sage-600', error: 'text-coral-600' }

/** Mensagens breves no rodapé da tela (feedback de ações). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: ToastTone } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message, tone })
    timer.current = window.setTimeout(() => setToast(null), 4000)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])
  const Icon = toast ? icons[toast.tone] : Info

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex justify-center lg:bottom-8"
      >
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="flex max-w-md animate-fade-up items-start gap-3 rounded-2xl bg-surface-container-lowest/95 px-5 py-4 text-sm font-medium text-on-surface shadow-lift backdrop-blur-xl"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', iconColor[toast.tone])} aria-hidden />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
