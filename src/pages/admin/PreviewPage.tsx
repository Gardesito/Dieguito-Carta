import { useEffect, useState } from 'react'
import HomePage from '../public/HomePage'
import type { Catalog } from '../../services/catalog.service'
export default function PreviewPage() {
  const [data, setData] = useState<Catalog | null>(null)
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === location.origin &&
        event.source === parent &&
        event.data?.type === 'dieguito-preview'
      )
        setData(event.data.catalog)
    }
    window.addEventListener('message', receive)
    parent.postMessage({ type: 'dieguito-preview-ready' }, location.origin)
    return () => window.removeEventListener('message', receive)
  }, [])
  return data ? (
    <div
      onClickCapture={(event) => {
        const link = (event.target as Element).closest('a')
        if (!link) return
        const url = new URL(link.href)
        if (url.origin === location.origin && url.hash && ['/', '/menu'].includes(url.pathname)) {
          event.preventDefault()
          document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      <HomePage
        previewData={data}
        onEdit={(key) => parent.postMessage({ type: 'dieguito-edit', key }, location.origin)}
      />
    </div>
  ) : (
    <p className="empty">Preparando la vista previa…</p>
  )
}
