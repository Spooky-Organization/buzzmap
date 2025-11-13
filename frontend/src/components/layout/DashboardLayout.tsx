import { useState, ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { SessionManager } from '@/auth/sessionManager';
import { cn } from '@/utils/cn';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Common Dashboard Layout Component
 * Handles the shared layout structure for all dashboards including:
 * - Sidebar with role-based navigation, logo, and user controls
 * - Main content area
 * - Footer
 * 
 * Manages mobile menu state and user session data internally.
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  
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
    <div className="min-h-screen flex flex-col bg-gray-50">
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
          {/* Mobile Hamburger Button - Fixed position with white background, hidden when sidebar is open */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'fixed top-4 left-4 z-[60] p-2.5 rounded-lg bg-white shadow-lg border border-gray-200',
                'hover:bg-gray-50 active:bg-gray-100 transition-colors lg:hidden',
                'flex items-center justify-center'
              )}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          )}

          <main className={cn(
            'flex-1 overflow-y-auto',
            'pt-16 pb-4 px-4', // Mobile: padding top for hamburger button
            'md:pt-20 md:px-6', // Tablet
            'lg:pt-8 lg:px-8 lg:pb-8' // Desktop: normal padding
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

