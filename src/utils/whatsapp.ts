import { currency } from './currency'
export function tableFromSearch(search: string) {
  const value = new URLSearchParams(search).get('mesa')
  return value && /^[a-zA-Z0-9-]{1,20}$/.test(value) ? value : null
}
export function normalizePhone(phone: string) {
  const cleaned = phone.replace(/[\s()+-]/g, '')
  return /^\d{8,15}$/.test(cleaned) ? cleaned : null
}
export function whatsappUrl(phone: string, message: string) {
  const number = normalizePhone(phone)
  if (!number)
    throw new Error('El WhatsApp del local todavía no está configurado. Consultanos en el local.')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
export function productMessage(input: {
  name: string
  category: string
  option?: string
  price: number | null
  table?: string | null
}) {
  return `Hola, quiero consultar/pedir:\n\nProducto: ${input.name}\nCategoría: ${input.category}\n${input.option ? `Opción: ${input.option}\n` : ''}Precio: ${currency(input.price)}\n${input.table && /^[a-zA-Z0-9-]{1,20}$/.test(input.table) ? `Mesa: ${input.table}\n` : ''}\n¿Está disponible?`
}
