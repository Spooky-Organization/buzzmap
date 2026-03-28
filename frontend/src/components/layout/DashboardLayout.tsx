import { useState, ReactNode } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { SessionManager } from '@/auth/sessionManager';
import { LiveStatus } from '@/components/ui/LiveStatus';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  const { isDark, toggleTheme } = useTheme();

  const user = sessionUser ? {
    name: `${sessionUser.firstName} ${sessionUser.lastName}`,
    email: sessionUser.email,
    role: sessionUser.role,
  } : {
    name: 'Guest',
    email: '',
    role: 'USER' as const,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          userRole={user.role}
          user={user}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div
          className={cn(
            'flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          )}
        >
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <main className={cn(
            'flex-1 overflow-y-auto',
            'py-4 px-4',
            'md:py-6 md:px-6',
            'lg:py-8 lg:px-8'
          )}>
            <div className="container-custom max-w-7xl mx-auto">
              {/* Utility bar */}
              <div className="flex items-center gap-4 mb-6 ml-12 lg:ml-0">
                <LiveStatus />
                <div className="flex items-center gap-2 ml-auto">
                  <Sun className="h-4 w-4 text-[var(--foreground-muted)]" />
                  <Switch
                    checked={isDark}
                    onCheckedChange={() => toggleTheme()}
                    aria-label="Toggle theme"
                  />
                  <Moon className="h-4 w-4 text-[var(--foreground-muted)]" />
                </div>
              </div>
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
