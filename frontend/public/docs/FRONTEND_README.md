# Authentication Template - Frontend

A modern, production-ready frontend UI/UX for the Authentication Template application. This frontend provides a complete, beautiful user interface with form validation, routing, and all authentication-related pages. **Backend integration is ready to be added** - all placeholder files are structured and ready for connection.

## Features

- 🎨 Modern, beautiful UI with Tailwind CSS
- 🔒 Form validation with singleton validation manager
- 📱 Fully responsive design
- ♿ Accessible components (WCAG 2.1 AA compliant)
- 🎯 TypeScript for type safety
- 🚀 Vite for fast development
- 🎭 Sonner for toast notifications
- 🎨 Lucide React icons throughout
- ✅ All authentication pages implemented with backend integration
- ✅ Dashboard and Profile pages complete
- ✅ Common DashboardLayout component for consistent layout
- ✅ Responsive sidebar with collapse/expand functionality
- ✅ Mobile hamburger menu with full-viewport support
- ✅ Tooltips for collapsed sidebar navigation
- ✅ Analytics Dashboard (mock data)
- ✅ Admin pages with mock data disclaimers
- ✅ Redesigned responsive Footer
- ✅ Password strength indicators
- ✅ Eye toggle for password fields
- ✅ Form validation with real-time feedback
- ✅ API Client with automatic token management
- ✅ Session management with token refresh
- ✅ Secure token storage with XSS protection
- ✅ Route guards with authentication and role-based protection

## Tech Stack

- **React 18+** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing structure
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **Axios** - HTTP client with interceptors

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # ✅ API client fully implemented
│   │   ├── client.ts      # ✅ Singleton API client with axios, interceptors, error handling
│   │   └── types.ts       # ✅ API response types and ApiError interface
│   ├── auth/             # ✅ Auth logic fully implemented
│   │   ├── sessionManager.ts  # ✅ Session management with login, logout, token refresh
│   │   └── tokenManager.ts   # ✅ Secure token storage with XSS protection
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Input, PasswordInput, Card, Tooltip, etc.)
│   │   ├── layout/      # Layout components (DashboardLayout, Sidebar, Footer)
│   │   ├── forms/       # Form components (ready for extraction if needed)
│   │   └── protected/   # Protected component wrapper
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages (Login, Register, ForgotPassword, etc.)
│   │   ├── dashboard/    # Dashboard pages (UserDashboard, AccountantDashboard, AdminDashboard, AnalyticsDashboard)
│   │   ├── profile/      # Profile page
│   │   ├── mfa/         # MFA pages (MFASetup, MFAVerify, MFALogin)
│   │   ├── admin/       # Admin pages (Users, UserDetails)
│   │   └── NotFound.tsx # 404 page
│   ├── routes/          # Routing configuration
│   │   ├── router.tsx   # Router manager
│   │   ├── routes.tsx   # Route definitions
│   │   └── guards.tsx   # ✅ Route guards with authentication and role-based protection
│   ├── utils/           # Utilities
│   │   ├── validation.ts  # Singleton validation manager (FULLY IMPLEMENTED)
│   │   ├── constants.ts   # App constants and routes
│   │   ├── cn.ts          # Class name utility
│   │   └── security.ts    # Security utilities (placeholder)
│   ├── hooks/           # Custom hooks
│   │   └── useAuth.ts   # ✅ useAuth hook using SessionManager
│   ├── styles/          # Global styles
│   │   ├── globals.css  # Tailwind and global styles
│   │   └── theme.css    # CSS variables and theme
│   ├── App.tsx          # Main app component with router
│   └── main.tsx         # Entry point
├── public/             # Static assets
├── .env.example        # Environment variables template
├── .env                # Environment variables (gitignored)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── .eslintrc.cjs       # ESLint configuration
└── README.md           # This file
```

## Key Components

### UI Components

- **Button** - Button with icon support and variants
- **Input** - Text input with icon support
- **PasswordInput** - Password input with eye toggle and strength indicator
- **Card** - Card container component
- **Tooltip** - Tooltip component for hover information
- **LoadingSpinner** - Loading indicator
- **ErrorMessage** - Error message display

### Layout Components

- **DashboardLayout** - Common layout component for all dashboard pages
- **Sidebar** - Responsive sidebar with collapse/expand, mobile hamburger menu, tooltips
- **Footer** - Redesigned responsive footer with multi-column layout

### Validation

The `ValidationManager` singleton handles all form validation:
- Email validation
- Password strength validation
- Name validation
- TOTP code validation
- Form-level validation

## Pages

### ✅ Implemented Pages

- **Login** (`/login`) - ✅ User login with backend API, MFA flow support
- **Register** (`/register`) - ✅ User registration with backend API
- **Forgot Password** (`/forgot-password`) - ✅ Password reset request with backend API
- **Reset Password** (`/reset-password`) - ✅ Password reset form with backend API
- **Verify Email** (`/verify-email`) - ✅ Email verification with backend API
- **Change Password** (`/change-password`) - ✅ Protected password change with backend API
- **Dashboard** (`/dashboard`) - Role-based dashboards (User, Accountant, Admin) with mock data
- **Analytics Dashboard** (`/analytics`) - Analytics dashboard with charts and metrics (mock data, Admin only)
- **Profile** (`/profile`) - User profile with personal info, security settings
- **MFA Setup** (`/mfa/setup`) - Multi-factor authentication setup with backend API
- **MFA Verify** (`/mfa/verify`) - MFA verification page with backend API
- **MFA Login** (`/mfa/login`) - MFA login flow with backend API
- **Admin Users** (`/admin/users`) - User management list with search and filters (mock data)
- **Admin User Details** (`/admin/users/:id`) - Individual user management (mock data)
- **NotFound** (`/404`) - 404 error page

## Implementation Status

### ✅ Completed

- ✅ All configuration files (Vite, TypeScript, Tailwind, ESLint)
- ✅ Base UI components (Button, Input, PasswordInput, Card, Tooltip, LoadingSpinner, ErrorMessage)
- ✅ Layout components (DashboardLayout, Sidebar, Footer)
- ✅ **Common DashboardLayout**: Unified layout component for all dashboard pages
- ✅ **Responsive Sidebar**: Collapse/expand functionality with smooth animations
- ✅ **Mobile Hamburger Menu**: Full-viewport mobile menu with fixed hamburger button
- ✅ **Tooltips**: Tooltip component for collapsed sidebar navigation
- ✅ **Redesigned Footer**: Multi-column responsive footer with improved UX
- ✅ Validation singleton (`ValidationManager`) - fully functional
- ✅ All authentication pages with backend integration (Login, Register, ForgotPassword, ResetPassword, VerifyEmail, ChangePassword)
- ✅ Role-based dashboards (User, Accountant, Admin) with mock data
- ✅ Analytics Dashboard with charts and metrics (mock data)
- ✅ Admin pages (Users, UserDetails) with mock data and disclaimers
- ✅ Profile, Settings, MFA Setup pages using DashboardLayout
- ✅ Routing structure with React Router
- ✅ Form validation with real-time feedback
- ✅ Password strength indicators
- ✅ Eye toggle for password fields
- ✅ Toast notifications (Sonner) integration
- ✅ Responsive design (mobile-first approach)
- ✅ TypeScript strict mode
- ✅ ESLint configuration and passing lint checks
- ✅ **API Client**: Singleton with axios, request/response interceptors, error handling
- ✅ **Session Manager**: Login, logout, token refresh, user state management
- ✅ **Token Manager**: Secure storage with XSS protection
- ✅ **Route Guards**: Authentication and role-based protection
- ✅ **useAuth Hook**: React hook for authentication state and operations
- ✅ **Error Handling**: Typed error handling with field-specific error support

### 🚧 Ready for Backend Connection

All core infrastructure is implemented and ready:
- ✅ `src/api/client.ts` - API client with endpoints centralized
- ✅ `src/auth/sessionManager.ts` - Session management fully implemented
- ✅ `src/auth/tokenManager.ts` - Token storage fully implemented
- ✅ `src/routes/guards.tsx` - Route protection fully implemented
- ✅ `src/hooks/useAuth.ts` - Auth hook fully implemented
- ✅ All auth forms connected to backend API endpoints

### 📝 Development Notes

#### Form Validation

All forms use the singleton `ValidationManager` for consistent validation:
- Email validation
- Password strength validation (weak/medium/strong)
- Password match validation
- Name validation
- TOTP code validation
- Form-level validation

#### Toast Notifications

All notifications use Sonner with icons:
- Success (green with checkmark)
- Error (red with X)
- Warning (amber with triangle)
- Info (blue with info icon)

#### Password Fields

All password inputs include:
- Eye toggle to show/hide password
- Optional strength indicator
- Real-time validation feedback
- Error message display

#### Icons

All interactive elements use Lucide React icons:
- Buttons have contextual icons
- Input fields have left-side icons
- Navigation items have icons
- Status indicators use icons

#### Layout System

- **DashboardLayout**: Common layout component used by all dashboard-related pages
  - Manages sidebar state (mobile menu, collapse/expand)
  - Provides consistent structure across dashboards
  - Handles responsive behavior automatically
- **Sidebar**: Responsive navigation sidebar
  - Collapse/expand functionality with smooth animations
  - Mobile hamburger menu with full-viewport support
  - Tooltips for collapsed state
  - Role-based navigation items
  - User info and logout at bottom
- **Footer**: Redesigned responsive footer
  - Multi-column layout (1 column mobile, 2 tablet, 4 desktop)
  - Brand section, Quick Links, Legal, Contact sections
  - Responsive bottom bar with copyright

#### Mock Data & Disclaimers

All pages with mock/sample data include highlighted disclaimer banners:
- Yellow background with info icon
- Clear messaging that data is for demonstration purposes
- Applied to: Dashboards, Analytics, Admin Users, Admin User Details

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Authentication Template
VITE_ENVIRONMENT=development
```

## Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Code Quality

- ✅ TypeScript strict mode enabled
- ✅ ESLint configured with React and TypeScript rules
- ✅ All linting errors resolved
- ✅ Consistent code formatting
- ✅ Proper type definitions throughout

## Next Steps

1. ✅ **Backend Integration**: ✅ API client, session management, and token handling fully implemented
2. ✅ **Session Management**: ✅ Session manager with token handling fully implemented
3. ✅ **Route Guards**: ✅ Authentication checks in route guards fully implemented
4. ✅ **Common Layout**: ✅ DashboardLayout component implemented and used across all dashboard pages
5. ✅ **Responsive Sidebar**: ✅ Collapse/expand, mobile hamburger menu, tooltips implemented
6. ✅ **Footer Redesign**: ✅ Multi-column responsive footer implemented
7. ✅ **Analytics Dashboard**: ✅ Mock analytics dashboard with charts and metrics
8. ✅ **Mock Data Disclaimers**: ✅ All mock data pages include highlighted disclaimers
9. ✅ **MFA Pages**: ✅ MFA pages fully integrated with backend API endpoints
10. **Admin Pages**: Connect admin pages (UI complete with mock data) to backend API endpoints

## Backend Integration Status

### ✅ Fully Integrated
- Login form → `/api/v1/auth/login`
- Register form → `/api/v1/auth/register`
- Forgot Password → `/api/v1/auth/forgot-password`
- Reset Password → `/api/v1/auth/reset-password`
- Verify Email → `/api/v1/auth/verify-email`
- Change Password → `/api/v1/auth/change-password`
- Token Refresh → `/api/v1/auth/refresh`
- Logout → `/api/v1/auth/logout`
- Get Current User → `/api/v1/auth/me`
- MFA Setup → `/api/v1/auth/mfa/setup`
- MFA Verify Setup → `/api/v1/auth/mfa/verify-setup`
- MFA Verify Login → `/api/v1/auth/mfa/verify-login`
- MFA Login Complete → `/api/v1/auth/login/complete`



## License

MIT

---

**© <span id="copyright-year"></span> Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**

*All rights reserved.*

