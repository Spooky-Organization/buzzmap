# Dual Registration — BuzzMap

## Overview
BuzzMap supports two distinct registration flows: customer registration and business registration. This allows the platform to serve both individual consumers and business owners.

## Registration Endpoints

### 1. Customer Registration

**Endpoint:** `POST /api/v1/auth/register/customer`

**Description:** Register a new customer account

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "phone": "string (optional)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "interests": ["string (optional, array of interest IDs)"]
}
```

**Validation Rules:**
- Email must be unique across all users
- Password minimum 8 characters
- First name and last name required
- Interests must be valid interest IDs (optional)

**Response (201 Created):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

**Error Responses:**
- 400: Validation error (invalid email format, weak password, etc.)
- 409: Email already exists

---

### 2. Business Registration

**Endpoint:** `POST /api/v1/auth/register/business`

**Description:** Register a new business owner account with business details

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "phone": "string (optional)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "business": {
    "name": "string (required)",
    "description": "string (optional)",
    "category": "string (required)",
    "website": "string (optional, valid URL)",
    "address": "string (optional)",
    "city": "string (optional)",
    "country": "string (optional)"
  }
}
```

**Validation Rules:**
- All owner fields same as customer registration
- Business name required
- Business category required
- Website must be valid URL if provided

**Response (201 Created):**

```json
{
  "user": {
    "id": "uuid",
    "email": "owner@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "BUSINESS_OWNER",
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "business": {
    "id": "uuid",
    "name": "Example Business",
    "slug": "example-business",
    "category": "RETAIL",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

**Error Responses:**
- 400: Validation error
- 409: Email already exists

---

## Authentication Flow

After successful registration, both endpoints return:
1. **accessToken**: JWT token for API authentication (expires in 15 minutes)
2. **refreshToken**: Token for obtaining new access tokens (expires in 7 days)

Use the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

To refresh the access token:
```
POST /api/v1/auth/refresh
{
  "refreshToken": "token"
}
```

---

## Role Assignment

- Customer registration creates user with `CUSTOMER` role
- Business registration creates user with `BUSINESS_OWNER` role and automatically creates their first business

---

## Security Considerations

1. Passwords are hashed using bcrypt with cost factor 12
2. JWT tokens include user ID, email, and role claims
3. Refresh tokens are stored in database and can be revoked
4. Rate limiting applies to registration endpoints to prevent abuse