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
  PanelLeftClose,
  PanelLeftOpen,
  Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/utils/constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  onToggleCollapse,
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

  const navItems = useMemo(() => {
    const userNavItems: NavItem[] = [
      { label: 'Dashboard', icon: <LayoutDashboard key="dashboard-icon" className="h-5 w-5" />, path: ROUTES.DASHBOARD },
      { label: 'Profile', icon: <User key="profile-icon" className="h-5 w-5" />, path: ROUTES.PROFILE },
      { label: 'Settings', icon: <Settings key="settings-icon" className="h-5 w-5" />, path: ROUTES.CHANGE_PASSWORD },
    ];

    const accountantNavItems: NavItem[] = [
      { label: 'Dashboard', icon: <LayoutDashboard key="dashboard-icon" className="h-5 w-5" />, path: ROUTES.DASHBOARD },
      { label: 'Transactions', icon: <DollarSign key="transactions-icon" className="h-5 w-5" />, path: ROUTES.TRANSACTIONS },
      { label: 'Reports', icon: <FileText key="reports-icon" className="h-5 w-5" />, path: ROUTES.REPORTS },
      { label: 'Profile', icon: <User key="profile-icon" className="h-5 w-5" />, path: ROUTES.PROFILE },
      { label: 'Settings', icon: <Settings key="settings-icon" className="h-5 w-5" />, path: ROUTES.CHANGE_PASSWORD },
    ];

    const adminNavItems: NavItem[] = [
      { label: 'Dashboard', icon: <LayoutDashboard key="dashboard-icon" className="h-5 w-5" />, path: ROUTES.DASHBOARD },
      { label: 'Users', icon: <UsersIcon key="users-icon" className="h-5 w-5" />, path: ROUTES.ADMIN_USERS },
      { label: 'Analytics', icon: <BarChart3 key="analytics-icon" className="h-5 w-5" />, path: ROUTES.ANALYTICS },
      { label: 'Profile', icon: <User key="profile-icon" className="h-5 w-5" />, path: ROUTES.PROFILE },
      { label: 'Settings', icon: <Settings key="settings-icon" className="h-5 w-5" />, path: ROUTES.CHANGE_PASSWORD },
    ];

    switch (userRole) {
      case 'ACCOUNTANT': return accountantNavItems;
      case 'ADMIN': return adminNavItems;
      default: return userNavItems;
    }
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onMobileToggle?.();
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, onMobileToggle]);

  useEffect(() => {
    if (isMobileOpen) {
      onMobileToggle?.();
    }
  }, [location.pathname]);

  const isActuallyCollapsed = isCollapsed && !isMobileOpen;
  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const navLinkClass = (isActive: boolean) => cn(
    'flex items-center gap-3 py-3 rounded-lg transition-colors',
    isActuallyCollapsed ? 'justify-center' : 'justify-center lg:justify-start',
    isActuallyCollapsed ? 'px-2' : 'px-4',
    isActive
      ? 'bg-primary-500/20 text-primary-400 font-medium'
      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]'
  );

  return (
    <TooltipProvider delayDuration={200}>
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 z-50 flex flex-col',
          'top-0 h-screen overflow-x-hidden overflow-y-auto',
          'lg:fixed lg:top-0 lg:left-0',
          'transition-all duration-300 ease-in-out',
          isMobileOpen ? 'w-full translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          'bg-[var(--sidebar-bg)] backdrop-blur-xl border-[var(--sidebar-border)]'
        )}
      >
        <div className={cn(
          'flex flex-shrink-0 border-b border-[var(--glass-border)]',
          isActuallyCollapsed
            ? 'flex-col items-center p-2'
            : 'items-center justify-between p-4'
        )}>
          {isActuallyCollapsed ? (
            <button
              onClick={() => onToggleCollapse?.()}
              className="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600 cursor-pointer"
              aria-label="Expand sidebar"
            >
              <Shield className="h-5 w-5 text-white transition-opacity duration-200 group-hover:opacity-0" />
              <PanelLeftOpen className="h-5 w-5 text-white absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
            </button>
          ) : (
            <>
              <Link
                to={ROUTES.HOME}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)] whitespace-nowrap">
                  BuzzMap
                </h1>
              </Link>
              <button
                onClick={() => {
                  if (isMobileOpen) {
                    onMobileToggle?.();
                  } else {
                    onToggleCollapse?.();
                  }
                }}
                className="p-2 rounded-lg transition-colors hover:bg-[var(--card-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <nav className={cn(
          'flex-1 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300',
          isCollapsed && !isMobileOpen ? 'p-2' : 'p-4'
        )}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            const linkContent = (
              <Link
                to={item.path}
                onClick={() => {
                  if (isMobileOpen) {
                    onMobileToggle?.();
                  }
                }}
                className={navLinkClass(isActive)}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={cn(
                  'transition-opacity duration-300 whitespace-nowrap',
                  isActuallyCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                )}>
                  {item.label}
                </span>
              </Link>
            );

            if (isActuallyCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <div>{linkContent}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.path}>{linkContent}</div>;
          })}
        </nav>
        
        {user && (
          <div className={cn(
            'border-t flex-shrink-0 space-y-2 overflow-x-hidden transition-all duration-300',
            'border-[var(--glass-border)]',
            isCollapsed && !isMobileOpen ? 'p-2' : 'p-4'
          )}>
            {isActuallyCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-500 to-secondary-600">
                      <span className="text-xs font-semibold text-white">{userInitials}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{user.name}</TooltipContent>
              </Tooltip>
            ) : (
              <div className={cn(
                'w-full flex items-center gap-3 px-4 py-2 rounded-lg',
                'bg-[var(--glass-bg)]'
              )}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-500 to-secondary-600">
                  <span className="text-xs font-semibold text-white">{userInitials}</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    'text-[var(--foreground)]'
                  )}>{user.name}</p>
                  <p className={cn(
                    'text-xs truncate',
                    'text-[var(--foreground-muted)]'
                  )}>{user.email}</p>
                </div>
              </div>
            )}

            {isActuallyCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center py-2.5 px-2 rounded-lg transition-colors text-red-400 hover:bg-red-500/20"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 justify-center lg:justify-start py-2.5 px-4 rounded-lg transition-colors text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap text-sm">Logout</span>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
    </TooltipProvider>
  );
};
