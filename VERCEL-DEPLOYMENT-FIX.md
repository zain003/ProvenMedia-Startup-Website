# Vercel Deployment Issues - Fix Guide

## Issue: Can't Login After Team Page Hung

### What Happened
1. Logged in successfully
2. Went to "Manage Team" page
3. Page kept loading indefinitely
4. Refreshed and still loading
5. Went back to login - now can't login (400 error)

### Root Cause
The team page query hung/timed out, which may have corrupted the session. The browser still has the old session cookie that's now invalid.

## Quick Fix

### Step 1: Clear Browser Data
1. Open your Vercel app URL
2. Press **F12** to open DevTools
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click **Clear site data** or:
   - Expand **Cookies**
   - Delete all cookies for your domain
   - Expand **Local Storage**
   - Delete all items
   - Expand **Session Storage**
   - Delete all items
5. Close DevTools
6. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
7. Try logging in again

### Step 2: Try Incognito/Private Mode
1. Open an incognito/private window
2. Go to your Vercel URL
3. Try logging in
4. If it works, the issue was cached data

### Step 3: Check Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Make sure these are set:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/**
http://localhost:3000/**
```

### Step 4: Verify Environment Variables

In Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Make sure:
- ✅ No trailing slash in URL
- ✅ Both variables are set for Production
- ✅ Values match your Supabase project

### Step 5: Redeploy

After fixing environment variables:
1. Go to Vercel → Deployments
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Wait for completion
5. Try again

## Code Fixes Applied

### 1. Team Page Timeout Protection
Added 10-second timeout to prevent infinite loading:
```typescript
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Request timeout')), 10000)
)
```

### 2. Better Error Handling
Shows alert if query fails instead of hanging forever.

### 3. Loading State Management
Properly sets loading to false even on errors.

## Testing Steps

### 1. Test Login
```
1. Clear browser data
2. Go to your Vercel URL
3. Enter credentials
4. Should redirect to dashboard
```

### 2. Test Team Page
```
1. Click "Manage Team"
2. Should load within 2-3 seconds
3. If timeout, shows error alert
4. Can go back and try again
```

### 3. Test Add Member
```
1. Click "Add Member"
2. Fill form
3. Submit
4. Should stay logged in
5. Member appears in list
```

## Common Errors & Solutions

### Error: "Failed to load resource: 400"
**Cause:** Invalid Supabase credentials or wrong URL format

**Fix:**
1. Check environment variables in Vercel
2. Verify Supabase URL has no trailing slash
3. Verify anon key is correct
4. Redeploy

### Error: "Request timeout"
**Cause:** Supabase query taking too long

**Fix:**
1. Check Supabase Dashboard → Database → Query Performance
2. Verify indexes exist (run FIX-ALL-ISSUES.sql)
3. Check Supabase project region (should be close to you)
4. Try again - might be temporary network issue

### Error: "User profile not found"
**Cause:** User exists in Auth but not in database

**Fix:**
1. Go to Supabase → SQL Editor
2. Run:
```sql
SELECT * FROM users WHERE uid = 'your-user-id';
```
3. If no result, the profile is missing
4. Re-create the user or add profile manually

### Error: Page keeps loading forever
**Cause:** Query hanging or infinite loop

**Fix:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check browser console for errors
4. Check Network tab for stuck requests

## Database Verification

### Check if members exist:
```sql
SELECT COUNT(*) FROM users 
WHERE role = 'member' AND status != 'Deleted';
```

### Check admin user:
```sql
SELECT * FROM users WHERE role = 'admin';
```

### Restore deleted members:
```sql
UPDATE users 
SET status = 'In Progress'
WHERE status = 'Deleted' AND role = 'member';
```

## Performance on Vercel

### Expected Load Times
- Login page: < 1 second
- Dashboard: 1-2 seconds
- Team page: 1-2 seconds
- Other pages: 1-2 seconds

### If Slower
1. Check Supabase region
2. Check database indexes
3. Check query performance in Supabase Dashboard
4. Check Vercel function logs for errors

## Debugging Tools

### 1. Browser Console
```
F12 → Console tab
Look for red errors
```

### 2. Network Tab
```
F12 → Network tab
Refresh page
Look for:
- Failed requests (red)
- Slow requests (> 2 seconds)
- 400/401/403 errors
```

### 3. Vercel Logs
```
Vercel Dashboard → Your Project → Logs
Look for runtime errors
```

### 4. Supabase Logs
```
Supabase Dashboard → Logs
Look for failed queries
```

## Summary

✅ **Fixes Applied:**
- Added timeout protection to team page
- Better error handling
- Proper loading state management

⚠️ **Action Required:**
1. Clear browser data
2. Verify Supabase Auth URLs
3. Verify Vercel environment variables
4. Redeploy if needed

🔧 **To Fix Login:**
1. Clear cookies and cache
2. Try incognito mode
3. Check environment variables
4. Redeploy

The code is now more robust and won't hang forever. The login issue is likely just cached session data that needs to be cleared.
