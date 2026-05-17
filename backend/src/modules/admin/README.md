# Admin Module

Provides an `ADMIN`-only operational API namespace for the BuzzMap control plane.

## Mounted Routes

Mounted under `/api/v1/admin`.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/overview` | Aggregate marketplace totals, queues, and top-business summary |
| `GET` | `/users` | Paginated user directory for admin review |
| `GET` | `/businesses` | Paginated business directory with owner and rating context |
| `GET` | `/catalog` | Paginated cross-business product directory |
| `GET` | `/orders` | Paginated global orders view |
| `GET` | `/moderation` | Report queue and recent content moderation summary |
| `GET` | `/messages` | Conversation counts and recent messaging activity |
| `GET` | `/announcements` | Honest capability notice until announcement persistence exists |
| `GET` | `/security` | Security posture and policy summary |
| `GET` | `/system` | Runtime and health summary |
| `GET` | `/settings` | Read-only platform settings summary |
| `GET` | `/audit-log` | Honest capability notice until audit-log persistence exists |

## Notes

- All routes require authentication and the `ADMIN` role.
- `announcements` and `audit-log` intentionally return capability notices instead of fake historical data because the current schema does not yet persist those concepts.
- The module is read-oriented and designed to support the frontend admin console without reusing customer/business-specific API shapes.
