import type { ReactNode } from 'react'

type ModalProps = {
  isOpen: boolean
  titulo: string
  onClose: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

function Modal({ isOpen, titulo, onClose, children, ancho = 'md' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className={`max-h-[90vh] w-full overflow-y-auto rounded bg-white p-6 shadow-lg ${
          ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'
        }`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
        }}
      >
        <h2 id="modal-titulo" className="mb-4 text-xl font-semibold text-slate-800">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  )
}

export default Modal
