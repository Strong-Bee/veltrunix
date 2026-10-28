import { useState } from 'react'
import { NavLink } from './NavLink'
import logo from '../assets/veltrunix-logo.png'

export interface ShellProps {
  nav: { key: string; label: string }[]
  active: string
  onSelect: (key: string) => void
  children: React.ReactNode
}

export function Shell({ nav, active, onSelect, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden text-foreground bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-border bg-card transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
        aria-label="Navigasi utama"
      >
        <div className="flex items-center h-14 px-4 border-b border-border">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mr-2 p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle navigasi"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={logo}
              alt="Veltrunix Logo"
              className="w-8 h-8 object-contain flex-shrink-0"
              aria-hidden="true"
            />
            <span
              className={`font-bold tracking-tight text-xl ${collapsed ? 'hidden' : 'block'} text-foreground whitespace-nowrap overflow-hidden text-ellipsis`}
            >
              Veltrunix
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.key}
              item={item}
              active={active}
              onSelect={onSelect}
              collapsed={collapsed}
            />
          ))}
        </nav>
        <div className="mt-auto px-2 py-4 border-t border-border">
          <NavLink
            item={{ key: 'settings', label: 'Settings' }}
            active={active}
            onSelect={onSelect}
            collapsed={collapsed}
          />
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}