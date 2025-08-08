# Fix Internal Server Error - Quick Guide

## The Issue
The "Internal Server Error" is occurring because the authentication system requires proper configuration of Google OAuth credentials and NextAuth secret.

## Quick Fix Options

### Option 1: Configure Authentication (Recommended)

1. **Generate NextAuth Secret** (Run in terminal):
   ```bash
   openssl rand -base64 32
   ```

2. **Update your `.env.local` file** with at minimum:
   ```env
   NEXTAUTH_SECRET=paste-your-generated-secret-here
   ```

3. **For Google Sign-in**, you'll also need:
   - Go to https://console.cloud.google.com/
   - Create OAuth 2.0 credentials
   - Add to `.env.local`:
     ```env
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```

### Option 2: Access Dashboard Directly (Demo Mode)

While setting up authentication, you can access the dashboard directly:

1. Visit: http://localhost:3000/dashboard
2. This will show the dashboard with demo data

## Available Pages (Direct Access)

You can access these pages directly without authentication:

- **Main Dashboard**: http://localhost:3000/dashboard
- **A/B Testing**: http://localhost:3000/dashboard/ab-testing
- **Cohort Analysis**: http://localhost:3000/dashboard/cohorts
- **Segmentation**: http://localhost:3000/dashboard/segments
- **Brand Customization**: http://localhost:3000/dashboard/branding

## Common Error Solutions

### Error: "Internal Server Error" on homepage
**Cause**: Missing NEXTAUTH_SECRET
**Fix**: Add NEXTAUTH_SECRET to .env.local

### Error: "Configuration" on sign-in
**Cause**: Invalid or missing Google OAuth credentials
**Fix**: Add valid GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

### Error: Cannot read properties of undefined
**Cause**: Missing environment variables
**Fix**: Ensure all required variables are in .env.local

## Minimal Working Configuration

For the quickest fix, add this to your `.env.local`:

```env
# Minimum required to stop Internal Server Error
NEXTAUTH_SECRET=any-random-string-for-development

# Keep existing WebSocket config
NEXT_PUBLIC_WS_URL=http://localhost:3001
WS_PORT=3001

# Add these later for Google sign-in
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
```

## After Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/dashboard

3. Explore all the features with demo data!

## Need More Help?

Check the detailed `SETUP_GUIDE.md` for complete configuration instructions.