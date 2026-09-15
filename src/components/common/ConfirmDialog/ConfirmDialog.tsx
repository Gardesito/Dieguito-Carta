import Modal from '../Modal/Modal'
import Button from '../Button/Button'
export default function ConfirmDialog({
  message,
  onConfirm,
  onClose,
  busy = false,
}: {
  message: string
  onConfirm: () => void
  onClose: () => void
  busy?: boolean
}) {
  return (
    <Modal
      titleId="confirm-title"
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <div className="modal-body">
        <h2 id="confirm-title">¿Eliminar?</h2>
        <p>{message}</p>
        <div className="row">
          <Button disabled={busy} onClick={onConfirm}>
            {busy ? 'Eliminando…' : 'Sí, eliminar'}
          </Button>
          <Button className="secondary" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
