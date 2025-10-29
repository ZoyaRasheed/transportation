# Transportation & Loading Coordination System - System Architecture

## System Overview

The Transportation & Loading Coordination System is a production-ready digital platform that has successfully replaced radio-based communication with a comprehensive real-time coordination system. This document outlines the technical architecture and implementation details of the completed system.

## Technology Stack Selection

### Frontend Technologies
- **Next.js 14**: Full-stack React framework with App Router for modern development
- **JavaScript (ES6+)**: Modern JavaScript without TypeScript complexity
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality, accessible React components built on Radix UI
- **React Hook Form**: Performant forms with easy validation

### Backend Technologies
- **Next.js API Routes**: 20 production endpoints with role-based middleware
- **NextAuth.js**: Google OAuth authentication with role-based access control
- **Web Push API**: Real-time notifications with service workers
- **Custom Middleware**: Role-based security on all protected endpoints
- **Polling + React Query**: Simple real-time updates via API polling

### Database & Infrastructure
- **MongoDB**: Document-based NoSQL database for flexible data modeling
- **Mongoose**: ODM for MongoDB with schema validation and type safety
- **Vercel**: Serverless deployment platform optimized for Next.js
- **MongoDB Atlas**: Cloud-hosted database with built-in security and scaling

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Loading Dept  │    │ Transportation  │    │   Supervisor    │
│    Dashboard    │    │    Dashboard    │    │    Dashboard    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────┴─────────────────────┐
          │            Next.js Frontend               │
          │         (React Components + UI)           │
          └─────────────────────┬─────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          │         Next.js API Routes                │
          │    (Authentication + Business Logic)      │
          └─────────────────────┬─────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          │            MongoDB Database               │
          │     (Users, Requests, Trucks, Doors)     │
          └───────────────────────────────────────────┘
```

### Authentication Flow
```
User Login → NextAuth.js → Role Verification → Dashboard Routing
     ↓            ↓              ↓                    ↓
  Credentials   JWT Token    Department Check    Access Control
```

### Real-time Communication Flow
```
Action Trigger → API Route → Database Update → SSE/Polling → UI Update
     ↓              ↓             ↓               ↓            ↓
Request Created   Validation   MongoDB Insert   Push Event   Dashboard Refresh
```

### Real-time Options for Next.js
1. **Server-Sent Events (SSE)**: Simple one-way real-time updates
2. **API Polling with React Query**: Fetch latest data every few seconds
3. **Pusher**: Third-party service for real-time features
4. **Database Change Streams**: MongoDB real-time data changes

## Database Design

### Data Modeling Strategy
We'll use MongoDB's document-based approach to model our transportation coordination system. Each collection represents a core business entity with embedded subdocuments for related data.

### Core Collections

#### Users Collection
**Purpose**: Store all system users with role-based access control
```
Collection: users
Fields:
- _id: Primary identifier
- email: Unique user identifier
- name: Display name
- role: System role (loader, switcher, dispatcher, supervisor)
- department: Department affiliation (loading, transportation, management)
- phone: Contact number for notifications
- isActive: Account status
- deviceTokens: Array of push notification tokens
- preferences: User settings and notifications preferences
- createdAt: Account creation timestamp
- updatedAt: Last modification timestamp
```

#### TruckRequests Collection
**Purpose**: Central entity for all truck movement requests
```
Collection: truckRequests
Fields:
- _id: Primary identifier
- doorNumber: Loading dock number
- requestType: Type of operation (load, unload, move_empty, remove_trailer)
- priority: Request urgency (low, normal, high, urgent)
- notes: Additional instructions or context
- status: Current state (pending, assigned, in_progress, completed, cancelled)
- requestedBy: Reference to requesting user
- assignedTo: Reference to assigned switcher
- estimatedTime: Expected completion time in minutes
- actualTime: Actual completion time in minutes
- timestamps: requestedAt, assignedAt, completedAt
- location: Current truck/trailer location
- truckDetails: Embedded truck information
```

#### Doors Collection
**Purpose**: Track loading dock availability and status
```
Collection: doors
Fields:
- _id: Primary identifier
- doorNumber: Physical door number
- status: Current state (available, occupied, loading, maintenance, blocked)
- currentTruck: Currently assigned truck identifier
- lastUpdated: Last status change timestamp
- maintenanceNotes: Issues or maintenance information
- isActive: Operational status
- capacity: Loading capacity specifications
- equipment: Available equipment (dock levelers, etc.)
```

#### Trucks Collection
**Purpose**: Manage truck fleet and availability
```
Collection: trucks
Fields:
- _id: Primary identifier
- truckId: Unique truck identifier
- type: Vehicle type (trailer, container, flatbed)
- status: Current state (available, in_use, maintenance, out_of_service)
- currentLocation: Physical location in yard
- assignedDoor: Currently assigned door number
- specifications: Truck specifications (length, capacity, etc.)
- maintenanceSchedule: Maintenance tracking
- lastInspection: Last safety inspection date
```

#### Issues Collection
**Purpose**: Track and manage operational issues and incidents
```
Collection: issues
Fields:
- _id: Primary identifier
- type: Issue category (door_issue, truck_issue, loading_delay, weather_delay, mechanical_failure)
- title: Brief issue description
- description: Detailed issue information
- severity: Issue priority (low, medium, high, critical)
- status: Resolution state (open, in_progress, resolved, closed)
- reportedBy: User who reported the issue
- assignedTo: User responsible for resolution
- relatedEntities: References to doors, trucks, or requests
- timeline: reportedAt, assignedAt, resolvedAt timestamps
- resolution: Resolution details and actions taken
```

#### Notifications Collection
**Purpose**: Manage all system notifications and alerts
```
Collection: notifications
Fields:
- _id: Primary identifier
- userId: Target user for notification
- type: Notification category
- title: Notification headline
- message: Detailed notification content
- data: Additional structured data
- channels: Delivery methods (in-app, email, sms, push)
- status: Delivery state (pending, sent, read, failed)
- priority: Notification priority level
- timestamps: createdAt, sentAt, readAt
```

### Database Relationships

#### User-Centric Relationships
- Users create TruckRequests (one-to-many)
- Users are assigned TruckRequests (one-to-many)
- Users report Issues (one-to-many)
- Users receive Notifications (one-to-many)

#### Operational Relationships
- TruckRequests reference Doors (many-to-one)
- TruckRequests reference Trucks (many-to-one)
- Issues can relate to TruckRequests, Doors, or Trucks
- Notifications are triggered by TruckRequests and Issues

### Indexing Strategy
```
users: email (unique), role, department, isActive
truckRequests: status, doorNumber, requestedAt, assignedTo
doors: doorNumber (unique), status, isActive
trucks: truckId (unique), status, currentLocation
issues: status, type, severity, reportedAt
notifications: userId, status, createdAt, type
```

## User Roles & Permissions

### Role Definitions

#### Loader Role
**Department**: Loading
**Responsibilities**:
- Create truck requests for specific doors
- Add loading instructions and notes
- Update request status during loading
- Report loading-related issues

**Permissions**:
- Create truck requests
- View own requests
- Update request notes
- Report door/loading issues
- Receive request status notifications

#### Switcher Role
**Department**: Transportation
**Responsibilities**:
- View and accept truck requests
- Move trucks to assigned doors
- Update truck locations
- Report truck/movement issues

**Permissions**:
- View all pending requests
- Accept and update requests
- Update truck locations
- Report truck/movement issues
- Receive assignment notifications

#### Dispatcher Role
**Department**: Transportation
**Responsibilities**:
- Monitor all switcher activities
- Reassign requests if needed
- Coordinate truck movements
- Manage truck fleet status

**Permissions**:
- View all requests and assignments
- Reassign requests
- Override truck status
- Access transportation reports
- Manage switcher assignments

#### Supervisor Role
**Department**: Management
**Responsibilities**:
- Monitor entire operation
- Access all reports and analytics
- Resolve escalated issues
- Manage user accounts

**Permissions**:
- Full system access
- User management
- System configuration
- All reports and analytics
- Issue resolution authority

### Permission Matrix
```
                  │ Loader │ Switcher │ Dispatcher │ Supervisor │
├─────────────────┼────────┼──────────┼────────────┼────────────┤
│ Create Requests │   ✓    │    ✗     │     ✗      │     ✓      │
│ View All Reqs   │   ✗    │    ✓     │     ✓      │     ✓      │
│ Assign Requests │   ✗    │    ✓     │     ✓      │     ✓      │
│ Manage Trucks   │   ✗    │    ✓     │     ✓      │     ✓      │
│ Manage Doors    │   ✗    │    ✗     │     ✓      │     ✓      │
│ View Reports    │   ✗    │    ✗     │     ✓      │     ✓      │
│ User Management │   ✗    │    ✗     │     ✗      │     ✓      │
│ System Config   │   ✗    │    ✗     │     ✗      │     ✓      │
```

## Feature Specifications

### Request Management System

#### Request Creation Flow
1. **User Authentication**: Verify user role and department
2. **Door Availability Check**: Validate selected door is available
3. **Request Validation**: Validate all required fields and business rules
4. **Database Storage**: Store request with timestamp and initial status
5. **Notification Dispatch**: Notify transportation department
6. **Real-time Update**: Broadcast to all connected clients

#### Request Assignment Flow
1. **Notification Receipt**: Switcher receives request notification
2. **Acceptance**: First switcher to accept gets assignment
3. **Status Update**: Change request status to 'assigned'
4. **Notification Update**: Notify original requester of assignment
5. **Time Tracking**: Begin tracking response and completion times

#### Request Completion Flow
1. **Status Update**: Switcher marks request as completed
2. **Time Recording**: Record actual completion time
3. **Notification**: Notify requester of completion
4. **Analytics Update**: Update performance metrics
5. **Clean-up**: Release door and truck resources

### Real-time Notification System

#### Notification Types
- **Request Notifications**: New requests, assignments, completions
- **Issue Alerts**: Equipment problems, delays, emergencies
- **Status Updates**: Door availability, truck movements
- **System Notifications**: Maintenance windows, announcements

#### Delivery Channels
- **In-App**: Real-time browser notifications via Socket.io
- **Push Notifications**: Mobile device alerts via Web Push API
- **Email**: Important updates and daily summaries
- **SMS**: Critical alerts and urgent notifications

#### Notification Rules
- **Role-Based**: Users only receive relevant notifications
- **Priority-Based**: Critical alerts bypass user preferences
- **Time-Based**: No non-critical notifications outside work hours
- **Frequency Limits**: Prevent notification spam

### Issue Management System

#### Issue Categories
- **Equipment Issues**: Door malfunctions, truck breakdowns
- **Process Issues**: Loading delays, communication problems
- **Environmental Issues**: Weather delays, power outages
- **Safety Issues**: Accidents, hazardous conditions

#### Issue Lifecycle
1. **Reporting**: User reports issue with category and severity
2. **Assignment**: System assigns to appropriate resolver
3. **Investigation**: Assigned user investigates and updates status
4. **Resolution**: Issue resolved and marked complete
5. **Follow-up**: Verification and documentation

#### Escalation Rules
- **Time-Based**: Auto-escalate if not resolved within SLA
- **Severity-Based**: Critical issues immediately escalate
- **Department-Based**: Cross-department issues escalate to supervisors

## Implementation Architecture

### Complete API Implementation (20 Endpoints)

#### **Authentication & User Management**
```
POST /api/auth/[...nextauth]      - Google OAuth authentication
GET/PUT /api/user/profile         - User profile management
POST/DELETE /api/user/device-token - Push notification tokens
GET/PUT /api/admin/users          - Admin user management
PUT /api/admin/users/[id]         - Individual user updates
```

#### **Truck Request Workflow**
```
GET/POST /api/truck-requests           - Request CRUD operations
PUT /api/truck-requests/[id]/status    - Status updates with notifications
PUT /api/truck-requests/[id]/assign    - Truck and driver assignments
```

#### **Yard Operations Management**
```
GET/POST /api/yard/bays               - Loading bay management
PUT /api/yard/bays/[id]/assign        - Bay assignments
GET/POST /api/yard/movements          - Movement tracking
GET/PUT /api/yard/queue               - Queue management
```

#### **Real-Time Communication**
```
GET/POST /api/notifications           - Notification management
PUT/DELETE /api/notifications/[id]    - Individual notification actions
PUT /api/notifications/mark-all-read  - Bulk operations
```

#### **Role-Based Dashboards**
```
GET /api/dashboard/loader      - Personal request dashboard
GET /api/dashboard/switcher    - Yard operations dashboard
GET /api/dashboard/dispatcher  - Fleet management dashboard
GET /api/dashboard/admin       - System analytics dashboard
```

#### **System Monitoring**
```
GET /api/health               - System health and status
```

### Database Schema (5 Models)

#### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  role: ['loader', 'switcher', 'dispatcher', 'supervisor', 'admin'],
  department: ['loading', 'transportation', 'management', 'admin'],
  isActive: Boolean,
  deviceTokens: [String],
  preferences: Object,
  lastLogin: Date
}
```

#### **TruckRequest Model**
```javascript
{
  requesterId: ObjectId (ref: User),
  loadId: String,
  loadDescription: String,
  priority: ['low', 'normal', 'high', 'urgent'],
  pickupLocation: String,
  deliveryLocation: String,
  estimatedWeight: Number,
  status: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
  assignedTruck: {
    truckId: String,
    driverId: ObjectId,
    assignedAt: Date,
    assignedBy: ObjectId
  },
  notes: String
}
```

#### **LoadingBay Model**
```javascript
{
  bayNumber: String (unique),
  bayName: String,
  location: String,
  capacity: Number,
  status: ['available', 'occupied', 'maintenance', 'reserved'],
  currentTruck: {
    truckId: String,
    driverId: ObjectId,
    assignedAt: Date,
    estimatedDeparture: Date
  },
  assignedBy: ObjectId
}
```

#### **YardMovement Model**
```javascript
{
  truckRequestId: ObjectId (ref: TruckRequest),
  truckId: String,
  driverId: ObjectId (ref: User),
  movementType: ['entry', 'queue', 'bay_assigned', 'loading', 'departure'],
  fromLocation: String,
  toLocation: String,
  loadingBayId: ObjectId (ref: LoadingBay),
  switcherId: ObjectId (ref: User),
  notes: String,
  estimatedTime: Date,
  actualTime: Date
}
```

#### **Notification Model**
```javascript
{
  recipientId: ObjectId (ref: User),
  senderId: ObjectId (ref: User),
  type: ['truck_request', 'status_update', 'assignment', 'general'],
  title: String,
  message: String,
  data: {
    truckRequestId: ObjectId,
    status: String,
    priority: String,
    actionUrl: String
  },
  isRead: Boolean,
  readAt: Date,
  pushSent: Boolean
}
```

### Security Implementation

#### **Role-Based Access Control**
- **withRoles Middleware**: Custom middleware for endpoint protection
- **Google OAuth**: Secure authentication without password management
- **Session Management**: JWT-based sessions with automatic renewal
- **API Security**: Rate limiting and input validation on all endpoints

#### **Data Protection**
- **Encrypted Storage**: Sensitive data encryption at rest
- **HTTPS Communication**: All API calls secured with TLS
- **Input Validation**: Comprehensive validation on all user inputs
- **Audit Trail**: Complete logging of all user actions and system events

### Performance Optimizations

#### **Database Optimization**
- **Strategic Indexing**: Optimized indexes for frequent query patterns
- **Aggregation Pipelines**: Efficient dashboard data computation
- **Connection Pooling**: Optimal database connection management
- **Query Optimization**: Minimized database round trips

#### **Frontend Performance**
- **Component Optimization**: Efficient React component rendering
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Caching Strategy**: Smart caching for static and dynamic content
- **Mobile Responsiveness**: Optimized for all device types

---

## Production Deployment

### **System Requirements**
- **Node.js**: Version 18+ for optimal performance
- **MongoDB**: Version 5.0+ with replica set configuration
- **Memory**: Minimum 2GB RAM for production workloads
- **Storage**: SSD storage recommended for database performance

### **Environment Configuration**
- **Environment Variables**: Secure configuration management
- **SSL Certificates**: HTTPS enforcement for all environments
- **Database Backups**: Automated daily backups with retention policy
- **Monitoring**: Health checks and performance monitoring

### **Scalability Considerations**
- **Horizontal Scaling**: Stateless API design for easy scaling
- **Load Balancing**: Ready for multi-instance deployment
- **CDN Integration**: Static asset optimization and delivery
- **Database Scaling**: Prepared for read replicas and sharding

---

*This document provides the complete technical architecture for the production-ready Transportation & Loading Coordination System. For business and product information, refer to the Product Overview documentation.*
