# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the TransportFlow application.

## Prerequisites

- Google account
- Access to Google Cloud Console
- TransportFlow project running locally

## Step-by-Step Setup

### 1. Access Google Cloud Console

Visit the [Google Cloud Console](https://console.cloud.google.com/)

### 2. Create or Select Project

- Click "Select a project" dropdown
- Either select an existing project or click "New Project"
- For new project:
  - Project name: `transportflow-auth`
  - Organization: (optional)
  - Click "Create"

### 3. Enable Required APIs

- Navigate to "APIs & Services" → "Library"
- Search for "Google+ API" or "Google Identity Services API"
- Click on the API and press "Enable"

### 4. Configure OAuth Consent Screen

- Go to "APIs & Services" → "OAuth consent screen"
- Select "External" user type (unless you have Google Workspace)
- Fill out the required information:
  - **App name**: `TransportFlow`
  - **User support email**: Your email address
  - **App logo**: (optional)
  - **App domain**: (optional for development)
  - **Developer contact information**: Your email address
- Click "Save and Continue"
- On Scopes page: Click "Save and Continue" (default scopes are sufficient)
- On Test users page: Add test user emails if needed, then "Save and Continue"

### 5. Create OAuth 2.0 Credentials

- Navigate to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Configure the client:
  - **Application type**: Web application
  - **Name**: `TransportFlow Web Client`
  - **Authorized JavaScript origins**:
    - `http://localhost:3000` (for development)
    - `https://yourdomain.com` (for production)
  - **Authorized redirect URIs**:
    - `http://localhost:3000/api/auth/callback/google` (for development)
    - `https://yourdomain.com/api/auth/callback/google` (for production)
- Click "Create"

### 6. Save Your Credentials

After creation, you'll receive:
- **Client ID**: Format like `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: Format like `GOCSPX-AbCdEfGhIjKlMnOpQrSt`

**Important**: Keep these credentials secure and never commit them to version control.

### 7. Environment Configuration

Create a `.env.local` file in your project root directory:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string
```

### 8. Generate NextAuth Secret

For `NEXTAUTH_SECRET`, you can generate a secure random string using:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Continue with Google" button

4. You should be redirected to Google's OAuth consent screen

5. After authorization, you should be redirected back to your application

## Troubleshooting

### Common Issues

1. **"Error 400: redirect_uri_mismatch"**
   - Ensure the redirect URI in Google Console exactly matches your application's callback URL
   - Check for trailing slashes and protocol (http vs https)

2. **"Error 403: access_blocked"**
   - Your app is not verified by Google
   - For development, add test users in OAuth consent screen
   - For production, submit app for verification

3. **"Invalid client error"**
   - Check that Client ID and Client Secret are correctly set in `.env.local`
   - Ensure environment variables are loaded properly

### Debug Steps

1. Check environment variables are loaded:
   ```javascript
   console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...');
   ```

2. Verify redirect URI configuration in both:
   - Google Cloud Console
   - NextAuth configuration

3. Check browser network tab for detailed error messages

## Security Best Practices

- Never expose client secrets in client-side code
- Use environment variables for all sensitive data
- Regularly rotate your NextAuth secret
- Monitor OAuth usage in Google Cloud Console
- Set up proper CORS policies for production

## Production Deployment

When deploying to production:

1. Update redirect URIs in Google Console with your production domain
2. Update `NEXTAUTH_URL` in environment variables
3. Ensure SSL/TLS is properly configured
4. Submit app for Google verification if needed for public use

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)