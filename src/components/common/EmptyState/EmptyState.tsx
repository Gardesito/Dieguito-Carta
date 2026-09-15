export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty" role="status">
      <h3>{text}</h3>
      <p className="muted">Probá con otra categoría o cambiá tu búsqueda.</p>
    </div>
  )
}
