# Authentication API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Health Check

- **GET** `/health`
- **Description**: Check API status
- **Response**: API status and environment info

### Authentication Routes (`/auth`)

#### Register User

- **POST** `/auth/register`
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

- **POST** `/auth/login`
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

- **POST** `/auth/verify-email`
- **Description**: Verify email address with token
- **Rate Limit**: 10 attempts per hour
- **Body**:
  ```json
  {
    "token": "verification_token"
  }
  ```

#### Forgot Password

- **POST** `/auth/forgot-password`
- **Description**: Request password reset email
- **Rate Limit**: 3 attempts per hour
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Reset Password

- **POST** `/auth/reset-password`
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

- **POST** `/auth/refresh`
- **Description**: Get new access token using refresh token
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token"
  }
  ```

#### Logout

- **POST** `/auth/logout`
- **Description**: Invalidate refresh token
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token"
  }
  ```

#### Get Profile (Protected)

- **GET** `/auth/me`
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

- **POST** `/auth/change-password`
- **Description**: Change user password
- **Authentication**: Required
- **Body**:
  ```json
  {
    "currentPassword": "OldSecurePass123",
    "newPassword": "NewSecurePass123"
  }
  ```

### User Management Routes (`/users`)

All user routes require authentication.

#### Get All Users (Admin Only)

- **GET** `/users?page=1&limit=10&role=USER&search=john`
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

- **GET** `/users/:userId`
- **Description**: Get specific user details
- **Authentication**: Required
- **Authorization**: Admin, Accountant, or own user
- **Response**: User object

#### Update User

- **PUT** `/users/:userId`
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

- **PATCH** `/users/:userId/role`
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

- **DELETE** `/users/:userId`
- **Description**: Delete user account
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes

#### Get User Statistics (Admin Only)

- **GET** `/users/stats`
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

- **POST** `/users/:userId/resend-verification`
- **Description**: Resend email verification
- **Authentication**: Required
- **Authorization**: Admin only
- **Rate Limit**: 50 requests per 15 minutes

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "statusCode": 400,
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

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `RESEND_API_KEY`: Resend email API key
- `RESEND_FROM_EMAIL`: Sender email address
- `RESEND_FROM_NAME`: Sender name
- `APP_URL`: Frontend application URL
