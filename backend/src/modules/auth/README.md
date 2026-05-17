# Auth Module

## Purpose

Handles public authentication flows for BuzzMap:

- customer registration
- business-owner registration
- email/password login
- refresh-token exchange

The module also provides token-verification helpers consumed by shared auth middleware.

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Public auth routes, rate limiting, and explicit method restrictions |
| `controllers/authController.ts` | Request parsing, Zod validation, and standardized responses |
| `services/authService.ts` | Registration orchestration, credential verification, token issuance, and token verification |
| `models/index.ts` | Auth DTO and response types |
| `validators/index.ts` | Customer registration, business registration, login, and refresh validation |

## Routes

Mounted under `/api/v1/auth`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/register/customer` | Register a customer account | No |
| `POST` | `/register/business` | Register a business-owner account and business profile | No |
| `POST` | `/login` | Exchange email/password for access and refresh tokens | No |
| `POST` | `/refresh` | Exchange a refresh token for a rotated token pair | No |

All routes reject unsupported methods with explicit `405` responses through `methodNotAllowed(...)`.

## Rate Limiting

| Route Group | Limit |
|---|---|
| registration routes | `20` requests per `60` minutes |
| login and refresh | `10` requests per `15` minutes |

## Validation Rules

### Customer Registration

- `email`: valid email
- `password`: minimum `8` chars
- `name`: minimum `2` chars
- `phone`: optional
- `interests`: optional string array
- `location`: optional

### Business Registration

- customer owner fields above
- `businessName`: minimum `2` chars
- `description`: minimum `10` chars
- `category`: required
- `type`: `PRODUCTS` or `SERVICES`
- `location`: required
- `coordinates`: optional
- `contactInfo`: required
- `operatingHours`: required JSON object

### Login and Refresh

- login requires `email` and `password`
- refresh requires `refreshToken`

## Implementation Notes

- Customer registration delegates to `CustomerFactory`.
- Business registration delegates to `BusinessOwnerFactory`, which creates both the user and business profile transactionally.
- Successful registration and login both return a token pair.
- Refresh validates the submitted refresh token and issues a new access/refresh pair.
- `verifyAccessToken()` and `verifyRefreshToken()` are used by shared middleware and socket namespaces.

## Response Shape

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "CUSTOMER | BUSINESS_OWNER"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```
