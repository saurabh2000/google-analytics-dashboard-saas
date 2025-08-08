# Fix Google OAuth on Vercel - Step by Step

## The Problem
"The Google OAuth configuration may be incomplete" error on Vercel deployment.

## Solution Steps

### 1. Get Your Vercel Domain
First, find your Vercel deployment URL:
- Go to your Vercel dashboard
- Find your project URL (e.g., `https://google-analytics-xyz123.vercel.app`)

### 2. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click on your OAuth 2.0 Client ID
4. In **Authorized JavaScript origins**, add:
   ```
   https://your-vercel-domain.vercel.app
   ```
5. In **Authorized redirect URIs**, add:
   ```
   https://your-vercel-domain.vercel.app/api/auth/callback/google
   ```
6. Click **Save**

### 3. Configure Vercel Environment Variables

In your Vercel dashboard:
1. Go to **Settings > Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

**Important**: Replace `your-vercel-domain` with your actual Vercel domain.

### 4. Redeploy Your Application

After adding environment variables:
1. Go to your Vercel project dashboard
2. Click **Deployments** tab
3. Find the latest deployment and click the **3 dots menu**
4. Click **Redeploy** 
5. Wait for deployment to complete

### 5. Test the Fix

1. Visit your Vercel URL: `https://your-vercel-domain.vercel.app`
2. Try to sign in with Google
3. Check the browser console and Vercel function logs for any errors

## Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch" 
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

### Issue 2: Environment variables not loading
**Solution**: 
- Make sure variables are added to ALL environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names for typos

### Issue 3: NEXTAUTH_URL incorrect
**Solution**: Use your exact Vercel domain:
```
NEXTAUTH_URL=https://google-analytics-xyz123.vercel.app
```

### Issue 4: Still getting "configuration incomplete" error
**Solution**: 
1. Check Vercel function logs in dashboard
2. Ensure Google Analytics API is enabled in Google Cloud Console
3. Verify OAuth consent screen is configured

## Quick Checklist

- [ ] Google Cloud Console OAuth client configured with correct redirect URI
- [ ] All environment variables added to Vercel
- [ ] NEXTAUTH_URL matches exact Vercel domain
- [ ] Application redeployed after environment variable changes
- [ ] Google Analytics API enabled in Google Cloud Console
- [ ] OAuth consent screen configured (if needed)

## Debug Tips

1. Check Vercel function logs:
   - Go to Vercel dashboard > Functions tab
   - Look for OAuth-related errors

2. Enable debug mode by adding to Vercel environment variables:
   ```
   NEXTAUTH_DEBUG=true
   ```

3. Test locally first to ensure configuration works:
   ```bash
   npm run dev
   ```

If you're still having issues after following these steps, check the Vercel function logs for specific error messages.