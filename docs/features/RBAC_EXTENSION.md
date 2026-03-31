# RBAC Extension — BuzzMap

## Overview
BuzzMap implements Role-Based Access Control (RBAC) with three primary roles: CUSTOMER, BUSINESS_OWNER, and ADMIN. Each role has a defined set of permissions that control access to API endpoints and resources.

## Roles

### 1. CUSTOMER
Represents regular users who browse, follow businesses, and make purchases.

### 2. BUSINESS_OWNER
Represents users who own and manage businesses on the platform.

### 3. ADMIN
Represents platform administrators with full system access.

---

## Permissions Matrix

| Permission | CUSTOMER | BUSINESS_OWNER | ADMIN |
|------------|----------|----------------|-------|
| **User Management** ||||
| View own profile | ✓ | ✓ | ✓ |
| Update own profile | ✓ | ✓ | ✓ |
| View other users | - | - | ✓ |
| Update other users | - | - | ✓ |
| Delete users | - | - | ✓ |
| **Business Management** ||||
| List all businesses | ✓ | ✓ | ✓ |
| View business details | ✓ | ✓ | ✓ |
| Create business | - | ✓ | ✓ |
| Update own business | - | ✓ | ✓ |
| Delete own business | - | ✓ | ✓ |
| Update any business | - | - | ✓ |
| Verify business | - | - | ✓ |
| **Product Management** ||||
| List products | ✓ | ✓ | ✓ |
| View product details | ✓ | ✓ | ✓ |
| Create product | - | ✓ (own business) | ✓ |
| Update product | - | ✓ (own business) | ✓ |
| Delete product | - | ✓ (own business) | ✓ |
| **POV Management** ||||
| List POVs | ✓ | ✓ | ✓ |
| View POV details | ✓ | ✓ | ✓ |
| Create POV | - | ✓ (own business) | ✓ |
| Update POV | - | ✓ (own business) | ✓ |
| Delete POV | - | ✓ (own business) | ✓ |
| **Order Management** ||||
| List own orders | ✓ | ✓ | ✓ |
| View own order details | ✓ | ✓ | ✓ |
| Create order | ✓ | - | ✓ |
| Update own order | - | ✓ (own orders) | ✓ |
| Cancel own order | ✓ | ✓ (own orders) | ✓ |
| List all orders | - | ✓ (own business) | ✓ |
| **Payment Management** ||||
| View own payments | ✓ | ✓ | ✓ |
| Process payment | ✓ | - | ✓ |
| Refund payment | - | - | ✓ |
| **Messaging** ||||
| Send message | ✓ | ✓ | ✓ |
| View own conversations | ✓ | ✓ | ✓ |
| View all conversations | - | - | ✓ |
| **Follow System** ||||
| Follow user/business | ✓ | ✓ | ✓ |
| Unfollow | ✓ | ✓ | ✓ |
| View followers | ✓ | ✓ | ✓ |
| **Notifications** ||||
| View own notifications | ✓ | ✓ | ✓ |
| Mark as read | ✓ | ✓ | ✓ |
| Mark all as read | ✓ | ✓ | ✓ |
| Send notification | - | - | ✓ |
| **Comments & Likes** ||||
| Add comment | ✓ | ✓ | ✓ |
| Edit own comment | ✓ | ✓ | ✓ |
| Delete own comment | ✓ | ✓ | ✓ |
| Delete any comment | - | - | ✓ |
| Like content | ✓ | ✓ | ✓ |
| Unlike | ✓ | ✓ | ✓ |
| **Ads Management** ||||
| List ads | ✓ | ✓ | ✓ |
| Create ad | - | ✓ | ✓ |
| Update own ad | - | ✓ | ✓ |
| Delete own ad | - | ✓ | ✓ |
| Pause/activate any ad | - | - | ✓ |
| **Analytics** ||||
| View own analytics | - | ✓ | ✓ |
| View business analytics | - | ✓ (own) | ✓ |
| View platform analytics | - | - | ✓ |
| **Admin Panel** ||||
| Access admin dashboard | - | - | ✓ |
| Manage roles | - | - | ✓ |
| System configuration | - | - | ✓ |

---

## API Authorization

Authorization is implemented using JWT tokens with role claims. The backend middleware checks permissions before processing requests.

### Example: Middleware Check

```typescript
// Role-based middleware example
function requirePermission(permission: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### Endpoint Protection

Routes are protected using the following pattern:

```typescript
// Customer only
router.get('/profile', authenticate, requireRole('CUSTOMER'));

// Business owner only
router.post('/products', authenticate, requireRole('BUSINESS_OWNER'));

// Admin only
router.delete('/users/:id', authenticate, requireRole('ADMIN'));

// Multiple roles
router.put('/business/:id', authenticate, requireRoles(['BUSINESS_OWNER', 'ADMIN']));
```

---

## Role Escalation

- Users cannot change their own role
- Only ADMIN can assign or change roles
- Role changes are logged in the audit trail

---

## Future Extensions

The RBAC system is designed to be extensible:
- Add new roles (e.g., MODERATOR)
- Add granular permissions within roles
- Create permission groups for easier management
- Implement resource-level permissions (e.g., can edit specific business)