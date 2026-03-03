import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between bg-[var(--bg-secondary)] rounded-xl p-4 shadow-2xl border border-[var(--bg-tertiary)]">
      <span className="text-sm text-[var(--text-primary)]">Ny version tillgänglig!</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-4 py-1.5 bg-[var(--accent-green)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-green-hover)] transition cursor-pointer"
      >
        Uppdatera
      </button>
    </div>
  )
}
