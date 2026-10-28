interface NavLinkProps {
  item: { key: string; label: string }
  active: string
  onSelect: (key: string) => void
  collapsed: boolean
}

const ICONS: Record<string, string> = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  runtimes: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  php: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  webservers: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0110.5 8h.5a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2h-.014c0-.995.068-1.97.195-2.924M16 7.572a3 3 0 01-2.121 3.883l-2.829 2.829c-.586.586-1.535.586-2.121 0l-2.829-2.829a3 3 0 010-4.243l2.829-2.829c.586-.586 1.535-.586 2.121 0l2.829 2.829a3 3 0 010 4.243Z',
  databases: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  projects: 'M12 6V4m0 2a2 2 0 100 4m0-4V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4',
  laravel: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  domains: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  services: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  logs: 'M12 6V4m0 2a2 2 0 100 4m0-4V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4m0 2V4',
  settings: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
}

export function NavLink({ item, active, onSelect, collapsed }: NavLinkProps) {
  const isActive = active === item.key

  return (
    <button
      onClick={() => onSelect(item.key)}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
      aria-pressed={isActive}
    >
      {collapsed ? (
        <span className="shrink-0 p-1.5 rounded bg-blue-100 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={ICONS[item.key] ?? ICONS.dashboard}
            />
          </svg>
        </span>
      ) : (
        <>
          <span className="shrink-0 p-1.5 rounded bg-blue-100 text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={ICONS[item.key] ?? ICONS.dashboard}
              />
            </svg>
          </span>
          <span className={isActive ? 'font-semibold' : 'font-normal'}>
            {item.label}
          </span>
        </>
      )}
    </button>
  )
}
