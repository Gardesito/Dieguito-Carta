import { requireSupabase, databaseError } from './supabase'
const types: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
export function validateImage(file: File) {
  if (!types[file.type]) throw new Error('Elegí una imagen JPG, PNG, WEBP o AVIF.')
  if (file.size > 5 * 1024 * 1024 || file.size === 0)
    throw new Error('La imagen debe pesar entre 1 byte y 5 MB.')
}
export async function uploadImage(file: File, alt: string) {
  validateImage(file)
  const db = requireSupabase()
  const path = `uploads/${crypto.randomUUID()}.${types[file.type]}`
  const { error } = await db.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  const { data } = db.storage.from('product-images').getPublicUrl(path)
  const { error: mediaError } = await db.from('media').insert({
    file_name: file.name,
    storage_path: path,
    public_url: data.publicUrl,
    alt_text: alt,
    mime_type: file.type,
    size_bytes: file.size,
  })
  if (mediaError) {
    await db.storage.from('product-images').remove([path])
    throw databaseError(mediaError)
  }
  return data.publicUrl
}
export async function removeImageIfUnused(url: string) {
  if (!url) return
  const db = requireSupabase()
  const { data: media, error } = await db
    .from('media')
    .select('*')
    .eq('public_url', url)
    .maybeSingle()
  if (error) throw error
  if (!media) return
  const checks = await Promise.all([
    db.from('products').select('id', { count: 'exact', head: true }).eq('image_url', url),
    db.from('categories').select('id', { count: 'exact', head: true }).eq('image_url', url),
    db.from('promotions').select('id', { count: 'exact', head: true }).eq('image_url', url),
    db.from('site_content').select('id', { count: 'exact', head: true }).eq('image_url', url),
    db.from('site_settings').select('id', { count: 'exact', head: true }).eq('logo_url', url),
  ])
  if (checks.some((r) => r.error))
    throw new Error('No pudimos comprobar las referencias de la imagen.')
  if (checks.some((r) => (r.count || 0) > 0)) return
  const { error: removeError } = await db.storage
    .from('product-images')
    .remove([media.storage_path])
  if (removeError) throw removeError
  const { error: recordError } = await db.from('media').delete().eq('id', media.id)
  if (recordError) throw recordError
}
export async function persistWithImage(
  file: File | null,
  oldUrl: string,
  requestedUrl: string,
  alt: string,
  save: (url: string) => Promise<void>,
) {
  const url = file ? await uploadImage(file, alt) : requestedUrl
  try {
    await save(url)
  } catch (error) {
    if (file)
      await removeImageIfUnused(url).catch(() => {
        /* Preserve original save error; orphan can be cleaned later. */
      })
    throw error
  }
  if (oldUrl && oldUrl !== url) {
    try {
      await removeImageIfUnused(oldUrl)
    } catch {
      return { url, cleanupWarning: true }
    }
  }
  return { url, cleanupWarning: false }
}
