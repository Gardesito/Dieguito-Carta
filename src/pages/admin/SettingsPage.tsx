import TranslationFields from '../../components/admin/TranslationFields'
import { useState } from 'react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import type { SiteSettings } from '../../types/siteContent'
import { contentService } from '../../services/content.service'
import { demoSettings } from '../../data/demo'
import { useAdminData } from '../../hooks/useAdminData'
import { useCatalog } from '../../hooks/useCatalog'
import { persistWithImage } from '../../services/storage.service'
import { normalizePhone } from '../../utils/whatsapp'
import { safeUrl } from '../../utils/image'
import ImageUploader from '../../components/common/ImageUploader/ImageUploader'
import PublishBar from '../../components/admin/PublishBar/PublishBar'
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner'
import ErrorState from '../../components/common/ErrorState/ErrorState'
export default function SettingsPage() {
  const { data, loading, error, reload } = useAdminData(contentService.settings, null)
  const [draft, setDraft] = useState<SiteSettings | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const catalog = useCatalog()
  const current = draft || data || demoSettings
  const update = (key: keyof SiteSettings, v: unknown) => setDraft({ ...current, [key]: v })
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} retry={() => void reload()} />
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Configuración del local</h1>
          <p className="muted">Los datos que ven tus clientes y dónde recibís los pedidos.</p>
        </div>
        <Link className="btn secondary" to="/" target="_blank">
          Ver sitio ↗
        </Link>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          try {
            const phone = normalizePhone(current.whatsapp_number)
            if (!phone)
              throw new Error(
                'Ingresá el WhatsApp con código de país y área, solamente números (8 a 15 dígitos).',
              )
            for (const key of ['maps_url', 'instagram_url', 'facebook_url'] as const)
              if (current[key] && !safeUrl(current[key]))
                throw new Error('Los enlaces deben empezar con https://.')
            const result = await persistWithImage(
              file,
              data?.logo_url || '',
              current.logo_url,
              current.logo_alt,
              (url) =>
                contentService.saveSettings({ ...current, whatsapp_number: phone, logo_url: url }),
            )
            toast.success('Configuración guardada')
            if (result.cleanupWarning)
              toast.warning('El logo anterior quedó pendiente de limpieza.')
            setDraft(null)
            setFile(null)
            await reload()
            await catalog.reload()
          } catch (e) {
            toast.error((e as Error).message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <fieldset disabled={busy} className="admin-panel">
          <TranslationFields
            value={current.translations}
            onChange={(v) => update('translations', v)}
            fields={[
              ['address', 'Dirección'],
              ['logo_alt', 'Texto alternativo del logo'],
            ]}
          />
          <div className="form-columns">
            <div>
              <h2>Información general</h2>
              {[
                ['business_name', 'Nombre del local'],
                ['whatsapp_number', 'WhatsApp (código de país + área + número)'],
                ['address', 'Dirección'],
                ['maps_url', 'Enlace a Google Maps'],
                ['instagram_url', 'Instagram'],
                ['facebook_url', 'Facebook'],
              ].map(([key, label]) => (
                <label className="field" key={key}>
                  {label}
                  <input
                    required={['business_name', 'whatsapp_number', 'address'].includes(key)}
                    type={key.endsWith('_url') ? 'url' : 'text'}
                    value={String(current[key as keyof SiteSettings])}
                    onChange={(e) => update(key as keyof SiteSettings, e.target.value)}
                  />
                </label>
              ))}
              <p className="form-hint">
                Ejemplo de formato argentino: 549 + código de área + número, sin 0 ni 15. Confirmá
                el número real del local antes de publicar.
              </p>
            </div>
            <div>
              <h2>Logo</h2>
              <ImageUploader
                url={current.logo_url}
                file={file}
                onFile={setFile}
                alt={current.logo_alt}
                onAlt={(v) => update('logo_alt', v)}
                onUrl={(v) => update('logo_url', v)}
              />
              <h2>Horarios</h2>
              {current.opening_hours.map((h, i) => (
                <div className="hours-editor" key={h.day}>
                  <TranslationFields
                    value={h.translations}
                    onChange={(v) =>
                      update(
                        'opening_hours',
                        current.opening_hours.map((item, j) =>
                          i === j ? { ...item, translations: v } : item,
                        ),
                      )
                    }
                    fields={[['hours', `Horario de ${h.day}`]]}
                  />
                  <label className="field">
                    {h.day}
                    <input
                      aria-label={`Horario de ${h.day}`}
                      disabled={h.closed}
                      value={h.hours}
                      placeholder="12:00–15:00 / 19:00–23:30"
                      onChange={(e) =>
                        update(
                          'opening_hours',
                          current.opening_hours.map((v, j) =>
                            i === j ? { ...v, hours: e.target.value } : v,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) =>
                        update(
                          'opening_hours',
                          current.opening_hours.map((v, j) =>
                            i === j ? { ...v, closed: e.target.checked } : v,
                          ),
                        )
                      }
                    />
                    Cerrado
                  </label>
                </div>
              ))}
            </div>
          </div>
        </fieldset>
        <PublishBar
          busy={busy}
          dirty={Boolean(draft || file)}
          onCancel={() => {
            setDraft(null)
            setFile(null)
          }}
        />
      </form>
    </>
  )
}
