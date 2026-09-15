import { useEffect, useState } from 'react'
import { Upload } from 'lucide-react'
import { validateImage } from '../../../services/storage.service'
import { imageSrc } from '../../../utils/image'
import { toast } from 'sonner'
export default function ImageUploader({
  url,
  file,
  onFile,
  alt,
  onAlt,
  onUrl,
}: {
  url: string
  file: File | null
  onFile: (f: File | null) => void
  alt: string
  onAlt: (s: string) => void
  onUrl: (s: string) => void
}) {
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const src = URL.createObjectURL(file)
    setPreview(src)
    return () => URL.revokeObjectURL(src)
  }, [file])
  return (
    <div className="image-uploader">
      <img
        src={preview || imageSrc(url)}
        alt={alt || 'Vista previa de la imagen'}
        width={300}
        height={190}
      />
      <label className="upload-label">
        <Upload size={18} /> Elegir fotografía
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => {
            const next = e.target.files?.[0]
            if (next)
              try {
                validateImage(next)
                onFile(next)
              } catch (error) {
                toast.error((error as Error).message)
              }
            e.target.value = ''
          }}
        />
      </label>
      <small>JPG, PNG, WEBP o AVIF. Hasta 5 MB.</small>
      {file && (
        <button type="button" className="btn secondary" onClick={() => onFile(null)}>
          Cancelar nueva imagen
        </button>
      )}
      <label className="field">
        Descripción de la imagen (accesibilidad)
        <input value={alt} onChange={(e) => onAlt(e.target.value)} maxLength={200} />
      </label>
      <details>
        <summary>Usar una URL de imagen</summary>
        <label className="field">
          Enlace HTTPS
          <input
            type="url"
            value={url}
            onChange={(e) => {
              onFile(null)
              onUrl(e.target.value)
            }}
          />
        </label>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            onFile(null)
            onUrl('')
          }}
        >
          Quitar imagen
        </button>
      </details>
    </div>
  )
}
