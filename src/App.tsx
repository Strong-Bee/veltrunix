import { useState } from 'react'
import Dashboard from './features/dashboard/Dashboard'
import RuntimeManager from './features/runtimes/RuntimeManager'
import { Shell } from './components/Shell'
import { NotImplemented } from './features/not-implemented'

type Page =
  | 'dashboard'
  | 'runtimes'
  | 'php'
  | 'webservers'
  | 'databases'
  | 'projects'
  | 'laravel'
  | 'domains'
  | 'services'
  | 'logs'
  | 'settings'

const NAV: { key: Page; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'runtimes', label: 'Runtime Manager' },
  { key: 'php', label: 'PHP Manager' },
  { key: 'webservers', label: 'Web Servers' },
  { key: 'databases', label: 'Databases' },
  { key: 'projects', label: 'Projects' },
  { key: 'laravel', label: 'Laravel Tools' },
  { key: 'domains', label: 'Domains' },
  { key: 'services', label: 'Services' },
  { key: 'logs', label: 'Logs' },
  { key: 'settings', label: 'Settings' },
]

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  const current = NAV.find((n) => n.key === page)

  const onSelect = (key: string) => {
    setPage(key as Page);
  };

  return (
    <Shell nav={NAV} active={page} onSelect={onSelect}>
      {page === 'dashboard' ? (
        <Dashboard />
      ) : page === 'runtimes' ? (
        <RuntimeManager />
      ) : (
        <NotImplemented module={current?.label ?? String(page)} />
      )}
    </Shell>
  )
}
