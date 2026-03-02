import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Plus, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="h-1 bg-primary" />
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Indago</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname === '/'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )}
            >
              Properties
            </Link>
            <Link
              to="/add"
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname === '/add'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )}
            >
              Add Property
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6 pb-24 sm:pb-6">{children}</main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
              location.pathname === '/'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Home className="h-5 w-5" />
            <span>Properties</span>
          </Link>
          <Link
            to="/add"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
              location.pathname === '/add'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Plus className="h-5 w-5" />
            <span>Add</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
