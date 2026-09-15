import { useEffect, useRef, useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import type { SiteContent } from '../../types/siteContent'
import { contentService } from '../../services/content.service'
import { promotionsService } from '../../services/promotions.service'
import { useAdminData } from '../../hooks/useAdminData'
import { useCatalog } from '../../hooks/useCatalog'
import { persistWithImage } from '../../services/storage.service'
import { demoContent } from '../../data/demo'
import { safeUrl } from '../../utils/image'
import ImageUploader from '../../components/common/ImageUploader/ImageUploader'
import ErrorState from '../../components/common/ErrorState/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner'
import EditableImage from '../../components/admin/EditableImage/EditableImage'
export default function ContentEditorPage() {
  const { data, loading, error, reload } = useAdminData(
    async () => {
      const [content, promotions] = await Promise.all([
        contentService.list(),
        promotionsService.list(),
      ])
      return { content, promotions }
    },
    { content: [], promotions: [] },
  )
  const catalog = useCatalog()
  const [key, setKey] = useState('hero')
  const [drafts, setDrafts] = useState<Record<string, SiteContent>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [mobile, setMobile] = useState(false)
  const [busy, setBusy] = useState(false)
  const [blob, setBlob] = useState('')
  const [ready, setReady] = useState(0)
  const iframe = useRef<HTMLIFrameElement>(null)
  const imagePanel = useRef<HTMLDivElement>(null)
  const original =
    data.content.find((c) => c.content_key === key) ||
    demoContent.find((c) => c.content_key === key)!
  const current = drafts[key] || original
  const file = files[key] || null
  const dirty = Boolean(drafts[key] || file)
  useEffect(() => {
    if (!file) {
      setBlob('')
      return
    }
    const url = URL.createObjectURL(file)
    setBlob(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== iframe.current?.contentWindow) return
      if (e.data?.type === 'dieguito-preview-ready') setReady((version) => version + 1)
      if (e.data?.type === 'dieguito-edit' && ['hero', 'about'].includes(e.data.key))
        setKey(e.data.key)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])
  useEffect(() => {
    if (!ready) return
    const content = ['hero', 'about']
      .map(
        (k) =>
          drafts[k] ||
          data.content.find((c) => c.content_key === k) ||
          demoContent.find((c) => c.content_key === k)!,
      )
      .map((c) => (c.content_key === key && blob ? { ...c, image_url: blob } : c))
    iframe.current?.contentWindow?.postMessage(
      {
        type: 'dieguito-preview',
        catalog: { ...catalog.data, content, promotions: data.promotions },
      },
      location.origin,
    )
  }, [ready, drafts, data, catalog.data, key, blob])
  const update = (field: keyof SiteContent, value: unknown) =>
    setDrafts((s) => ({ ...s, [key]: { ...current, [field]: value } }))
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (Object.keys(drafts).length || Object.values(files).some(Boolean)) e.preventDefault()
    }
    window.addEventListener('beforeunload', before)
    return () => window.removeEventListener('beforeunload', before)
  }, [drafts, files])
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} retry={() => void reload()} />
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Editar página</h1>
          <p className="muted">Tocá “Editar” en la vista previa. El diseño se mantiene cuidado.</p>
        </div>
        <div className="row">
          <button
            className={`btn ${!mobile ? '' : 'secondary'}`}
            aria-pressed={!mobile}
            onClick={() => setMobile(false)}
          >
            <Monitor size={18} />
            Desktop
          </button>
          <button
            className={`btn ${mobile ? '' : 'secondary'}`}
            aria-pressed={mobile}
            onClick={() => setMobile(true)}
          >
            <Smartphone size={18} />
            Mobile
          </button>
        </div>
      </div>
      <div className="editor-layout">
        <div className={`preview-stage ${mobile ? 'mobile' : ''}`}>
          <iframe title="Vista previa de la página" src="/admin/vista-previa" ref={iframe} />
        </div>
        <form
          className="editor-panel"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            try {
              if (!current.title.trim()) throw new Error('Escribí un título.')
              if (current.button_url && !safeUrl(current.button_url, true))
                throw new Error('El enlace debe empezar con https:// o /.')
              const result = await persistWithImage(
                file,
                original.image_url,
                current.image_url,
                current.image_alt,
                (url) => contentService.save({ ...current, image_url: url }),
              )
              setDrafts((s) => {
                const next = { ...s }
                delete next[key]
                return next
              })
              setFiles((s) => ({ ...s, [key]: null }))
              toast.success('Sección publicada')
              if (result.cleanupWarning)
                toast.warning('La imagen anterior quedó pendiente de limpieza.')
              await reload()
              await catalog.reload()
            } catch (e) {
              toast.error((e as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        >
          <fieldset disabled={busy}>
            <label className="field">
              Sección
              <select value={key} onChange={(e) => setKey(e.target.value)}>
                <option value="hero">Portada</option>
                <option value="about">Nosotros</option>
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={current.is_visible}
                onChange={(e) => update('is_visible', e.target.checked)}
              />
              Mostrar esta sección
            </label>
            {!current.is_visible && (
              <p className="notice">
                Esta sección está oculta en la vista previa y en el sitio al guardar.
              </p>
            )}
            <label className="field">
              Etiqueta
              <input
                value={current.subtitle}
                maxLength={80}
                onChange={(e) => update('subtitle', e.target.value)}
              />
            </label>
            <label className="field">
              Título
              <input
                required
                maxLength={100}
                value={current.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </label>
            <label className="field">
              Descripción
              <textarea
                value={current.body}
                maxLength={1000}
                onChange={(e) => update('body', e.target.value)}
              />
            </label>
            <label className="field">
              Texto del botón
              <input
                maxLength={40}
                value={current.button_label}
                onChange={(e) => update('button_label', e.target.value)}
              />
            </label>
            <label className="field">
              Enlace del botón
              <input
                placeholder="/#menu"
                value={current.button_url}
                onChange={(e) => update('button_url', e.target.value)}
              />
            </label>
            {key === 'hero' && (
              <label className="field">
                Promoción en la portada
                <select
                  value={current.metadata.promotion_id || ''}
                  onChange={(e) =>
                    update('metadata', { ...current.metadata, promotion_id: e.target.value })
                  }
                >
                  <option value="">Sin promoción vinculada</option>
                  {data.promotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <EditableImage
              onEdit={() =>
                imagePanel.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            />
            <div ref={imagePanel}>
              <ImageUploader
                url={current.image_url}
                file={file}
                onFile={(f) => setFiles((s) => ({ ...s, [key]: f }))}
                alt={current.image_alt}
                onAlt={(v) => update('image_alt', v)}
                onUrl={(v) => update('image_url', v)}
              />
            </div>
          </fieldset>
          <p className="form-hint">
            Guardás solamente la sección seleccionada. Las otras secciones conservan sus cambios
            pendientes mientras estés en esta pantalla.
          </p>
          <div className="row">
            <button
              className="btn secondary"
              type="button"
              disabled={busy || !dirty}
              onClick={() => {
                setDrafts((s) => {
                  const n = { ...s }
                  delete n[key]
                  return n
                })
                setFiles((s) => ({ ...s, [key]: null }))
              }}
            >
              Cancelar
            </button>
            <button className="btn" disabled={busy || !dirty}>
              {busy ? 'Guardando…' : 'Guardar sección'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
