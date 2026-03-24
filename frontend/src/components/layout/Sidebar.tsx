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
  Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import { SessionManager } from '@/auth/sessionManager';
import { toast } from 'sonner';

type Theme = 'light' | 'dark';

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
  theme?: Theme;
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
  theme = 'dark'
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sessionManager = SessionManager.getInstance();
  const isDark = theme === 'dark';

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

  const navLinkClass = (isActive: boolean) => cn(
    'flex items-center gap-3 py-3 rounded-lg transition-colors',
    'justify-center lg:justify-start',
    isActuallyCollapsed ? 'px-2' : 'px-4',
    isActive
      ? isDark
        ? 'bg-primary-500/20 text-primary-400 font-medium'
        : 'bg-primary-50 text-primary-600 font-medium'
      : isDark
        ? 'text-gray-400 hover:text-white hover:bg-white/10'
        : 'text-gray-700 hover:bg-gray-100'
  );

  const isActuallyCollapsed = isCollapsed && !isMobileOpen;

  return (
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
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        )}
      >
        <div className={cn(
          'flex items-center justify-between p-4 flex-shrink-0 border-b',
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}>
          <Link
            to={ROUTES.HOME}
            className={cn(
              'flex items-center gap-2 hover:opacity-80 transition-opacity',
              isCollapsed && !isMobileOpen && 'justify-center'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-primary-500 to-secondary-600'
            )}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className={cn(
              'text-xl font-bold text-white transition-opacity duration-300 whitespace-nowrap',
              isActuallyCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            )}>
              DashLabs
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
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark 
                ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
              isCollapsed && 'lg:mx-auto',
              'lg:block',
              isMobileOpen ? 'block' : 'hidden lg:block'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
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
                <Tooltip key={item.path} content={item.label} position="right">
                  <div>{linkContent}</div>
                </Tooltip>
              );
            }

            return <div key={item.path}>{linkContent}</div>;
          })}
        </nav>
        
        {user && (
          <div className={cn(
            'border-t flex-shrink-0 space-y-2 overflow-x-hidden transition-all duration-300',
            isDark ? 'border-gray-700' : 'border-gray-200',
            isCollapsed && !isMobileOpen ? 'p-2' : 'p-4'
          )}>
            {isCollapsed && !isMobileOpen ? (
              <div className="w-full flex items-center justify-center">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center',
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                )}>
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className={cn(
                'w-full flex items-center gap-3 px-4 py-2 rounded-lg',
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              )}>
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                )}>
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{user.name}</p>
                  <p className={cn(
                    'text-xs truncate',
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  )}>{user.email}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-3 py-2.5 rounded-lg transition-colors',
                'justify-center lg:justify-start',
                isActuallyCollapsed ? 'px-2' : 'px-4',
                isDark
                  ? 'text-red-400 hover:bg-red-500/20'
                  : 'text-red-600 hover:bg-red-50'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={cn(
                'transition-opacity duration-300 whitespace-nowrap text-sm',
                isActuallyCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              )}>
                Logout
              </span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
