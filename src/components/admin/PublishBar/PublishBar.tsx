export default function PublishBar({
  busy,
  onCancel,
  dirty = true,
}: {
  busy: boolean
  onCancel: () => void
  dirty?: boolean
}) {
  return (
    <div className="publish-bar">
      <span>
        {busy
          ? 'Guardando…'
          : dirty
            ? 'Al guardar, los cambios se publican en el sitio.'
            : 'Sin cambios pendientes.'}
      </span>
      <button className="btn secondary" type="button" disabled={busy} onClick={onCancel}>
        Cancelar
      </button>
      <button className="btn" type="submit" disabled={busy || !dirty}>
        {busy ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}
