export default function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="notice row" role="status">
      <span>{message}</span>
      <button className="btn secondary" onClick={retry}>
        Reintentar
      </button>
    </div>
  )
}
