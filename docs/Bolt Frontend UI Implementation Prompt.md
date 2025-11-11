# Frontend UI/UX Implementation Prompt for Bolt

## Project Overview

You are tasked with creating a stunning, modern, production-ready frontend UI/UX for an Authentication Template application. This is a **UI/UX ONLY** implementation - NO backend integration, NO API calls, NO data processing. Focus entirely on creating beautiful, accessible, and user-friendly interfaces.

## Project Structure

Create all files within a `frontend/` folder at the root level:

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       │   ├── logo.svg (or logo.png)
│       │   ├── auth-hero.svg (authentication illustration)
│       │   └── background-pattern.svg (optional decorative element)
│       └── icons/ (if using custom icons)
│
├── src/
│   ├── api/
│   │   ├── client.ts              # PLACEHOLDER - Empty singleton structure only
│   │   ├── endpoints.ts           # PLACEHOLDER - Endpoint constants only
│   │   └── types.ts               # PLACEHOLDER - Type definitions only
│   │
│   ├── auth/
│   │   ├── sessionManager.ts      # PLACEHOLDER - Empty singleton structure only
│   │   ├── tokenManager.ts        # PLACEHOLDER - Empty singleton structure only
│   │   └── authContext.tsx        # PLACEHOLDER - Empty context provider only
│   │
│   ├── routes/
│   │   ├── router.tsx             # PLACEHOLDER - Empty router structure only
│   │   ├── routes.tsx              # Route definitions (UI components only)
│   │   └── guards.tsx             # PLACEHOLDER - Empty guard components only
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx          # FULL UI IMPLEMENTATION
│   │   │   ├── Register.tsx       # FULL UI IMPLEMENTATION
│   │   │   ├── ForgotPassword.tsx # FULL UI IMPLEMENTATION
│   │   │   ├── ResetPassword.tsx  # FULL UI IMPLEMENTATION
│   │   │   ├── VerifyEmail.tsx    # FULL UI IMPLEMENTATION
│   │   │   └── ChangePassword.tsx # FULL UI IMPLEMENTATION
│   │   ├── mfa/
│   │   │   ├── MFASetup.tsx       # FULL UI IMPLEMENTATION
│   │   │   ├── MFAVerify.tsx      # FULL UI IMPLEMENTATION
│   │   │   └── MFALogin.tsx       # FULL UI IMPLEMENTATION
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx      # FULL UI IMPLEMENTATION
│   │   ├── profile/
│   │   │   └── Profile.tsx        # FULL UI IMPLEMENTATION
│   │   ├── admin/
│   │   │   ├── Users.tsx          # FULL UI IMPLEMENTATION
│   │   │   └── UserDetails.tsx    # FULL UI IMPLEMENTATION
│   │   └── NotFound.tsx           # FULL UI IMPLEMENTATION
│   │
│   ├── components/
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx      # Reusable form component
│   │   │   ├── RegisterForm.tsx   # Reusable form component
│   │   │   ├── PasswordResetForm.tsx # Reusable form component
│   │   │   └── MFAForm.tsx        # Reusable MFA input component
│   │   ├── ui/
│   │   │   ├── Button.tsx         # Button with icon support
│   │   │   ├── Input.tsx         # Input with icon support
│   │   │   ├── Card.tsx          # Card component
│   │   │   ├── PasswordInput.tsx  # Password input with eye toggle
│   │   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   │   └── ErrorMessage.tsx   # Error display component
│   │   ├── layout/
│   │   │   ├── Header.tsx        # App header/navigation
│   │   │   ├── Sidebar.tsx       # Sidebar navigation (for dashboard/admin)
│   │   │   └── Footer.tsx        # Footer component
│   │   └── protected/
│   │       └── ProtectedComponent.tsx # PLACEHOLDER only
│   │
│   ├── utils/
│   │   ├── security.ts            # PLACEHOLDER - Structure only
│   │   ├── validation.ts          # SINGLETON - Form validation logic
│   │   └── constants.ts          # Constants and configuration
│   │
│   ├── hooks/
│   │   ├── useAuth.ts            # PLACEHOLDER - Empty hook structure
│   │   └── useApi.ts             # PLACEHOLDER - Empty hook structure
│   │
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   └── theme.css             # Theme variables
│   │
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
│
├── .env.example
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── postcss.config.js
└── README.md
```

## Technology Stack

### Required Dependencies
- **React 18+** with TypeScript
- **React Router v6** (for routing structure - no actual navigation logic)
- **Vite** as build tool
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Zod** for validation schemas
- **Sonner** for toast notifications
- **Lucide React** or **React Icons** for icons
- **@headlessui/react** (optional, for accessible components)

### UI Component Library
Use **shadcn/ui** components as base, or create custom components with similar quality.

## Design Theme & Guidelines

### Color Palette
Create a modern, professional color scheme:
- **Primary**: Deep blue or indigo (#3B82F6 or #6366F1)
- **Secondary**: Complementary accent color
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Amber (#F59E0B)
- **Background**: Light gray/white for light mode, dark slate for dark mode
- **Text**: High contrast for accessibility

### Typography
- **Headings**: Bold, modern sans-serif (Inter, Poppins, or similar)
- **Body**: Clean, readable sans-serif
- **Code/Monospace**: For technical displays

### Spacing & Layout
- Use consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Maximum content width: 1200px for desktop
- Responsive breakpoints: mobile (640px), tablet (768px), desktop (1024px), large (1280px)

### Visual Elements
- **Icons**: Use Lucide React or React Icons throughout
  - Every button must have a relevant icon
  - Every input field must have a contextual icon
  - Navigation items must have icons
  - Status indicators must use icons
- **Images**: Include placeholder/auth illustrations where appropriate
- **Animations**: Subtle transitions and micro-interactions
- **Shadows**: Soft, modern shadows for depth
- **Borders**: Subtle, rounded corners (8px-12px radius)

## Component Requirements

### 1. Input Components

**PasswordInput Component** (Required):
- Eye icon toggle (show/hide password)
- Icon on the left side of input
- Eye icon on the right side (toggleable)
- Error state styling
- Success state styling
- Loading state (optional)

**Regular Input Component**:
- Left-side icon (contextual: email icon, user icon, etc.)
- Error message display below
- Focus states with subtle animations
- Placeholder text

### 2. Button Components

- **Primary Button**: Solid background, white text, icon on left
- **Secondary Button**: Outlined, icon on left
- **Ghost Button**: Transparent, icon on left
- **Danger Button**: Red variant for destructive actions
- **Loading State**: Show spinner icon when loading
- **Disabled State**: Proper disabled styling

### 3. Form Validation (Singleton)

Create `src/utils/validation.ts` as a singleton with:
- Email validation
- Password strength validation (8+ chars, uppercase, lowercase, number)
- Name validation
- TOTP code validation (6 digits)
- Form field validation functions
- Error message generators

**Example Structure:**
```typescript
class ValidationManager {
  private static instance: ValidationManager;
  
  public static getInstance(): ValidationManager {
    if (!ValidationManager.instance) {
      ValidationManager.instance = new ValidationManager();
    }
    return ValidationManager.instance;
  }
  
  validateEmail(email: string): { valid: boolean; error?: string }
  validatePassword(password: string): { valid: boolean; errors: string[] }
  // ... other validation methods
}
```

### 4. Toast Notifications (Sonner)

- Use Sonner for all notifications
- Success toasts: Green, checkmark icon
- Error toasts: Red, X icon
- Warning toasts: Amber, warning icon
- Info toasts: Blue, info icon
- Position: Top-right or top-center
- Auto-dismiss after 3-5 seconds

## Page-Specific Requirements

### Authentication Pages

#### 1. Login Page (`/login`)
**Visual Requirements:**
- Split-screen layout OR centered card layout
- Left side: Branding, illustration, welcome message (if split-screen)
- Right side: Login form in elegant card
- Form fields:
  - Email input with email icon
  - Password input with lock icon + eye toggle
- "Remember me" checkbox with checkmark icon
- "Forgot password?" link with key icon
- "Don't have an account? Register" link with user-plus icon
- Submit button with login icon
- Social login buttons (optional, visual only - no functionality)
- Error messages displayed using Sonner toasts
- Loading state on submit button

#### 2. Register Page (`/register`)
**Visual Requirements:**
- Similar layout to login
- Form fields:
  - First Name input with user icon
  - Last Name input with user icon
  - Email input with email icon
  - Password input with lock icon + eye toggle + strength indicator
  - Confirm Password input with lock icon + eye toggle
- Password strength indicator (visual bar: weak/medium/strong)
- Terms & Conditions checkbox with document icon
- Submit button with user-plus icon
- "Already have an account? Login" link with log-in icon
- Success message area for email verification notice

#### 3. Forgot Password Page (`/forgot-password`)
**Visual Requirements:**
- Centered card layout
- Email input with email icon
- Submit button with mail icon
- Success state: Show checkmark icon, success message
- "Back to login" link with arrow-left icon

#### 4. Reset Password Page (`/reset-password`)
**Visual Requirements:**
- Centered card layout
- Token input (if needed) with key icon
- New Password input with lock icon + eye toggle
- Confirm Password input with lock icon + eye toggle
- Password strength indicator
- Submit button with check-circle icon
- Success/error states

#### 5. Verify Email Page (`/verify-email`)
**Visual Requirements:**
- Centered card layout
- Token input with mail-check icon
- Submit button with verify icon
- Success state: Celebration animation/icon
- Error state: Clear error message

#### 6. Change Password Page (`/change-password`)
**Visual Requirements:**
- Protected page layout (with sidebar/header)
- Current Password input with lock icon + eye toggle
- New Password input with lock icon + eye toggle + strength indicator
- Confirm Password input with lock icon + eye toggle
- Submit button with save icon
- Cancel button with X icon

### MFA Pages

#### 1. MFA Setup Page (`/mfa/setup`)
**Visual Requirements:**
- Step-by-step wizard UI
- Step 1: QR Code display
  - Large QR code image/placeholder
  - "Scan with authenticator app" text with qr-code icon
  - Manual entry option (expandable section) with key icon
- Step 2: Verification
  - TOTP code input (6 digits, separate input boxes) with shield icon
  - Verify button with check-circle icon
- Progress indicator showing steps
- Success state: Show backup codes in styled box with download icon

#### 2. MFA Verify Page (`/mfa/verify`)
**Visual Requirements:**
- Centered card
- TOTP code input (6 digits) with shield-check icon
- "Use backup code instead" toggle/link with key icon
- Backup code input (when toggled) with key icon
- Verify button with check-circle icon

#### 3. MFA Login Page (`/mfa/login`)
**Visual Requirements:**
- Similar to MFA Verify
- Email display (read-only) with mail icon
- TOTP code input with shield-check icon
- Backup code option with key icon
- Submit button with log-in icon
- "Back to login" link

### Dashboard & Profile

#### 1. Dashboard Page (`/`)
**Visual Requirements:**
- Header with user info, notifications icon, logout button
- Sidebar navigation (if applicable)
- Welcome section with user's name
- Stats cards (placeholder data):
  - Total logins (with log-in icon)
  - Account status (with check-circle icon)
  - Last login (with clock icon)
- Recent activity section (placeholder list)
- Quick actions cards with icons

#### 2. Profile Page (`/profile`)
**Visual Requirements:**
- Header with profile picture placeholder (user-circle icon)
- Tabs or sections:
  - Personal Information (edit icon)
    - First Name, Last Name, Email (read-only with edit button)
    - Save/Cancel buttons
  - Security (shield icon)
    - MFA status card (enabled/disabled with toggle visual)
    - Change password link (with lock icon)
  - Account Settings (settings icon)
    - Email verification status (with mail-check icon)
    - Account creation date

### Admin Pages

#### 1. Users List Page (`/admin/users`)
**Visual Requirements:**
- Admin header with admin badge icon
- Search bar with search icon
- Filter dropdowns with filter icon:
  - Role filter (USER, ACCOUNTANT, ADMIN)
  - Status filter (Verified, Unverified)
- User table with:
  - Avatar placeholders (user-circle icons)
  - Name, Email, Role badges, Status badges
  - Actions column: Edit icon, Delete icon, View icon
- Pagination controls with arrow icons
- "Add User" button (optional, visual only) with user-plus icon
- Empty state with user-x icon when no users

#### 2. User Details Page (`/admin/users/:id`)
**Visual Requirements:**
- Breadcrumb navigation with home and users icons
- User info card:
  - Large avatar placeholder
  - Name, Email, Role badge
  - Status indicators with icons
- Edit form section:
  - First Name, Last Name, Email inputs with icons
  - Role selector dropdown with user-cog icon
  - Save/Cancel buttons
- Actions section:
  - "Resend Verification Email" button with mail icon
  - "Reset Password" button with key icon
  - "Delete User" button (danger style) with trash icon
- Activity log section (placeholder) with clock icon

### NotFound Page (`/404`)
**Visual Requirements:**
- Centered layout
- Large 404 illustration or icon
- "Page not found" message
- "Go home" button with home icon
- Friendly, helpful design

## UI/UX Design Principles

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators on all interactive elements

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly targets (min 44x44px)
- Responsive typography
- Collapsible navigation on mobile

### Micro-interactions
- Button hover effects
- Input focus animations
- Form validation feedback
- Loading states with spinners
- Success/error state animations
- Smooth page transitions

### Visual Hierarchy
- Clear heading structure
- Proper spacing between sections
- Visual grouping of related elements
- Color coding for status (success, error, warning)
- Icon usage for quick visual recognition

## Form Validation Requirements

### Validation Singleton (`src/utils/validation.ts`)

Implement a singleton validation manager with:

```typescript
class ValidationManager {
  private static instance: ValidationManager;
  
  // Email validation
  validateEmail(email: string): { valid: boolean; error?: string }
  
  // Password validation
  validatePassword(password: string): { 
    valid: boolean; 
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  }
  
  // Password confirmation
  validatePasswordMatch(password: string, confirmPassword: string): { 
    valid: boolean; 
    error?: string 
  }
  
  // Name validation
  validateName(name: string): { valid: boolean; error?: string }
  
  // TOTP code validation
  validateTOTP(code: string): { valid: boolean; error?: string }
  
  // Backup code validation
  validateBackupCode(code: string): { valid: boolean; error?: string }
  
  // Form-level validation
  validateLoginForm(email: string, password: string): ValidationResult
  validateRegisterForm(data: RegisterData): ValidationResult
  // ... other form validations
}
```

### Real-time Validation
- Validate on blur (when user leaves field)
- Show error messages below inputs
- Show success checkmark when valid
- Disable submit button until form is valid
- Display validation errors using Sonner toasts on submit attempt

## Icon Usage Guidelines

### Required Icons for Each Component

**Authentication:**
- Login: `LogIn` icon
- Register: `UserPlus` icon
- Email: `Mail` icon
- Password: `Lock` icon
- Eye (show): `Eye` icon
- Eye (hide): `EyeOff` icon
- Forgot Password: `Key` icon
- Verify: `MailCheck` icon

**MFA:**
- MFA Setup: `Shield` icon
- QR Code: `QrCode` icon
- TOTP: `ShieldCheck` icon
- Backup Code: `Key` icon

**Navigation:**
- Home: `Home` icon
- Dashboard: `LayoutDashboard` icon
- Profile: `User` icon
- Settings: `Settings` icon
- Logout: `LogOut` icon
- Admin: `Shield` or `UserCog` icon

**Actions:**
- Save: `Save` icon
- Edit: `Edit` icon
- Delete: `Trash2` icon
- Cancel: `X` icon
- Search: `Search` icon
- Filter: `Filter` icon

**Status:**
- Success: `CheckCircle` icon
- Error: `XCircle` icon
- Warning: `AlertTriangle` icon
- Info: `Info` icon
- Loading: `Loader2` icon (animated)

## Toast Notification Implementation

Use Sonner with these configurations:

```typescript
import { toast } from 'sonner';

// Success
toast.success('Operation successful', {
  icon: <CheckCircle className="h-5 w-5" />,
});

// Error
toast.error('Operation failed', {
  icon: <XCircle className="h-5 w-5" />,
});

// Warning
toast.warning('Please check your input', {
  icon: <AlertTriangle className="h-5 w-5" />,
});

// Info
toast.info('Information message', {
  icon: <Info className="h-5 w-5" />,
});
```

## Implementation Rules

### DO:
✅ Create beautiful, modern UI components
✅ Use icons extensively (Lucide React recommended)
✅ Implement password eye toggle functionality
✅ Create singleton validation manager
✅ Use Sonner for all toast notifications
✅ Make all forms visually appealing with proper spacing
✅ Add loading states to buttons
✅ Create responsive layouts
✅ Use placeholder data for all content
✅ Implement error states visually
✅ Add hover and focus states
✅ Create reusable component library
✅ Use Tailwind CSS for all styling
✅ Follow the exact directory structure provided

### DON'T:
❌ Make any API calls
❌ Implement actual authentication logic
❌ Connect to backend
❌ Process real data
❌ Implement actual routing logic (just structure)
❌ Add real form submission handlers
❌ Create actual session management
❌ Implement real token storage
❌ Add backend integration code

## Placeholder Data

Use realistic placeholder data:
- User names: "John Doe", "Jane Smith", etc.
- Emails: "user@example.com", "admin@example.com"
- Dates: Use relative dates ("2 days ago", "Last week")
- Status: Mix of verified/unverified, active/inactive
- Roles: Mix of USER, ACCOUNTANT, ADMIN

## Code Quality Standards

- TypeScript strict mode
- Proper component prop types
- Reusable components
- Clean, readable code
- Consistent naming conventions
- Proper file organization
- Comments for complex logic
- No console.logs in production code
- Proper error boundaries (visual only)

## Deliverables

1. Complete `frontend/` folder with all files
2. All pages fully styled and functional (UI only)
3. All components with icons and proper styling
4. Form validation singleton implemented
5. Toast notifications integrated (Sonner)
6. Responsive design for all pages
7. Accessible components
8. Package.json with all dependencies
9. Working build configuration (Vite)
10. README.md with setup instructions

## Example Component Structure

### PasswordInput Component Example

```typescript
// src/components/ui/PasswordInput.tsx
import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  showStrengthIndicator?: boolean;
}

export const PasswordInput = ({
  label,
  value,
  onChange,
  error,
  placeholder = "Enter password",
  showStrengthIndicator = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 ..."
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {showStrengthIndicator && <PasswordStrengthIndicator password={value} />}
    </div>
  );
};
```

## Final Notes

- Focus on creating a **stunning, professional UI/UX**
- Every interactive element should have visual feedback
- Use modern design trends (glassmorphism, subtle gradients, soft shadows)
- Ensure the UI looks production-ready and polished
- All placeholder components should be structured correctly for future integration
- The validation singleton should be fully functional (client-side only)
- Forms should feel responsive and provide excellent user feedback

**Remember**: This is UI/UX ONLY. Create beautiful interfaces that will later be connected to the backend. Make it visually impressive and user-friendly!

