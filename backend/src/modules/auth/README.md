# Auth Module

## Module Objective

The Auth module handles user authentication for BuzzMap, providing dual registration flows (Customer and Business Owner), login with credential verification, and JWT-based token issuance. It serves as the entry point for identity management, delegating user creation to shared Factory classes and producing access/refresh token pairs for authenticated sessions.

## Architecture

This module follows the **MVCS (Model-Validator-Controller-Service)** pattern:

```
routes.ts                  --> Express route definitions
controllers/authController --> Request parsing, validation, response formatting
services/authService       --> Business logic (registration, login, token management)
models/index               --> TypeScript DTOs and response interfaces
validators/index           --> Zod schemas for request validation
```

The flow for every request is:

```
Route --> Controller --> Validator (Zod) --> Service --> Factory / Prisma --> Response
```

Controllers never access the database directly. All persistence and business logic lives in the service layer, which in turn delegates user creation to shared Factory classes.

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Defines three public POST endpoints and wires them to controller methods. |
| `controllers/authController.ts` | Parses and validates incoming request bodies via Zod schemas, calls `authService`, and returns standardised JSON responses. |
| `services/authService.ts` | Core business logic: orchestrates registration (via Factories), login (credential verification via bcrypt), JWT generation, and token verification. Exports `verifyAccessToken` and `verifyRefreshToken` consumed by shared middleware. |
| `models/index.ts` | TypeScript interfaces for DTOs (`RegisterCustomerDTO`, `RegisterBusinessDTO`, `LoginDTO`) and the `AuthResponse` shape returned on successful auth. |
| `validators/index.ts` | Zod schemas (`registerCustomerSchema`, `registerBusinessSchema`, `loginSchema`) that enforce request payload structure and constraints. |

## API Routes

All routes are mounted under the module's base path (e.g. `/api/v1/auth`).

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/register/customer` | Register a new Customer account. Creates a `User` record with the `CUSTOMER` role. | No |
| `POST` | `/register/business` | Register a new Business Owner account. Creates a `User` record with the `BUSINESS_OWNER` role and an associated `BusinessProfile` within a database transaction. | No |
| `POST` | `/login` | Authenticate with email and password. Returns user info and token pair. | No |

### Request / Response Shapes

**POST /register/customer**

```jsonc
// Request
{
  "email": "user@example.com",       // required, valid email
  "password": "securepass",          // required, min 8 chars
  "name": "Jane Doe",               // required, min 2 chars
  "phone": "+254700000000",          // optional
  "interests": ["food", "events"],   // optional, string array
  "location": "Nairobi"             // optional
}
```

**POST /register/business**

```jsonc
// Request
{
  "email": "owner@biz.com",          // required, valid email
  "password": "securepass",          // required, min 8 chars
  "name": "John Doe",               // required, min 2 chars
  "businessName": "Doe Cafe",       // required, min 2 chars
  "description": "A cozy cafe...",  // required, min 10 chars
  "category": "Food & Beverage",    // required
  "type": "PRODUCTS",               // required, "PRODUCTS" | "SERVICES"
  "location": "Westlands, Nairobi", // required
  "coordinates": "-1.27,36.81",     // optional
  "contactInfo": "+254711222333",   // required
  "operatingHours": { "mon": "8am-5pm" }, // required, JSON object
  "phone": "+254700000000"          // optional
}
```

**POST /login**

```jsonc
// Request
{
  "email": "user@example.com",  // required, valid email
  "password": "securepass"      // required, min 1 char
}
```

**Successful Auth Response (all three endpoints)**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

## Key Logic

### Registration Flows

Registration is handled through a single overloaded `authService.register()` method that discriminates on a `type` parameter:

- **Customer flow** (`type: 'customer'`): Delegates to `CustomerFactory.create()`, which hashes the password with bcrypt and creates a single `User` record with role `CUSTOMER`.
- **Business Owner flow** (`type: 'business'`): Delegates to `BusinessOwnerFactory.create()`, which hashes the password and runs a **Prisma `$transaction`** to atomically create both a `User` (role `BUSINESS_OWNER`) and a linked `BusinessProfile`.

Both flows return a consistent `AuthResponse` containing user info and a freshly generated token pair.

### JWT Token Handling

- **Dual-token strategy**: Every successful authentication (register or login) issues both an `accessToken` and a `refreshToken`, each signed with a distinct secret from the app config.
- **`generateTokens(userId, role)`**: Internal helper that signs JwtPayload (`{ userId, role }`) with configurable expiry durations.
- **`verifyAccessToken(token)`** and **`verifyRefreshToken(token)`**: Verify and decode tokens, throwing a 401 `AppError` on failure. These are consumed by the shared `authenticate` middleware.

### Factory Pattern

User creation is abstracted behind static Factory classes in `shared/factories/`:

- **`CustomerFactory.create()`** -- straightforward single-record insert.
- **`BusinessOwnerFactory.create()`** -- transactional multi-record insert (`User` + `BusinessProfile`), ensuring data consistency.

Both factories handle password hashing internally, keeping that concern out of the service layer.

### Validation

All request bodies are validated at the controller level using Zod schemas before any business logic executes. Invalid payloads result in a Zod validation error passed to the global error handler via `next(err)`.

### Middleware Integration

While the auth module's own routes are all public (no auth required), the module's service layer powers two shared middleware functions used across the application:

- **`authenticate`** (`shared/middleware/auth.ts`): Extracts the Bearer token from the `Authorization` header, calls `authService.verifyAccessToken()`, and attaches `{ userId, role }` to `req.user`.
- **`authorize(...roles)`** (`shared/middleware/authorize.ts`): Checks `req.user.role` against an allowed list and rejects with 403 if unauthorised.

## Dependencies

| Dependency | Usage |
|-----------|-------|
| `express` | Route and middleware types |
| `bcrypt` | Password hashing and comparison |
| `jsonwebtoken` | JWT signing and verification |
| `zod` | Request body validation |
| `@prisma/client` | Database access and type definitions |

## Related Shared Files

| File | Relationship |
|------|-------------|
| `shared/factories/CustomerFactory.ts` | Creates `User` records with the `CUSTOMER` role. Called by `authService.register('customer', ...)`. |
| `shared/factories/BusinessOwnerFactory.ts` | Creates `User` + `BusinessProfile` records transactionally. Called by `authService.register('business', ...)`. |
| `shared/middleware/auth.ts` | The `authenticate` middleware consumes `authService.verifyAccessToken()` to protect routes across the app. |
| `shared/middleware/authorize.ts` | The `authorize` middleware performs role-based access control using the `req.user.role` set by `authenticate`. |
| `shared/middleware/errorHandler.ts` | Provides the `AppError` class used by the service layer to throw typed HTTP errors (401, 403, etc.). |
| `shared/prisma/index.ts` | Exports `getPrisma()` used by the service and factories for database access. |
| `config/index.ts` | Supplies JWT secrets, expiry durations, and bcrypt salt rounds via `config`. |
