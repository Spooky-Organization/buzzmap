# Authentication API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## API Versioning

This API uses versioned endpoints to ensure backward compatibility and smooth feature evolution:

- **Current Version**: v1
- **Version Format**: `/api/v1/{endpoint}`
- **Future Versions**: v2, v3, etc. will be available as `/api/v2/{endpoint}`

### Version Strategy
- **v1**: Current stable implementation with all core features
- **v2+**: Future versions with enhanced features and improvements
- **Backward Compatibility**: Each version maintains its own stability

### API Versioning Best Practices

#### Version Selection
- **Always specify version** in API calls: `/api/v1/auth/login`
- **Default to latest stable version** for new integrations
- **Plan migration strategy** when upgrading between versions

#### Version Lifecycle
- **Active Support**: Current version receives updates and bug fixes
- **Maintenance Mode**: Previous versions receive security updates only
- **Deprecation Notice**: 6 months advance notice before version removal
- **End of Life**: Version no longer supported or accessible

#### Migration Guidelines
- **Test thoroughly** before upgrading to new versions
- **Review changelog** for breaking changes
- **Update client libraries** to support new version
- **Monitor deprecation warnings** in API responses

#### Version Headers (Optional)
You can also specify API version using headers:
```
Accept: application/vnd.api.v1+json
API-Version: v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Health Check

- **GET** `/api/health`
- **Description**: Check API status
- **Note**: Health endpoint is not versioned (standard practice)
- **Response**: API status and environment info

### Authentication Routes (`/api/v1/auth`)

#### Register User

- **POST** `/api/v1/auth/register`
- **Description**: Register a new user account
- **Rate Limit**: 5 attempts per 15 minutes
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully. Please check your email to verify your account.",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
  ```

#### Login User

- **POST** `/api/v1/auth/login`
- **Description**: Authenticate user and get tokens
- **Rate Limit**: 5 attempts per 15 minutes
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
  ```

#### Verify Email

- **POST** `/api/v1/auth/verify-email`
- **Description**: Verify email address with token
- **Rate Limit**: 10 attempts per hour
- **Body**:
  ```json
  {
    "token": "verification_token"
  }
  ```

#### Forgot Password

- **POST** `/api/v1/auth/forgot-password`
- **Description**: Request password reset email
- **Rate Limit**: 3 attempts per hour
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Reset Password

- **POST** `/api/v1/auth/reset-password`
- **Description**: Reset password with token
- **Rate Limit**: 3 attempts per hour
- **Body**:
  ```json
  {
    "token": "reset_token",
    "password": "NewSecurePass123"
  }
  ```

#### Refresh Token

- **POST** `/api/v1/auth/refresh`
- **Description**: Get new access token using refresh token
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token"
  }
  ```

#### Logout

- **POST** `/api/v1/auth/logout`
- **Description**: Invalidate refresh token
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token"
  }
  ```

#### Get Profile (Protected)

- **GET** `/api/v1/auth/me`
- **Description**: Get current user profile
- **Authentication**: Required
- **Response**:
  ```json
  {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

#### Change Password (Protected)

- **POST** `/api/v1/auth/change-password`
- **Description**: Change user password
- **Authentication**: Required
- **Body**:
  ```json
  {
    "currentPassword": "OldSecurePass123",
    "newPassword": "NewSecurePass123"
  }
  ```

### Multi-Factor Authentication Routes (`/api/v1/auth/mfa`)

All MFA routes require authentication unless otherwise specified.

#### Setup MFA

- **POST** `/api/v1/auth/mfa/setup`
- **Description**: Initiate MFA setup process
- **Authentication**: Required
- **Rate Limit**: 5 attempts per 15 minutes
- **Response**:
  ```json
  {
    "message": "MFA setup initiated",
    "secret": "JBSWY3DPEHPK3PXP",
    "userEmail": "user@example.com",
    "setupComplete": false,
    "qrCodeEndpoint": "/api/v1/auth/mfa/qr/JBSWY3DPEHPK3PXP/user%40example.com"
  }
  ```

#### Verify MFA Setup

- **POST** `/api/v1/auth/mfa/verify-setup`
- **Description**: Verify MFA setup with TOTP code
- **Authentication**: Required
- **Rate Limit**: 5 attempts per 15 minutes
- **Body**:
  ```json
  {
    "token": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "message": "MFA enabled successfully",
    "backupCodes": "1. ABC12345\n2. DEF67890\n3. GHI13579\n4. JKL24680\n5. MNO97531",
    "setupComplete": true
  }
  ```

#### Verify MFA During Login

- **POST** `/api/v1/auth/mfa/verify-login`
- **Description**: Verify MFA code during login process
- **Authentication**: Not required (public endpoint)
- **Rate Limit**: 5 attempts per 15 minutes
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "token": "123456"
  }
  ```
  OR
  ```json
  {
    "email": "user@example.com",
    "backupCode": "ABC12345"
  }
  ```
- **Response**:
  ```json
  {
    "message": "MFA verification successful",
    "mfaVerified": true
  }
  ```

#### Complete Login After MFA

- **POST** `/api/v1/auth/login/complete`
- **Description**: Complete login process after MFA verification
- **Authentication**: Not required (public endpoint)
- **Rate Limit**: 5 attempts per 15 minutes
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login completed successfully",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
  ```

#### Disable MFA

- **POST** `/api/v1/auth/mfa/disable`
- **Description**: Disable MFA for user account
- **Authentication**: Required
- **Body**:
  ```json
  {
    "password": "userPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "MFA disabled successfully"
  }
  ```

#### Generate New Backup Codes

- **POST** `/api/v1/auth/mfa/backup-codes`
- **Description**: Generate new backup codes (invalidates old ones)
- **Authentication**: Required
- **Body**:
  ```json
  {
    "password": "userPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "New backup codes generated successfully",
    "backupCodes": "1. NEW12345\n2. NEW67890\n3. NEW13579\n4. NEW24680\n5. NEW97531"
  }
  ```

#### Get MFA Status

- **GET** `/api/v1/auth/mfa/status`
- **Description**: Get MFA status and backup codes count
- **Authentication**: Required
- **Response**:
  ```json
  {
    "mfaEnabled": true,
    "backupCodesRemaining": 3
  }
  ```

#### Generate QR Code

- **POST** `/api/v1/auth/mfa/generate-qr`
- **Description**: Generate QR code data URL for MFA setup
- **Authentication**: Required
- **Rate Limit**: 5 attempts per 15 minutes
- **Body**:
  ```json
  {
    "secret": "JBSWY3DPEHPK3PXP",
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "qrCodeDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```

#### Get QR Code Image

- **GET** `/api/v1/auth/mfa/qr/:secret/:email`
- **Description**: Get QR code as PNG image
- **Authentication**: Not required (public endpoint)
- **Parameters**:
  - `secret`: Base32 encoded MFA secret
  - `email`: User email address (URL encoded)
- **Response**: PNG image data

### User Management Routes (`/api/v1/users`)

All user routes require authentication.

#### Get All Users (Admin Only)

- **GET** `/api/v1/users?page=1&limit=10&role=USER&search=john`
- **Description**: Get paginated list of users
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `role`: Filter by role (USER, ACCOUNTANT, ADMIN)
  - `search`: Search in email, firstName, lastName
- **Response**:
  ```json
  {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "USER",
        "isEmailVerified": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

#### Get User by ID

- **GET** `/api/v1/users/:userId`
- **Description**: Get specific user details
- **Authentication**: Required
- **Authorization**: Admin, Accountant, or own user
- **Response**: User object

#### Update User

- **PUT** `/api/v1/users/:userId`
- **Description**: Update user profile
- **Authentication**: Required
- **Authorization**: Admin or own user
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com"
  }
  ```

#### Update User Role (Admin Only)

- **PATCH** `/api/v1/users/:userId/role`
- **Description**: Change user role
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes
- **Body**:
  ```json
  {
    "role": "ACCOUNTANT"
  }
  ```

#### Delete User (Admin Only)

- **DELETE** `/api/v1/users/:userId`
- **Description**: Delete user account
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes

#### Get User Statistics (Admin Only)

- **GET** `/api/v1/users/stats`
- **Description**: Get user statistics
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes
- **Response**:
  ```json
  {
    "stats": {
      "total": 100,
      "verified": 85,
      "unverified": 15,
      "byRole": {
        "USER": 80,
        "ACCOUNTANT": 15,
        "ADMIN": 5
      }
    }
  }
  ```

#### Resend Verification Email (Admin Only)

- **POST** `/api/v1/users/:userId/resend-verification`
- **Description**: Resend email verification
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes

### Performance Monitoring Routes (`/api/v1/admin/performance`)

All performance routes require admin authentication.

#### Get Performance Metrics

- **GET** `/api/v1/admin/performance/:endpoint?method=GET&timeRange=3600000`
- **Description**: Get performance metrics for a specific endpoint
- **Authentication**: Required
- **Authorization**: Admin only
- **Parameters**:
  - `endpoint`: The endpoint path to get metrics for
  - `method`: HTTP method (default: GET)
  - `timeRange`: Time range in milliseconds (default: 3600000 = 1 hour)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "endpoint": "/api/v1/auth/login",
      "method": "POST",
      "timeRange": 3600000,
      "metrics": [
        {
          "timestamp": "2024-01-01T00:00:00Z",
          "responseTime": 150,
          "statusCode": 200,
          "memoryUsage": 45.2
        }
      ],
      "count": 1
    }
  }
  ```

#### Get Performance Statistics

- **GET** `/api/v1/admin/performance/:endpoint/stats?method=GET&timeRange=3600000`
- **Description**: Get performance statistics for a specific endpoint
- **Authentication**: Required
- **Authorization**: Admin only
- **Parameters**:
  - `endpoint`: The endpoint path to get statistics for
  - `method`: HTTP method (default: GET)
  - `timeRange`: Time range in milliseconds (default: 3600000 = 1 hour)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "endpoint": "/api/v1/auth/login",
      "method": "POST",
      "timeRange": 3600000,
      "statistics": {
        "totalRequests": 100,
        "averageResponseTime": 150.5,
        "minResponseTime": 120,
        "maxResponseTime": 300,
        "averageMemoryUsage": 45.2,
        "errorRate": 0.05
      }
    }
  }
  ```

#### Get All Monitored Endpoints

- **GET** `/api/v1/admin/performance/endpoints`
- **Description**: Get list of all monitored endpoints
- **Authentication**: Required
- **Authorization**: Admin only
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "endpoints": [
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/users"
      ],
      "count": 3
    }
  }
  ```

#### Get System Performance Summary

- **GET** `/api/v1/admin/performance/summary?timeRange=3600000`
- **Description**: Get overall system performance summary
- **Authentication**: Required
- **Authorization**: Admin only
- **Parameters**:
  - `timeRange`: Time range in milliseconds (default: 3600000 = 1 hour)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "timeRange": 3600000,
      "summary": {
        "totalRequests": 1000,
        "averageResponseTime": 145.2,
        "totalErrors": 25,
        "errorRate": 0.025,
        "averageMemoryUsage": 48.5,
        "peakMemoryUsage": 65.2,
        "topEndpoints": [
          {
            "endpoint": "/api/v1/auth/login",
            "requestCount": 300,
            "averageResponseTime": 120
          }
        ]
      }
    }
  }
  ```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login",
  "details": {
    "field": "email",
    "message": "Valid email is required"
  }
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour
- **Email Verification**: 10 attempts per hour
- **Admin Endpoints**: 50 requests per 15 minutes

## User Roles

- **USER**: Basic user access
- **ACCOUNTANT**: Can view user data
- **ADMIN**: Full system access

## Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

## Environment Variables

All environment variables are validated at application startup. The application will not start if required variables are missing or invalid.

### Required Variables

- `NODE_ENV`: Application environment (development, production, test)
- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: JWT signing secret (minimum 32 characters)
- `JWT_REFRESH_SECRET`: JWT refresh token secret (minimum 32 characters)
- `RESEND_API_KEY`: Resend email API key
- `RESEND_FROM_EMAIL`: Sender email address (valid email format)
- `RESEND_FROM_NAME`: Sender name for emails
- `REDIS_PASSWORD`: Redis server password
- `CORS_ORIGIN`: Allowed CORS origins
- `APP_URL`: Frontend application URL

### Optional Variables (with defaults)

- `PORT`: Server port (default: 5000)
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)
- `JWT_EXPIRES_IN`: JWT access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN`: JWT refresh token expiration (default: 7d)
- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `FRONTEND_URL`: Frontend URL alias (uses APP_URL if not set)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 900000ms)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)

### Environment Validation

The application performs comprehensive validation of all environment variables at startup:

- **Type Validation**: Ensures correct data types (string, number, boolean)
- **Format Validation**: Validates email formats, URL formats, etc.
- **Length Validation**: Ensures minimum lengths for secrets and passwords
- **Required Check**: Verifies all required variables are present
- **Default Assignment**: Provides sensible defaults for optional variables

If validation fails, the application will display detailed error messages and exit with a non-zero status code.

---

**© <span id="copyright-year"></span> Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**

*All rights reserved.*