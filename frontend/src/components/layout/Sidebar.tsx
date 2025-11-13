import { useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  DollarSign,
  FileText,
  BarChart3,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Home,
  Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import { SessionManager } from '@/auth/sessionManager';
import { toast } from 'sonner';

export interface SidebarProps {
  userRole?: 'USER' | 'ACCOUNTANT' | 'ADMIN';
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: ('USER' | 'ACCOUNTANT' | 'ADMIN')[];
}

export const Sidebar = ({ 
  userRole = 'USER',
  user,
  onLogout,
  isMobileOpen = false,
  onMobileToggle,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sessionManager = SessionManager.getInstance();

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await sessionManager.logout();
      }
      toast.success('Logged out successfully', {
        icon: <LogOut className="h-5 w-5" />,
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  // Role-specific navigation items - using functions to create icons to prevent blank icons on re-render
  const userNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard key="dashboard-icon" className="h-5 w-5" />,
      path: ROUTES.DASHBOARD,
    },
    {
      label: 'Profile',
      icon: <User key="profile-icon" className="h-5 w-5" />,
      path: ROUTES.PROFILE,
    },
    {
      label: 'Settings',
      icon: <Settings key="settings-icon" className="h-5 w-5" />,
      path: ROUTES.CHANGE_PASSWORD,
    },
  ];

  const accountantNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard key="dashboard-icon" className="h-5 w-5" />,
      path: ROUTES.DASHBOARD,
    },
    {
      label: 'Transactions',
      icon: <DollarSign key="transactions-icon" className="h-5 w-5" />,
      path: ROUTES.TRANSACTIONS,
    },
    {
      label: 'Reports',
      icon: <FileText key="reports-icon" className="h-5 w-5" />,
      path: ROUTES.REPORTS,
    },
    {
      label: 'Profile',
      icon: <User key="profile-icon" className="h-5 w-5" />,
      path: ROUTES.PROFILE,
    },
    {
      label: 'Settings',
      icon: <Settings key="settings-icon" className="h-5 w-5" />,
      path: ROUTES.CHANGE_PASSWORD,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard key="dashboard-icon" className="h-5 w-5" />,
      path: ROUTES.DASHBOARD,
    },
    {
      label: 'Users',
      icon: <UsersIcon key="users-icon" className="h-5 w-5" />,
      path: ROUTES.ADMIN_USERS,
    },
    {
      label: 'Analytics',
      icon: <BarChart3 key="analytics-icon" className="h-5 w-5" />,
      path: ROUTES.ANALYTICS,
    },
    {
      label: 'Profile',
      icon: <User key="profile-icon" className="h-5 w-5" />,
      path: ROUTES.PROFILE,
    },
    {
      label: 'Settings',
      icon: <Settings key="settings-icon" className="h-5 w-5" />,
      path: ROUTES.CHANGE_PASSWORD,
    },
  ];

  // Get nav items based on role - memoized to prevent icon re-rendering issues
  const navItems = useMemo(() => {
    switch (userRole) {
      case 'ACCOUNTANT':
        return accountantNavItems;
      case 'ADMIN':
        return adminNavItems;
      case 'USER':
      default:
        return userNavItems;
    }
  }, [userRole]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onMobileToggle?.();
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, onMobileToggle]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobileOpen) {
      onMobileToggle?.();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 bg-white border-r border-gray-200 z-50 flex flex-col',
          'top-0 h-screen overflow-x-hidden overflow-y-auto',
          'lg:fixed lg:top-0 lg:left-0',
          'transition-all duration-300 ease-in-out',
          // Mobile: full width when open, hidden when closed, always expanded on mobile
          isMobileOpen ? 'w-full translate-x-0' : '-translate-x-full',
          // Desktop: fixed width based on collapsed state, always visible
          'lg:translate-x-0',
          // On mobile, always show expanded (ignore isCollapsed)
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Logo and Collapse Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <Link
            to={ROUTES.HOME}
            className={cn(
              'flex items-center gap-2 hover:opacity-80 transition-opacity',
              // On mobile, always show expanded; on desktop, respect collapsed state
              isCollapsed && !isMobileOpen && 'justify-center'
            )}
          >
            <Home className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <h1 className={cn(
              'text-xl font-bold text-primary-600 transition-opacity duration-300 whitespace-nowrap',
              // On mobile, always show text; on desktop, respect collapsed state
              isCollapsed && !isMobileOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            )}>
              ATemplate
            </h1>
          </Link>
          <button
            onClick={() => {
              // On mobile, ONLY close the menu (don't toggle collapse state)
              if (isMobileOpen) {
                onMobileToggle?.();
              } else {
                // On desktop, toggle collapse
                onToggleCollapse?.();
              }
            }}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0',
              isCollapsed && 'lg:mx-auto',
              'lg:block', // Always show on desktop
              isMobileOpen ? 'block' : 'hidden lg:block' // Show on mobile when menu is open
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className={cn(
          'flex-1 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300',
          // On mobile, always use expanded padding; on desktop, use collapsed state
          isCollapsed && !isMobileOpen ? 'p-2' : 'p-4'
        )}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            // On mobile, always show expanded (ignore isCollapsed)
            const isMobileExpanded = isMobileOpen;
            const isActuallyCollapsed = isCollapsed && !isMobileExpanded;
            
            const linkContent = (
              <Link
                to={item.path}
                onClick={() => {
                  if (isMobileOpen) {
                    onMobileToggle?.();
                  }
                }}
                className={cn(
                  'flex items-center gap-3 py-3 rounded-lg transition-colors',
                  'justify-center lg:justify-start',
                  isActuallyCollapsed ? 'px-2' : 'px-4',
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={cn(
                  'transition-opacity duration-300 whitespace-nowrap',
                  isActuallyCollapsed ? 'opacity-0 w-0 overflow-hidden lg:opacity-0 lg:w-0' : 'opacity-100'
                )}>
                  {item.label}
                </span>
              </Link>
            );

            // Wrap with tooltip when collapsed (only on desktop)
            if (isActuallyCollapsed) {
              return (
                <Tooltip key={item.path} content={item.label} position="right">
                  <div>{linkContent}</div>
                </Tooltip>
              );
            }

            return <div key={item.path}>{linkContent}</div>;
          })}
        </nav>
        
        {/* Bottom Section: Notifications, User Info, Logout */}
        {user && (
          <div className={cn(
            'border-t border-gray-200 flex-shrink-0 space-y-2 overflow-x-hidden transition-all duration-300',
            // On mobile, always use expanded padding; on desktop, use collapsed state
            isCollapsed && !isMobileOpen ? 'p-2' : 'p-4'
          )}>
            {/* Notifications */}
            {isCollapsed && !isMobileOpen ? (
              <Tooltip content="Notifications" position="right">
                <button
                  className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              </Tooltip>
            ) : (
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                <span className="absolute top-1 right-4 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* User Info Display (No dropdown) */}
            {isCollapsed && !isMobileOpen ? (
              <Tooltip content={user.name} position="right">
                <div className="w-full flex items-center justify-center p-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
              </Tooltip>
            ) : (
              <div className="w-full flex items-center gap-3 px-4 py-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            {isCollapsed && !isMobileOpen ? (
              <Tooltip content="Logout" position="right">
                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-full flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors'
                  )}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    'transition-opacity duration-300 whitespace-nowrap',
                    'opacity-0 w-0 overflow-hidden lg:opacity-0 lg:w-0'
                  )}>
                    Logout
                  </span>
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors',
                  'justify-center lg:justify-start'
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  'transition-opacity duration-300 whitespace-nowrap text-sm',
                  'opacity-100'
                )}>
                  Logout
                </span>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

