import { useCallback, useEffect, useState } from 'react'
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detect mobile breakpoint
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // On mobile, start with drawer closed; on desktop, start with sidebar expanded
  useEffect(() => {
    setMounted(true)
    if (isMobile) {
      setCollapsed(false)
      setDrawerOpen(false)
    } else {
      setDrawerOpen(false)
    }
  }, [isMobile])

  // Close drawer on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false)
      }
    },
    [drawerOpen],
  )

  useEffect(() => {
    if (mounted) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mounted, handleKeyDown])

  // Close drawer when resize to desktop
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setDrawerOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleDrawer = () => setDrawerOpen((prev) => !prev)
  const closeDrawer = () => setDrawerOpen(false)

  const sidebarClasses = `fixed inset-y-0 left-0 z-40 flex flex-col border-r border-surface-border bg-surface-base transition-all duration-300 ease-in-out w-sidebar-collapsed min-w-0`
  const drawerClasses = `fixed inset-y-0 left-0 z-[60] flex flex-col border-r border-surface-border bg-surface-base shadow-xl w-sidebar-mobile min-w-0 transform transition-transform duration-300 ease-in-out ${
    drawerOpen ? 'translate-x-0' : '-translate-x-full'
  }`
  const backdropClasses = `fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out ${
    drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  }`

  const contentClasses = `flex-1 overflow-y-auto min-w-0 ${
    isMobile && !drawerOpen ? 'pl-0' : collapsed ? 'pl-sidebar-collapsed' : 'pl-sidebar-expanded'
  } p-4 sm:p-6 lg:p-8`

  return (
    <>
      <div className="flex h-screen overflow-hidden text-foreground bg-background">
        {/* Backdrop for mobile drawer */}
        {isMobile && drawerOpen && (
          <div
            className={backdropClasses}
            onClick={closeDrawer}
            aria-hidden="true"
          />
        )}

        {/* Sidebar - always present on desktop, drawer on mobile */}
        <aside
          className={isMobile ? drawerClasses : sidebarClasses}
          aria-label="Navigasi utama"
        >
          <div className="flex items-center h-header px-4 border-b border-surface-border">
            {/* Hamburger button for mobile drawer */}
            {isMobile && (
              <button
                onClick={toggleDrawer}
                className="mr-2 p-2 rounded-md text-text-muted hover:text-text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Buka menu navigasi"
                aria-expanded={drawerOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            )}
            {/* Toggle collapse button for desktop */}
            {!isMobile && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="mr-2 p-2 rounded-md text-text-muted hover:text-text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Toggle navigasi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
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
            {/* Close drawer button (mobile only) */}
            {isMobile && drawerOpen && (
              <button
                onClick={closeDrawer}
                className="ml-auto p-2 rounded-md text-text-muted hover:text-text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Tutup menu navigasi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 min-w-0">
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
          <div className="mt-auto px-2 py-4 border-t border-surface-border min-w-0">
            <NavLink
              item={{ key: 'settings', label: 'Settings' }}
              active={active}
              onSelect={onSelect}
              collapsed={collapsed}
            />
          </div>
        </aside>
        <div className={contentClasses}>{children}</div>
      </div>
    </>
  )
}