# 🚀 Google Analytics Dashboard SaaS - Setup Guide

## ⚡ Quick Setup (5 minutes)

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Analytics Data API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials" 
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret

### 2. Environment Variables

Update your `.env.local` file:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-replace-in-production

# Google OAuth Configuration (REQUIRED)
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# Database Configuration (for full functionality)
DATABASE_URL="postgresql://username:password@localhost:5432/google_analytics_dashboard"
```

### 3. Database Setup (Optional for Demo)

For full functionality, set up PostgreSQL:

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb google_analytics_dashboard

# Run Prisma migrations
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Application

```bash
npm run dev
```

## 🎯 Features Available

### ✅ Without Database (Demo Mode)
- Beautiful landing page
- Dashboard UI with sample data
- Sign-in page with Google OAuth setup
- Responsive design and themes

### ✅ With Google OAuth Setup
- Real Google authentication
- Redirect to dashboard after sign-in
- Session management
- User profile display

### ✅ With Full Database Setup
- User data persistence
- Dashboard configurations
- Widget settings storage
- Subscription management (ready for Stripe)

## 🔧 Troubleshooting

### OAuth Not Working?
1. Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Verify redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`
3. Ensure Google Analytics Data API is enabled

### Database Issues?
1. The app works without a database in demo mode
2. For full functionality, ensure PostgreSQL is running
3. Check `DATABASE_URL` format is correct
4. Run `npx prisma migrate dev` to create tables

### Still Having Issues?
- Check the browser console for errors
- Verify all environment variables are set
- Make sure `npm run dev` shows no startup errors

## 🚀 What's Next?

Once running, you can:
1. **Demo Mode**: Click "View Demo Dashboard" to see the interface
2. **With OAuth**: Click "Continue with Google" for real authentication  
3. **Development**: Add Chart.js integration, real GA data fetching, and more features

The MVP foundation is complete and ready for your enhancements! 🎉