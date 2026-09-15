import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ upload: vi.fn(), remove: vi.fn(), from: vi.fn() }))
vi.mock('./supabase', () => ({
  requireSupabase: () => ({
    storage: {
      from: () => ({
        upload: mocks.upload,
        remove: mocks.remove,
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/new.webp' } }),
      }),
    },
    from: mocks.from,
  }),
  databaseError: (e: Error) => e,
}))
import { persistWithImage, validateImage } from './storage.service'
beforeEach(() => {
  vi.clearAllMocks()
  mocks.upload.mockResolvedValue({ error: null })
  mocks.remove.mockResolvedValue({ error: null })
  mocks.from.mockImplementation((table: string) => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: () => ({
      eq: () =>
        table === 'media'
          ? {
              maybeSingle: async () => ({
                data: { id: 'm', storage_path: 'uploads/old.webp' },
                error: null,
              }),
            }
          : Promise.resolve({ count: 0, error: null }),
    }),
    delete: () => ({ eq: async () => ({ error: null }) }),
  }))
})
describe('Subida segura de imágenes', () => {
  it('rechaza formato no permitido', () =>
    expect(() => validateImage(new File(['x'], 'x.svg', { type: 'image/svg+xml' }))).toThrow())
  it('rechaza más de 5 MB y archivos vacíos', () => {
    expect(() =>
      validateImage(new File([new Uint8Array(5242881)], 'x.png', { type: 'image/png' })),
    ).toThrow()
    expect(() => validateImage(new File([], 'x.png', { type: 'image/png' }))).toThrow()
  })
  it('no borra la imagen anterior antes de guardar', async () => {
    const save = vi.fn(async () => {
      expect(mocks.remove).not.toHaveBeenCalled()
    })
    await persistWithImage(
      new File(['image'], 'new.webp', { type: 'image/webp' }),
      'https://example.com/old.webp',
      '',
      'Foto',
      save,
    )
    expect(save).toHaveBeenCalledWith('https://example.com/new.webp')
    expect(mocks.remove).toHaveBeenCalledTimes(1)
  })
  it('conserva la anterior y limpia solo la nueva si falla el guardado', async () => {
    mocks.from.mockImplementation((table: string) => ({
      insert: async () => ({ error: null }),
      select: () => ({
        eq: (_key: string, url: string) =>
          table === 'media'
            ? {
                maybeSingle: async () => ({
                  data: {
                    id: 'new',
                    storage_path: url.includes('new') ? 'uploads/new.webp' : 'uploads/old.webp',
                  },
                  error: null,
                }),
              }
            : Promise.resolve({ count: 0, error: null }),
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }))
    await expect(
      persistWithImage(
        new File(['x'], 'new.webp', { type: 'image/webp' }),
        'https://example.com/old.webp',
        '',
        'Foto',
        async () => {
          throw new Error('Falló el producto')
        },
      ),
    ).rejects.toThrow('Falló el producto')
    expect(mocks.remove).toHaveBeenCalledWith(['uploads/new.webp'])
    expect(mocks.remove).not.toHaveBeenCalledWith(['uploads/old.webp'])
  })
  it('no borra una foto compartida por un duplicado', async () => {
    mocks.from.mockImplementation((table: string) => ({
      select: () => ({
        eq: () =>
          table === 'media'
            ? { maybeSingle: async () => ({ data: { id: 'm', storage_path: 'old' }, error: null }) }
            : Promise.resolve({ count: table === 'products' ? 1 : 0, error: null }),
      }),
    }))
    await persistWithImage(
      null,
      'https://example.com/old.webp',
      'https://example.com/other.webp',
      '',
      async () => {},
    )
    expect(mocks.remove).not.toHaveBeenCalled()
  })
})
