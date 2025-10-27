# Web Push Notifications Implementation Guide

This guide covers the complete implementation of Web Push Notifications for the TransportFlow application using the Web Push API.

## Overview

Web Push Notifications allow the application to send real-time notifications to users' browsers, even when the application is not actively open. This is particularly useful for coordination systems where timely communication is critical.

## Architecture

### Components

1. **Service Worker** (`/public/sw.js`) - Handles incoming push notifications
2. **Push Notifications Library** (`/lib/push-notifications.js`) - Client-side utilities
3. **Device Token API** (`/api/user/device-token/route.js`) - Server-side token management
4. **User Model** - Stores device tokens in `deviceTokens` array

### Flow

1. User logs in → Request notification permission
2. Browser generates device token → Save to user profile
3. Server can send notifications → User receives on device

## Setup Instructions

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push:

```bash
npm install web-push
npx web-push generate-vapid-keys
```

This generates:
- **Public Key**: Used by browser to subscribe to notifications
- **Private Key**: Used by server to send notifications

### 2. Environment Configuration

Add the keys to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

**Important**:
- `NEXT_PUBLIC_` prefix makes the public key available in browser
- Private key remains server-side only

### 3. File Structure

```
├── public/
│   └── sw.js                           # Service Worker
├── lib/
│   └── push-notifications.js           # Client utilities
├── app/api/user/device-token/
│   └── route.js                        # API endpoints
├── models/
│   └── User.js                         # User model with deviceTokens
└── doc/
    └── web-push-notifications.md       # This guide
```

## Implementation Details

### Service Worker (`/public/sw.js`)

Handles three main events:

#### Push Event
```javascript
self.addEventListener('push', function(event) {
  // Receives push notification data
  // Shows notification to user
});
```

#### Notification Click
```javascript
self.addEventListener('notificationclick', function(event) {
  // Handles user clicking on notification
  // Can open specific URLs or perform actions
});
```

#### Notification Close
```javascript
self.addEventListener('notificationclose', function(event) {
  // Handles notification dismissal
  // Useful for analytics
});
```

### Client-side Utilities (`/lib/push-notifications.js`)

#### Key Functions

1. **`requestNotificationPermission()`**
   - Requests browser notification permission
   - Returns boolean indicating success

2. **`registerServiceWorker()`**
   - Registers the service worker
   - Required for push notifications

3. **`getDeviceToken()`**
   - Subscribes to push notifications
   - Generates unique device token
   - Uses VAPID public key

4. **`saveDeviceToken(deviceToken)`**
   - Saves token to user profile via API
   - Handles API communication

5. **`setupPushNotifications()`**
   - Main function that orchestrates the setup
   - Called after user login

### API Endpoints (`/api/user/device-token/route.js`)

#### POST `/api/user/device-token`
- Adds device token to user's `deviceTokens` array
- Prevents duplicate tokens
- Requires authentication

#### DELETE `/api/user/device-token`
- Removes device token from user's array
- Useful for logout or token refresh

### Database Schema

The User model includes:

```javascript
deviceTokens: [{
  type: String
}]
```

- Stores multiple tokens per user (multiple devices/browsers)
- Tokens are hidden from JSON responses for security
- Used by server to send targeted notifications

## Usage

### Automatic Setup

Push notifications are automatically set up after user login:

```javascript
// In app/page.js
if (session) {
  setupPushNotifications().then(token => {
    if (token) {
      console.log('Push notifications enabled');
    }
  });
}
```

### Manual Setup

For dashboard pages or other components:

```javascript
import { setupPushNotifications } from '@/lib/push-notifications';

const enableNotifications = async () => {
  const token = await setupPushNotifications();
  if (token) {
    // Notifications enabled successfully
  }
};
```

## Sending Notifications

### Server-side Implementation

To send notifications from your server:

```javascript
const webpush = require('web-push');

// Configure VAPID
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
const sendNotification = async (deviceToken, payload) => {
  try {
    await webpush.sendNotification(
      JSON.parse(deviceToken),
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Push notification failed:', error);
  }
};
```

### Notification Payload

```javascript
const payload = {
  title: 'Truck Request',
  body: 'New truck request from Loading Department',
  icon: '/icon-192.png',
  badge: '/icon-72.png',
  data: {
    url: '/dashboard/dispatcher',
    action: 'view_request'
  },
  actions: [
    {
      action: 'view',
      title: 'View Request'
    },
    {
      action: 'dismiss',
      title: 'Dismiss'
    }
  ]
};
```

## Testing

### 1. Development Testing

1. Start your development server
2. Sign in to the application
3. Grant notification permission when prompted
4. Check browser console for "Push notifications enabled"
5. Verify device token is saved in MongoDB

### 2. Browser Developer Tools

- **Application Tab** → **Service Workers**: Check if SW is registered
- **Application Tab** → **Push Messaging**: View subscription details
- **Console**: Check for errors or success messages

### 3. Manual Notification Test

Use browser developer tools to test:

```javascript
// In browser console
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test', {
    body: 'This is a test notification',
    icon: '/icon-192.png'
  });
});
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - User blocked notifications in browser settings
   - Solution: Guide user to enable in browser settings

2. **Service Worker Registration Failed**
   - Check if `sw.js` exists in `/public/` directory
   - Verify no JavaScript errors in service worker

3. **Invalid VAPID Keys**
   - Ensure keys are correctly copied from generation
   - Check environment variable names match exactly

4. **Network Errors**
   - Verify API endpoints are accessible
   - Check authentication is working

### Browser Support

Web Push is supported in:
- Chrome 50+
- Firefox 44+
- Safari 16+ (macOS 13+, iOS 16.4+)
- Edge 17+

### HTTPS Requirement

Web Push notifications require HTTPS in production. For development:
- `localhost` works with HTTP
- Use ngrok or similar for HTTPS testing

## Security Considerations

1. **VAPID Keys**
   - Keep private key secure and server-side only
   - Rotate keys periodically in production

2. **Device Tokens**
   - Hide from API responses (implemented in User model)
   - Clean up invalid/expired tokens regularly

3. **User Consent**
   - Always request permission explicitly
   - Provide clear opt-out mechanisms

4. **Rate Limiting**
   - Implement rate limiting for notification APIs
   - Prevent spam and abuse

## Production Deployment

### Environment Variables

Ensure all environment variables are set:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_production_public_key
VAPID_PRIVATE_KEY=your_production_private_key
```

### HTTPS Setup

1. Configure SSL certificate
2. Update NEXTAUTH_URL to HTTPS
3. Test notifications on production domain

### Monitoring

Consider implementing:
- Notification delivery tracking
- Failed token cleanup
- User engagement metrics

## Integration with TransportFlow

### Use Cases

1. **Truck Requests**: Notify dispatchers of new requests
2. **Assignment Updates**: Alert drivers of new assignments
3. **Priority Changes**: Immediate alerts for urgent loads
4. **System Status**: Maintenance or downtime notifications

### Role-based Notifications

```javascript
// Example: Send to all dispatchers
const dispatchers = await User.find({ role: 'dispatcher' });
const tokens = dispatchers.flatMap(user => user.deviceTokens);

// Send notification to all dispatcher tokens
tokens.forEach(token => {
  sendNotification(token, payload);
});
```

## Future Enhancements

1. **Rich Notifications**: Images, progress bars, reply options
2. **Notification Categories**: User preferences for types
3. **Delivery Receipts**: Track if notifications were delivered
4. **Scheduled Notifications**: Send at optimal times
5. **A/B Testing**: Test different notification formats

## Resources

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Push API Specification](https://w3c.github.io/push-api/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Specification](https://tools.ietf.org/html/draft-thomson-webpush-vapid-02)