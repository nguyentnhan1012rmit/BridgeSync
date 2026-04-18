import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  FileText,
  BookOpen,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'tasks', path: '/tasks', icon: ListChecks },
  { key: 'hourenso', path: '/hourenso', icon: FileText },
  { key: 'glossary', path: '/glossary', icon: BookOpen },
  { key: 'settings', path: '/settings', icon: Settings },
]

export default function MainLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-surface-raised border-r border-border
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-white font-bold">
            B
          </div>
          <span className="font-semibold text-text-primary tracking-tight">
            BridgeSync
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 lg:hidden text-text-muted hover:bg-surface-alt rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }
              `}
            >
              <item.icon size={18} strokeWidth={2} />
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name || 'Guest'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.role || 'User'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Log Out"
              className="p-2 text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 lg:px-8 h-16 bg-surface-raised border-b border-border shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 lg:hidden text-text-secondary hover:bg-surface-alt rounded-lg"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <LanguageToggle />
          </div>
        </header>

        {/* Page content scrollable area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-[76rem] mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
