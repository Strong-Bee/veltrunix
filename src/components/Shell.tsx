import { useCallback, useEffect, useState } from 'react'
import { NavLink } from './NavLink'
import logo from '../assets/veltrunix-logo.png'

export interface ShellProps {
  nav: { key: string; label: string }[]
  active: string
  onSelect: (key: string) => void
  children: React.ReactNode
}

const GROUPS = [
  { title: 'WORKSPACE', keys: ['dashboard', 'projects', 'domains', 'vhosts'] },
  { title: 'ENVIRONMENT', keys: ['services', 'webservers', 'nginx', 'runtimes', 'php', 'databases'] },
  { title: 'DEVELOPMENT', keys: ['laravel', 'logs'] },
  { title: 'PREFERENCES', keys: ['settings', 'about'] },
]

export function Shell({ nav, active, onSelect, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const current = nav.find((item) => item.key === active)

  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches
      setIsMobile(mobile)
      if (!mobile) setDrawerOpen(false)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const selectPage = useCallback((key: string) => {
    onSelect(key)
    setDrawerOpen(false)
  }, [onSelect])

  const sidebar = (
    <aside className={`app-sidebar ${collapsed && !isMobile ? 'app-sidebar-collapsed' : ''} ${isMobile ? `app-sidebar-mobile ${drawerOpen ? 'app-sidebar-open' : ''}` : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><img src={logo} alt="Veltrunix" /></div>
        {(!collapsed || isMobile) && <div className="brand-copy"><span>Veltrunix</span><small>LOCAL DEV ENVIRONMENT</small></div>}
        {isMobile && <button className="icon-button sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Tutup navigasi">×</button>}
      </div>
      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {GROUPS.map((group) => {
          const items = group.keys.map((key) => nav.find((item) => item.key === key)).filter((item): item is { key: string; label: string } => Boolean(item))
          return items.length ? <section className="nav-group" key={group.title}>
            {(!collapsed || isMobile) && <p className="nav-group-title">{group.title}</p>}
            <div className="nav-group-items">{items.map((item) => <NavLink key={item.key} item={item} active={active} onSelect={selectPage} collapsed={collapsed && !isMobile} />)}</div>
          </section> : null
        })}
      </nav>
      <div className="sidebar-footer"><span className="sidebar-footer-dot" />{(!collapsed || isMobile) && <><span>Local environment</span><span className="sidebar-version">v0.1.0</span></>}</div>
    </aside>
  )

  return (
    <div className="app-frame">
      {isMobile && drawerOpen && <button className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu" />}
      {sidebar}
      <div className={`app-main ${!isMobile ? (collapsed ? 'app-main-collapsed' : 'app-main-expanded') : ''}`}>
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setDrawerOpen(true)} aria-label="Buka navigasi">☰</button>
            {!isMobile && <button className="icon-button desktop-collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label="Ciutkan navigasi">{collapsed ? '›' : '‹'}</button>}
            <div className="topbar-breadcrumb"><span>Veltrunix</span><span className="breadcrumb-slash">/</span><strong>{current?.label ?? 'Workspace'}</strong></div>
          </div>
          <div className="topbar-right"><span className="topbar-status"><i /> Local machine</span><span className="topbar-divider" /><span className="topbar-caption">Developer workspace</span></div>
        </header>
        <main className="page-content" key={active}>{children}</main>
        <footer className="app-footer"><span>Veltrunix Local Development Environment</span><span>Built for your local workflow</span></footer>
      </div>
    </div>
  )
}
