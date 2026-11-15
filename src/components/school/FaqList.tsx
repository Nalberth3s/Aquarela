import { Plus } from 'lucide-react'
import type { Faq } from '@/types'

/** Acordeão nativo (<details>), acessível sem JavaScript extra. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-surface-container-high border-y border-surface-container-high">
      {items.map((item) => (
        <details key={item.id} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-on-surface [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-transform duration-300 group-open:rotate-45">
              <Plus className="size-4" aria-hidden />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 leading-relaxed text-on-surface-variant">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
