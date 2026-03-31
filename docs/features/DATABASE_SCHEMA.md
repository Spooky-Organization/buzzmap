# Database Schema — BuzzMap

## Overview
BuzzMap uses Prisma ORM with PostgreSQL. This document describes all 17 models in the schema.

## Models

### 1. User
Represents a customer or business owner in the system.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| email | String | Unique email address |
| phone | String? | Optional phone number |
| passwordHash | String | Bcrypt hashed password |
| firstName | String | User's first name |
| lastName | String | User's last name |
| role | Enum (CUSTOMER, BUSINESS_OWNER, ADMIN) | User's role |
| avatarUrl | String? | Profile picture URL |
| isActive | Boolean | Account status |
| emailVerified | DateTime? | Email verification timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 2. Business
Represents a business entity owned by a business owner.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| ownerId | String | FK to User |
| name | String | Business name |
| slug | String | URL-friendly slug (unique) |
| description | String? | Business description |
| logoUrl | String? | Business logo |
| coverImageUrl | String? | Cover image |
| category | String | Business category |
| website | String? | Business website |
| phone | String? | Contact phone |
| email | String? | Contact email |
| address | String? | Physical address |
| city | String? | City |
| country | String? | Country |
| latitude | Float? | Geo location |
| longitude | Float? | Geo location |
| isVerified | Boolean | Verified business flag |
| isActive | Boolean | Active status |
| rating | Float? | Average rating |
| reviewCount | Int | Number of reviews |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 3. Product
Products or services offered by a business.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| businessId | String | FK to Business |
| name | String | Product name |
| slug | String | URL-friendly slug |
| description | String? | Product description |
| price | Decimal | Product price |
| comparePrice | Decimal? | Original price for comparison |
| images | String[] | Array of image URLs |
| category | String | Product category |
| tags | String[] | Product tags |
| sku | String? | Stock keeping unit |
| stockQuantity | Int | Available stock |
| isAvailable | Boolean | Availability status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 4. POV
Point of View - content pieces created by businesses.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| businessId | String | FK to Business |
| title | String | POV title |
| slug | String | URL-friendly slug |
| content | String | Markdown content |
| coverImageUrl | String? | Cover image |
| type | Enum (ARTICLE, POST, UPDATE) | POV type |
| isPublished | Boolean | Published status |
| publishedAt | DateTime? | Publish timestamp |
| viewCount | Int | Number of views |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 5. Order
Customer orders for products.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| orderNumber | String | Unique order number |
| customerId | String | FK to User (customer) |
| businessId | String | FK to Business |
| status | Enum (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED) | Order status |
| subtotal | Decimal | Subtotal amount |
| taxAmount | Decimal | Tax amount |
| shippingAmount | Decimal | Shipping cost |
| totalAmount | Decimal | Total amount |
| shippingAddress | JSON | Shipping address details |
| billingAddress | JSON | Billing address details |
| notes | String? | Order notes |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 6. OrderItem
Individual items in an order.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| orderId | String | FK to Order |
| productId | String | FK to Product |
| quantity | Int | Item quantity |
| unitPrice | Decimal | Price per unit |
| totalPrice | Decimal | Total for this item |
| createdAt | DateTime | Creation timestamp |

### 7. Payment
Payment transactions for orders.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| orderId | String | FK to Order |
| userId | String | FK to User (payer) |
| amount | Decimal | Payment amount |
| currency | String | Currency code (default: USD) |
| method | Enum (CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER, CASH) | Payment method |
| status | Enum (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED) | Payment status |
| transactionId | String? | External transaction ID |
| paymentDetails | JSON | Additional payment details |
| paidAt | DateTime? | Payment completion timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 8. Message
Individual messages in conversations.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| conversationId | String | FK to Conversation |
| senderId | String | FK to User (sender) |
| content | String | Message content |
| attachments | String[]? | File attachment URLs |
| isRead | Boolean | Read status |
| readAt | DateTime? | Read timestamp |
| createdAt | DateTime | Creation timestamp |

### 9. Conversation
Chat conversations between users.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| type | Enum (DIRECT, GROUP) | Conversation type |
| name | String? | Group name (for group chats) |
| lastMessageId | String? | FK to last Message |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 10. ConversationParticipant
Junction table for users in conversations.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| conversationId | String | FK to Conversation |
| userId | String | FK to User |
| role | Enum (ADMIN, MODERATOR, MEMBER) | Participant role |
| joinedAt | DateTime | Join timestamp |
| lastReadAt | DateTime? | Last read timestamp |

### 11. Follow
User follow relationships (for businesses/customers).

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| followerId | String | FK to User (who follows) |
| followingId | String | FK to User/Business being followed |
| followingType | Enum (USER, BUSINESS) | Type of entity being followed |
| createdAt | DateTime | Creation timestamp |

### 12. Notification
User notifications.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| userId | String | FK to User (recipient) |
| type | Enum | Notification type |
| title | String | Notification title |
| message | String | Notification message |
| data | JSON? | Additional data |
| isRead | Boolean | Read status |
| readAt | DateTime? | Read timestamp |
| createdAt | DateTime | Creation timestamp |

### 13. RecommendationAd
Sponsored recommendations and ads.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| businessId | String | FK to Business (advertiser) |
| title | String | Ad title |
| description | String? | Ad description |
| imageUrl | String? | Ad image |
| targetUrl | String | Landing URL |
| targetInterests | String[] | Target interests |
| targetLocation | JSON? | Geographic targeting |
| budget | Decimal | Campaign budget |
| dailyBudget | Decimal? | Daily budget limit |
| impressions | Int | Total impressions |
| clicks | Int | Total clicks |
| status | Enum (DRAFT, ACTIVE, PAUSED, EXPIRED) | Ad status |
| startDate | DateTime | Campaign start |
| endDate | DateTime? | Campaign end |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 14. Comment
Comments on POVs and products.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| userId | String | FK to User (commenter) |
| parentId | String? | FK to parent Comment (for replies) |
| parentType | Enum (POV, PRODUCT) | Type of parent |
| parentId | String | FK to parent (POV/Product) |
| content | String | Comment text |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### 15. Like
Likes for POVs and products.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| userId | String | FK to User |
| parentType | Enum (POV, PRODUCT) | Type of parent |
| parentId | String | FK to parent (POV/Product) |
| createdAt | DateTime | Creation timestamp |

### 16. Interest
User interest categories for recommendations.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| name | String | Interest name |
| slug | String | URL-friendly slug |
| description | String? | Interest description |
| icon | String? | Icon identifier |
| createdAt | DateTime | Creation timestamp |

### 17. AnalyticsEvent
Tracking events for analytics.

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUUID) | Primary key |
| userId | String? | FK to User (optional) |
| eventType | String | Event type name |
| eventData | JSON | Event payload |
| sessionId | String? | Session identifier |
| ipAddress | String? | Client IP |
| userAgent | String? | Browser user agent |
| createdAt | DateTime | Creation timestamp |

## Relationships

- User → Business (one-to-many): A business owner can have multiple businesses
- Business → Product (one-to-many): A business can have multiple products
- Business → POV (one-to-many): A business can publish multiple POVs
- Order → OrderItem (one-to-many): An order contains multiple items
- Order → Payment (one-to-many): An order can have multiple payment attempts
- Conversation → Message (one-to-many): A conversation contains multiple messages
- User → Follow (one-to-many): Users can follow multiple entities
- User → Notification (one-to-many): Users receive multiple notifications