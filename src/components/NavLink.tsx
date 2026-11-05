interface NavLinkProps {
  item: { key: string; label: string }
  active: string
  onSelect: (key: string) => void
  collapsed: boolean
}

const ICONS: Record<string, string> = {
  dashboard: 'M3 13h8V3H3v10zm10 8h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z',
  projects: 'M3 7.5A2.5 2.5 0 015.5 5H10l2 2h6.5A2.5 2.5 0 0121 9.5v8a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-10z',
  domains: 'M12 21a9 9 0 100-18 9 9 0 000 18zm-8-9h16M12 3a15 15 0 010 18m0-18a15 15 0 000 18',
  vhosts: 'M4 5h16v14H4zM4 9h16M8 5v4m4-4v4',
  services: 'M4 7h16M4 12h16M4 17h16M7 4v6m10 0v7',
  webservers: 'M3 5h18v14H3zM3 9h18m-13 6h4m-4 2h7',
  nginx: 'M12 3l8 4v6c0 4.5-3.4 7.4-8 9-4.6-1.6-8-4.5-8-9V7l8-4zm-3 9h6m-3-3v6',
  runtimes: 'M8 3h8l-1 6 4 7H5l4-7-1-6zm-3 16h14',
  php: 'M3 12c2-5 16-5 18 0-2 5-16 5-18 0zm5 0h.01M12 12h.01M16 12h.01',
  databases: 'M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3zm0 0v12c0 2 3.6 3 8 3s8-1 8-3V6m-16 6c0 2 3.6 3 8 3s8-1 8-3',
  laravel: 'M4 5l6-2 6 3-6 3-6-3zm0 0v7l6 3 6-3V6m-6 9v6l6-3v-6',
  logs: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8zm0-5v2m0 14v2m9-9h-2M5 12H3m15.4-6.4L17 7m-10 10l-1.4 1.4m12.8 0L17 17M7 7L5.6 5.6',
  about: 'M12 22a10 10 0 100-20 10 10 0 000 20zm0-14v.01M12 11v5',
}

export function NavLink({ item, active, onSelect, collapsed }: NavLinkProps) {
  const isActive = active === item.key
  return <button type="button" onClick={() => onSelect(item.key)} className={`nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'nav-link-collapsed' : ''}`} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined} aria-pressed={isActive} aria-current={isActive ? 'page' : undefined}>
    <span className="nav-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[item.key] ?? ICONS.dashboard} /></svg></span>
    {!collapsed && <span className="nav-link-label">{item.label}</span>}
    {isActive && <span className="nav-link-indicator" />}
  </button>
}
