import { useState } from 'react'
import { NavLink } from './NavLink'

export interface ShellProps {
  nav: { key: string; label: string }[]
  active: string
  onSelect: (key: string) => void
  children: React.ReactNode
}

export function Shell({ nav, active, onSelect, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex items-center h-14 px-4 border-b border-slate-200">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mr-2 p-2 rounded-md text-slate-500 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigasi"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <span
            className={`font-bold tracking-tight text-xl ${collapsed ? 'hidden' : 'block'}`}
          >
            Veltrunix
          </span>
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
      </aside>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}
