/** Monta um link de conversa do WhatsApp com mensagem pré-preenchida. */
export function whatsappLink(number: string, message?: string): string {
  const base = `https://wa.me/${number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
