export const placeholder = '/images/placeholder.svg'
export function safeUrl(value: string, allowRelative = false) {
  if (allowRelative && /^\/(?!\/)/.test(value)) return value
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}
export function imageSrc(url: string) {
  return (url.startsWith('blob:') ? url : safeUrl(url, true)) || placeholder
}
export function responsiveImage(url: string, width: number) {
  if (url.startsWith('https://images.unsplash.com/')) {
    const u = new URL(url)
    u.searchParams.set('w', String(width))
    u.searchParams.set('auto', 'format')
    u.searchParams.set('fit', 'crop')
    return u.href
  }
  return imageSrc(url)
}
