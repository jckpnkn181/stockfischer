interface ResignDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function ResignDialog({ onConfirm, onCancel }: ResignDialogProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Ge upp?</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Är du säker på att du vill ge upp partiet?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium hover:brightness-110 transition cursor-pointer"
          >
            Fortsätt spela
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-[var(--accent-red)] text-white font-medium hover:brightness-110 transition cursor-pointer"
          >
            Ge upp
          </button>
        </div>
      </div>
    </div>
  )
}
