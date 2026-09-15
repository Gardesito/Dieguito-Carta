import { tr } from '../../../i18n'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
export default function Modal({
  children,
  onClose,
  titleId,
  className = '',
}: {
  children: ReactNode
  onClose: () => void
  titleId: string
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = ref.current!
    dialog.showModal()
    const cancel = (e: Event) => {
      e.preventDefault()
      close.current()
    }
    dialog.addEventListener('cancel', cancel)
    return () => {
      dialog.removeEventListener('cancel', cancel)
      dialog.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`modal ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect()
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose()
        }
      }}
    >
      <button className="icon-btn modal-close" aria-label={tr('Cerrar ventana')} onClick={onClose}>
        <X size={20} />
      </button>
      {children}
    </dialog>,
    document.body,
  )
}
