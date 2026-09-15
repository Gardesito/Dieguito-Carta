import { tableFromSearch } from './whatsapp'
export function preserveTable(href: string, search = window.location.search) {
  const table = tableFromSearch(search)
  if (table && /^\/(?:menu)?#/.test(href))
    return href.replace('#', `?mesa=${encodeURIComponent(table)}#`)
  return href
}
