export function NotImplemented({ module }: { module: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-elevated text-text-muted mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-text-primary">{module}</h2>
      <p className="mt-2 text-sm text-text-muted">
        Modul ini belum diimplementasikan dalam tahap fondasi.
      </p>
      <p className="mt-1 text-xs text-text-muted max-w-xs">
        Tampilan ini sengaja tidak menampilkan status palsu. Fitur akan diaktifkan
        seiring dengan pengembangan modul backend dan frontend berikutnya.
      </p>
    </div>
  )
}