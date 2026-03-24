import { useState, ReactNode } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { SessionManager } from '@/auth/sessionManager';
import { LiveStatus } from '@/components/ui/LiveStatus';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  const { theme, toggleTheme, isDark } = useTheme();
  
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
    <div className={cn(
      'min-h-screen flex flex-col',
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          userRole={user.role}
          user={user}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          theme={theme}
        />
        <div 
          className={cn(
            'flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          )}
        >
          {/* Top Bar with Theme Toggle and Live Status */}
          <div className={cn(
            'sticky top-0 z-40 flex items-center justify-end gap-4 px-4 py-3 border-b',
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            <LiveStatus />
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'fixed top-4 left-4 z-[60] p-2.5 rounded-lg shadow-lg border',
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700',
                'flex items-center justify-center lg:hidden'
              )}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          <main className={cn(
            'flex-1 overflow-y-auto',
            'pt-16 pb-4 px-4',
            'md:pt-20 md:px-6',
            'lg:pt-8 lg:px-8 lg:pb-8'
          )}>
            <div className="container-custom max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
