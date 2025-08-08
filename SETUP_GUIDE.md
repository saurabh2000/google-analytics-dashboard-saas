# Google Analytics Dashboard - Setup Guide

## Environment Configuration

To fix the "Internal Server Error", you need to configure your environment variables properly. Follow these steps:

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Analytics API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Reporting API"
   - Click on it and press "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-domain.com/api/auth/callback/google`
   - Copy the Client ID and Client Secret

### 2. NextAuth Secret

Generate a secure random string for NextAuth:

```bash
# Run this command in your terminal
openssl rand -base64 32
```

### 3. Update .env.local

Replace the placeholder values in your `.env.local` file:

```env
# WebSocket Configuration for Real-time Collaboration
NEXT_PUBLIC_WS_URL=http://localhost:3001
WS_PORT=3001

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id-from-google
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-from-openssl

# Database URL (optional - only if using external database)
# DATABASE_URL="postgresql://user:password@localhost:5432/analytics_db"
```

### 4. Vercel Deployment Configuration

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the environment variables from `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (set to your production URL)
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_WS_URL` (optional for production)

### 5. Test Your Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000
3. Try signing in with Google

## Troubleshooting

### Common Issues:

1. **"Internal Server Error" on sign-in page**
   - Make sure `NEXTAUTH_SECRET` is set
   - Verify Google OAuth credentials are correct
   - Check that redirect URIs match exactly

2. **"Configuration" error**
   - Double-check your Google Client ID and Secret
   - Ensure the Google Analytics API is enabled

3. **Cannot connect to Google Analytics**
   - Make sure your Google account has access to Google Analytics
   - The OAuth scope includes analytics.readonly permission

### Demo Mode

If you want to use the dashboard without Google Analytics connection:
- Navigate directly to `/dashboard` 
- The dashboard will show demo data

## Features Available

Once configured, you'll have access to:

1. **Main Dashboard** - Real-time analytics with KPI cards
2. **A/B Testing** - Create and analyze A/B tests with statistical significance
3. **Cohort Analysis** - Track user retention and lifetime value
4. **Advanced Segmentation** - Geographic, behavioral, and demographic analysis
5. **White-Label Customization** - Customize branding, colors, and logos
6. **Real-time Collaboration** - Multiple users can view and interact simultaneously
7. **Custom Alerts** - Set up threshold-based notifications

## Need Help?

If you continue to experience issues:

1. Check the browser console for specific error messages
2. Check the terminal/server logs for backend errors
3. Verify all environment variables are set correctly
4. Make sure you're using Node.js version 18 or higher

## Next Steps

After successful configuration:

1. Connect your Google Analytics property
2. Explore the demo data and features
3. Create custom alerts for your KPIs
4. Set up A/B tests for your campaigns
5. Analyze user cohorts and retention
6. Customize the branding to match your organization