# 🔧 Setup Real Google Analytics Integration

## Current Status
The application is currently showing dummy data because it's not properly connected to real Google Analytics. Here's how to fix it:

## 📋 Prerequisites

### 1. Google Account with Analytics Access
You need a Google account that has:
- Access to at least one Google Analytics 4 (GA4) property
- Admin or Editor permissions on that property

### 2. Google Cloud Console Project
You need a Google Cloud project with:
- Google Analytics Data API enabled
- Google Analytics Admin API enabled
- OAuth 2.0 credentials configured

## 🛠 Step-by-Step Setup

### Step 1: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create or Select Project**
   - Create a new project or use existing one
   - Note the project ID

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - ✅ Google Analytics Data API
     - ✅ Google Analytics Admin API
     - ✅ Google Analytics Reporting API (optional but recommended)

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:3002/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (fallback)
   - Copy the Client ID and Client Secret

5. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (unless you have a Google Workspace)
   - Fill in required fields:
     - Application name: "Analytics Pro Dashboard"
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/analytics.readonly`
     - `https://www.googleapis.com/auth/analytics.manage.users.readonly`
   - Add test users (your Google account)

### Step 2: Update Environment Variables

Update `.env.local` with your real credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Step 3: Verify Google Analytics Setup

Make sure you have:
- A Google Analytics 4 property (not Universal Analytics)
- Data in your GA4 property (at least a few days of traffic)
- Proper permissions on the property

### Step 4: Test the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Go to debug page:**
   ```
   http://localhost:3002/debug
   ```

3. **Test authentication flow:**
   - Click "Sign in with Google"
   - Grant all requested permissions
   - Check session info shows access tokens

4. **Test properties API:**
   - Click "Test Properties API"
   - Should show your real GA4 properties

## 🐛 Troubleshooting Common Issues

### Issue 1: "redirect_uri_mismatch"
**Problem:** OAuth redirect URI doesn't match Google Cloud Console settings
**Solution:** 
- Check the exact redirect URI in error message
- Add it to Google Cloud Console > Credentials > OAuth 2.0 Client
- Common URIs to add:
  - `http://localhost:3000/api/auth/callback/google`
  - `http://localhost:3002/api/auth/callback/google`

### Issue 2: "access_denied" 
**Problem:** User didn't grant Analytics permissions
**Solution:**
- Sign out and sign in again
- Make sure to grant all requested permissions
- Check OAuth consent screen has correct scopes

### Issue 3: "No properties found"
**Problem:** Account has no GA4 properties or insufficient permissions
**Solution:**
- Verify you have GA4 (not Universal Analytics)
- Check you have at least "Viewer" access to properties
- Try with a different Google account that has GA access

### Issue 4: "Invalid credentials"
**Problem:** Client ID/Secret are wrong or APIs not enabled
**Solution:**
- Double-check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify APIs are enabled in Google Cloud Console
- Make sure OAuth client is not restricted

## 🔍 Debug Steps

### 1. Check Session Debug Info
Visit `http://localhost:3002/debug` and verify:
- ✅ `hasSession: true`
- ✅ `hasAccessToken: true` 
- ✅ `hasRefreshToken: true`

### 2. Check Server Console
Look for these log messages:
```
🔍 Properties API: Attempting to fetch Google Analytics properties...
✅ Properties API: Successfully fetched real GA properties: X
```

If you see error messages, they'll help identify the issue.

### 3. Test Properties API Directly
```bash
curl http://localhost:3002/api/analytics/properties
```

Should return your real GA properties, not dummy data.

## ✅ Expected Results After Proper Setup

1. **Debug Page Shows:**
   - Session with access tokens ✅
   - Real GA properties in API test ✅

2. **Dashboard Shows:**
   - "Real Google Analytics data" message ✅
   - Your actual property names in dropdown ✅
   - Real metrics from your GA account ✅

3. **Console Shows:**
   - Successful API calls to Google Analytics ✅
   - No "falling back to demo data" messages ✅

## 🚀 Next Steps

Once you have the credentials and GA4 property:

1. Update the environment variables with your real credentials
2. Restart the development server
3. Test the authentication flow
4. Verify real data is displayed in the dashboard

## 📞 Need Help?

If you're still seeing dummy data after following these steps:

1. Share the output from `/debug` page
2. Check browser console for any JavaScript errors
3. Check server console for API error messages
4. Verify your GA4 property has recent data

The integration is fully implemented - it just needs proper Google Cloud Console setup and a real GA4 property to connect to!