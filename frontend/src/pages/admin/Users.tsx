import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  UserX,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { type UserRole } from '@/utils/constants';
import { AutoSEO } from '@/components/seo/SEO';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const Users = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // Placeholder users data
  const allUsers: User[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'USER',
      isEmailVerified: true,
      createdAt: '2024-01-15',
      lastLogin: '2 days ago',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'ACCOUNTANT',
      isEmailVerified: true,
      createdAt: '2024-01-20',
      lastLogin: '1 day ago',
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      role: 'USER',
      isEmailVerified: false,
      createdAt: '2024-02-01',
      lastLogin: '5 days ago',
    },
    {
      id: '4',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@example.com',
      role: 'ADMIN',
      isEmailVerified: true,
      createdAt: '2024-01-10',
      lastLogin: '1 hour ago',
    },
    {
      id: '5',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      role: 'USER',
      isEmailVerified: true,
      createdAt: '2024-02-05',
      lastLogin: '3 days ago',
    },
    {
      id: '6',
      firstName: 'Diana',
      lastName: 'Davis',
      email: 'diana.davis@example.com',
      role: 'ACCOUNTANT',
      isEmailVerified: false,
      createdAt: '2024-01-25',
      lastLogin: undefined,
    },
  ];

  // Filter users
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VERIFIED' && user.isEmailVerified) ||
      (statusFilter === 'UNVERIFIED' && !user.isEmailVerified);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDelete = (_userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      toast.success(`User ${userName} deleted successfully`, {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      // In real app, call API to delete user: await apiClient.delete(API_ENDPOINTS.USERS.DELETE(_userId))
    }
  };

  const handleView = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleEdit = (userId: string) => {
    navigate(`/admin/users/${userId}?edit=true`);
  };

  return (
    <>
      <AutoSEO />
          <div className="container-custom max-w-7xl">
            {/* Disclaimer Banner */}
            <Card variant="default" padding="md" className="mb-6 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Sample/Mock Admin Users Page
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    This is a mock admin users page with sample/placeholder data to demonstrate user management functionality.
                    All user data, statistics, and operations shown here are for demonstration purposes only.
                  </p>
                </div>
              </div>
            </Card>

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <UserCog className="h-8 w-8 text-primary-600" />
                  User Management
                </h1>
                <p className="mt-2 text-[var(--foreground-muted)]">
                  Manage users, roles, and permissions
                </p>
              </div>
              <Button
                variant="primary"
                icon={<UserPlus className="h-5 w-5" />}
                onClick={() => toast.info('Add user functionality coming soon')}
              >
                Add User
              </Button>
            </div>

            {/* Filters and Search */}
            <Card variant="default" padding="md" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Input
                    placeholder="Search users..."
                    icon={<Search className="h-5 w-5" />}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value as UserRole | 'ALL');
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 glass-input"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="USER">User</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'ALL' | 'VERIFIED' | 'UNVERIFIED');
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 glass-input"
                  >
                    <option value="ALL">All Status</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="UNVERIFIED">Unverified</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Users Table */}
            <Card variant="elevated" padding="none">
              {paginatedUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <UserX className="h-12 w-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No users found</h3>
                  <p className="text-[var(--foreground-muted)]">
                    {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'Try adjusting your filters'
                      : 'No users in the system'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--glass-border)]">
                        {paginatedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-[var(--card-hover)] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar className="mr-3">
                                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-[var(--foreground)]">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-[var(--foreground-muted)]">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={user.role.toLowerCase() as 'admin' | 'accountant' | 'user'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.isEmailVerified ? (
                                <Badge variant="verified">Verified</Badge>
                              ) : (
                                <Badge variant="unverified">Unverified</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                              {user.lastLogin || 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(user.id)}
                                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] p-2 rounded-lg transition-colors"
                                  aria-label="View user"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleEdit(user.id)}
                                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] p-2 rounded-lg transition-colors"
                                  aria-label="Edit user"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                  aria-label="Delete user"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-[var(--glass-border)] flex items-center justify-between">
                      <div className="text-sm text-[var(--foreground-muted)]">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{' '}
                        {filteredUsers.length} users
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ChevronLeft className="h-4 w-4" />}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white'
                                  : 'text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ChevronRight className="h-4 w-4" />}
                          iconPosition="right"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
    </>
  );
};
