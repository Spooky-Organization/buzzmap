const API_PREFIX = '/api/v1' as const;

export const appRoutes = {
  home: '/',
  auth: {
    login: '/login',
    loginFor: (audience: 'customer' | 'business') => `/login?audience=${audience}`,
    forgotPassword: '/forgot-password',
    forgotPasswordFor: (audience: 'customer' | 'business') =>
      `/forgot-password?audience=${audience}`,
    registerCustomer: '/register/customer',
    registerBusiness: '/register/business',
    registerFor: (audience: 'customer' | 'business') =>
      audience === 'business' ? '/register/business' : '/register/customer',
  },
  customer: {
    feed: '/feed',
    dashboard: '/dashboard',
    cart: '/cart',
    orders: '/orders',
    search: '/search',
    messages: '/messages',
    message: (conversationId: string) => `/messages/${conversationId}`,
    notifications: '/notifications',
    povCreate: '/pov/create',
    pov: (povId: string) => `/pov/${povId}`,
  },
  business: {
    dashboard: '/business/dashboard',
    notifications: '/business/notifications',
    messages: '/business/messages',
    message: (conversationId: string) => `/business/messages/${conversationId}`,
    shelf: '/business/shelf',
    orders: '/business/orders',
    postsCreate: '/business/posts/create',
    analytics: '/business/analytics',
    settings: '/business/settings',
    byId: (businessId: string) => `/business/${businessId}`,
  },
  admin: {
    overview: '/admin',
    notifications: '/admin/notifications',
    users: '/admin/users',
    businesses: '/admin/businesses',
    catalog: '/admin/catalog',
    orders: '/admin/orders',
    moderation: '/admin/moderation',
    messages: '/admin/messages',
    announcements: '/admin/announcements',
    security: '/admin/security',
    system: '/admin/system',
    settings: '/admin/settings',
    auditLog: '/admin/audit-log',
  },
  user: {
    byId: (userId: string) => `/user/${userId}`,
  },
} as const;

export const socketRoutes = {
  notifications: '/notifications',
  messaging: '/messaging',
} as const;

export const apiRoutes = {
  auth: {
    login: `${API_PREFIX}/auth/login`,
    refresh: `${API_PREFIX}/auth/refresh`,
    registerCustomer: `${API_PREFIX}/auth/register/customer`,
    registerBusiness: `${API_PREFIX}/auth/register/business`,
  },
  feed: {
    root: `${API_PREFIX}/feed`,
  },
  notifications: {
    root: `${API_PREFIX}/notifications`,
    unreadCount: `${API_PREFIX}/notifications/unread-count`,
    markAllRead: `${API_PREFIX}/notifications/read-all`,
    markRead: (notificationId: string) =>
      `${API_PREFIX}/notifications/${notificationId}/read`,
  },
  users: {
    me: `${API_PREFIX}/users/me`,
    changePassword: `${API_PREFIX}/users/me/password`,
    interests: `${API_PREFIX}/users/me/interests`,
    byId: (userId: string) => `${API_PREFIX}/users/${userId}`,
    follow: (userId: string) => `${API_PREFIX}/users/${userId}/follow`,
  },
  business: {
    profile: `${API_PREFIX}/business/profile`,
    byId: (businessId: string) => `${API_PREFIX}/business/${businessId}`,
    follow: (businessId: string) => `${API_PREFIX}/business/${businessId}/follow`,
  },
  products: {
    root: `${API_PREFIX}/products`,
    businessMine: `${API_PREFIX}/products/business`,
    byBusiness: (businessId: string) => `${API_PREFIX}/products/business/${businessId}`,
    byId: (productId: string) => `${API_PREFIX}/products/${productId}`,
  },
  posts: {
    root: `${API_PREFIX}/posts`,
  },
  pov: {
    root: `${API_PREFIX}/pov`,
    mine: `${API_PREFIX}/pov/my`,
    byId: (povId: string) => `${API_PREFIX}/pov/${povId}`,
    byBusiness: (businessId: string) => `${API_PREFIX}/pov/business/${businessId}`,
    byUser: (userId: string) => `${API_PREFIX}/pov/user/${userId}`,
    like: (povId: string) => `${API_PREFIX}/pov/${povId}/like`,
    comments: (povId: string) => `${API_PREFIX}/pov/${povId}/comments`,
  },
  cart: {
    root: `${API_PREFIX}/cart`,
    item: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
  },
  orders: {
    mine: `${API_PREFIX}/orders/my`,
    business: `${API_PREFIX}/orders/business`,
    checkout: `${API_PREFIX}/orders/checkout`,
    updateStatus: (orderId: string) => `${API_PREFIX}/orders/${orderId}/status`,
  },
  recommendations: {
    businessStats: `${API_PREFIX}/recommendations/business/stats`,
    top: `${API_PREFIX}/recommendations/top`,
  },
  search: {
    root: `${API_PREFIX}/search`,
    businesses: `${API_PREFIX}/search/businesses`,
    products: `${API_PREFIX}/search/products`,
    categories: `${API_PREFIX}/search/categories`,
    users: `${API_PREFIX}/search/users`,
  },
  messaging: {
    conversations: `${API_PREFIX}/messaging/conversations`,
    recommendations: `${API_PREFIX}/messaging/conversations/recommendations`,
    contactRecommendations: `${API_PREFIX}/messaging/conversations/recommendations/contacts`,
    businessRecommendations: `${API_PREFIX}/messaging/conversations/recommendations/business`,
    conversation: (conversationId: string) =>
      `${API_PREFIX}/messaging/conversations/${conversationId}`,
    messages: (conversationId: string) =>
      `${API_PREFIX}/messaging/conversations/${conversationId}/messages`,
  },
  admin: {
    overview: `${API_PREFIX}/admin/overview`,
    users: `${API_PREFIX}/admin/users`,
    businesses: `${API_PREFIX}/admin/businesses`,
    catalog: `${API_PREFIX}/admin/catalog`,
    orders: `${API_PREFIX}/admin/orders`,
    moderation: `${API_PREFIX}/admin/moderation`,
    announcements: `${API_PREFIX}/admin/announcements`,
    messages: `${API_PREFIX}/admin/messages`,
    security: `${API_PREFIX}/admin/security`,
    system: `${API_PREFIX}/admin/system`,
    settings: `${API_PREFIX}/admin/settings`,
    auditLog: `${API_PREFIX}/admin/audit-log`,
  },
} as const;
