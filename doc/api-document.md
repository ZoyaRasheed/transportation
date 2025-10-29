# TransportFlow API Documentation

## Complete API Reference

This document provides a comprehensive overview of all available API endpoints in the TransportFlow system.

---

## API Endpoints Table

| No. | API Name | Method | Endpoint | Access By | Description |
|-----|----------|--------|----------|-----------|-------------|
| 1 | Health Check | GET | `/api/health` | Public | Service health monitoring and database connectivity |
| 2 | Authentication | POST | `/api/auth/[...nextauth]` | Public | NextAuth.js OAuth authentication endpoints |
| 3 | Logout | POST | `/api/auth/logout` | All Users | Custom logout with device token cleanup |
| 4 | User Profile | GET | `/api/user/profile` | All Users | Retrieve user profile information |
| 5 | Update Profile | PUT | `/api/user/profile` | All Users | Update user profile information |
| 6 | Save Device Token | POST | `/api/user/device-token` | All Users | Save device token for push notifications |
| 7 | Remove Device Token | DELETE | `/api/user/device-token` | All Users | Remove device token from user account |
| 8 | List Users | GET | `/api/admin/users` | Admin | Retrieve all users with pagination and filtering |
| 9 | Update User | PUT | `/api/admin/users/[id]` | Admin | Update user roles and account status |
| 10 | Create Truck Request | POST | `/api/truck-requests` | Loader, Admin | Create new transportation requests |
| 11 | List Truck Requests | GET | `/api/truck-requests` | Loader, Dispatcher, Admin, Supervisor | Retrieve truck requests with filtering |
| 12 | Update Request Status | PUT | `/api/truck-requests/[id]/status` | Loader, Dispatcher, Supervisor, Admin | Update truck request status with notifications |
| 13 | Assign Truck & Driver | PUT | `/api/truck-requests/[id]/assign` | Dispatcher, Supervisor, Admin | Assign truck and driver to request |
| 14 | List Trucks | GET | `/api/trucks` | Dispatcher, Supervisor, Admin, Switcher | Retrieve fleet vehicles with filtering |
| 15 | Create Truck | POST | `/api/trucks` | Admin, Supervisor | Register new vehicles in fleet |
| 16 | List Drivers | GET | `/api/drivers` | Dispatcher, Supervisor, Admin | Retrieve driver profiles with licensing info |
| 17 | Create Driver | POST | `/api/drivers` | Admin, Supervisor | Create new driver profiles |
| 18 | List Notifications | GET | `/api/notifications` | All Users | Retrieve user notifications with filtering |
| 19 | Create Notification | POST | `/api/notifications` | Dispatcher, Supervisor, Admin | Send notifications to users |
| 20 | Update Notification | PUT | `/api/notifications/[id]` | All Users | Mark individual notification as read |
| 21 | Delete Notification | DELETE | `/api/notifications/[id]` | All Users | Delete individual notification |
| 22 | Mark All Read | PUT | `/api/notifications/mark-all-read` | All Users | Mark all user notifications as read |
| 23 | List Loading Bays | GET | `/api/yard/bays` | Switcher, Dispatcher, Supervisor, Admin | Retrieve loading bay status and availability |
| 24 | Create Loading Bay | POST | `/api/yard/bays` | Supervisor, Admin | Create new loading bay in yard |
| 25 | Assign Bay | PUT | `/api/yard/bays/[id]/assign` | Switcher, Dispatcher, Supervisor, Admin | Assign truck to loading bay |
| 26 | List Yard Movements | GET | `/api/yard/movements` | Switcher, Dispatcher, Supervisor, Admin | Track vehicle movements in yard |
| 27 | Create Yard Movement | POST | `/api/yard/movements` | Switcher, Dispatcher, Supervisor, Admin | Record new vehicle movement |
| 28 | Get Yard Queue | GET | `/api/yard/queue` | Switcher, Dispatcher, Supervisor, Admin | Retrieve waiting queue status |
| 29 | Update Queue Priority | PUT | `/api/yard/queue` | Switcher, Dispatcher, Supervisor, Admin | Modify queue priorities and order |
| 30 | Loader Dashboard | GET | `/api/dashboard/loader` | Loader | Personal dashboard with request metrics |
| 31 | Switcher Dashboard | GET | `/api/dashboard/switcher` | Switcher | Yard operations dashboard |
| 32 | Dispatcher Dashboard | GET | `/api/dashboard/dispatcher` | Dispatcher, Supervisor, Admin | Fleet coordination dashboard |
| 33 | Admin Dashboard | GET | `/api/dashboard/admin` | Admin | System administration dashboard |

---

## User Role Definitions

### Access Control Roles:
- **Public**: No authentication required
- **All Users**: loader, switcher, dispatcher, supervisor, admin
- **Loader**: Loading department staff - can create and track requests
- **Switcher**: Yard operations staff - can manage bays and movements
- **Dispatcher**: Transportation coordination staff - can assign trucks and drivers
- **Supervisor**: Department supervisors - can oversee all operations
- **Admin**: System administrators - full access to all features

---

## API Response Format

All APIs follow a consistent response format:

```json
{
  "success": true|false,
  "statusCode": 200|400|401|403|404|500,
  "request": {
    "method": "GET|POST|PUT|DELETE",
    "url": "full_request_url"
  },
  "message": "Human readable message",
  "data": {
    // Response payload
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication & Security

### Authentication Method:
- **OAuth 2.0** with Google Sign-In via NextAuth.js
- **Session-based** authentication with JWT tokens
- **Role-based middleware** protection on all sensitive endpoints

### Security Features:
- **Role-based access control** (RBAC) on all protected endpoints
- **Request validation** and sanitization
- **Rate limiting** and request throttling
- **HTTPS enforcement** for all communications
- **Device token management** for push notifications

---

## Pagination & Filtering

Most list endpoints support:
- **Pagination**: `?page=1&limit=20`
- **Filtering**: Various filters based on endpoint (status, role, date, etc.)
- **Sorting**: Typically by creation date (newest first)
- **Search**: Text-based search where applicable

---

## Error Handling

### Common HTTP Status Codes:
- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **409**: Conflict (duplicate data)
- **500**: Internal server error

### Error Response Example:
```json
{
  "success": false,
  "statusCode": 400,
  "request": {
    "method": "POST",
    "url": "/api/truck-requests"
  },
  "message": "Missing required fields: loadDescription, pickupLocation",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Rate Limiting

- **General APIs**: 100 requests per minute per user
- **Authentication**: 10 requests per minute per IP
- **Dashboard APIs**: 30 requests per minute per user
- **Notification APIs**: 50 requests per minute per user

---


*Last Updated: October 2024*
*API Version: 1.0.0*
*Total Endpoints: 33*