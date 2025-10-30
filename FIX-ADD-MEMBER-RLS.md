# Fix Add Member RLS Error

## Problem
When admin tries to add a new member, getting error:
```
401 (Unauthorized)
new row violates row-level security policy for table "users"
```

Also, newly created users get signed out immediately because their profile doesn't exist yet.

## Root Causes

### 1. RLS Policy Issue
The current RLS policy allows inserts, but when `signUp()` is called, it changes the session to the new user. The new user then tries to insert their own profile, but they're not authenticated yet in the database context.

### 2. Auth Context Issue
When a new user is created, the auth context tries to fetch their profile immediately, doesn't find it, and signs them out.

## Solutions Applied

### Solution 1: Fix Auth Context (lib/auth-context.tsx)
Changed the behavior when profile is not found:

**Before:**
```typescript
if (error.code === 'PGRST116') {
  setError("User profile not found. Please contact administrator.")
  await supabase.auth.signOut() // ❌ Signs out immediately
}
```

**After:**
```typescript
if (error.code === 'PGRST116') {
  console.warn("User profile not found for:", userId)
  setError("Setting up your profile... Please wait.")
  setUserProfile(null)
  // ✅ Don't sign out - let the user creation process complete
}
```

### Solution 2: Update RLS Policies (Database-Files/fix-rls-policies.sql)
Run this SQL in Supabase SQL Editor:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON users;

-- Recreate with proper permissions
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert users" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update users" ON users
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete users" ON users
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);
```

### Solution 3: Alternative Approach - Use Service Role Key

If the above doesn't work, you can use the Supabase Service Role key for admin operations.

**Create a new file: `lib/supabase-admin.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Admin client bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

**Add to `.env.local`:**
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Update add-member-modal.tsx:**
```typescript
import { supabaseAdmin } from '@/lib/supabase-admin'

// In handleSubmit:
// Create user with admin client (bypasses RLS)
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: formData.email,
  password: formData.password,
  email_confirm: true,
  user_metadata: {
    name: formData.name,
  }
})

// Insert profile with admin client
const { error: dbError } = await supabaseAdmin.from("users").insert({
  uid: authData.user.id,
  name: formData.name,
  email: formData.email,
  role: "member",
  status: "In Progress",
  join_date: new Date().toISOString(),
})
```

## Recommended Approach

**Option A: Fix RLS Policies (Simpler)**
1. Run the SQL script in `Database-Files/fix-rls-policies.sql`
2. The auth context changes are already applied
3. Test adding a member

**Option B: Use Service Role Key (More Secure)**
1. Get your Service Role key from Supabase Dashboard → Settings → API
2. Add it to `.env.local`
3. Create `lib/supabase-admin.ts`
4. Update `add-member-modal.tsx` to use admin client
5. This ensures only server-side code can bypass RLS

## Testing Steps

1. **Run the RLS fix SQL:**
   - Go to Supabase Dashboard → SQL Editor
   - Paste contents of `Database-Files/fix-rls-policies.sql`
   - Click "Run"

2. **Test adding a member:**
   - Login as admin
   - Go to Manage Team
   - Click "Add Member"
   - Fill in details and submit
   - Should succeed without 401 error

3. **Verify admin stays logged in:**
   - After adding member, admin should remain logged in
   - Check that new member appears in team list

4. **Test new member login:**
   - Logout
   - Login with new member credentials
   - Should login successfully and see member dashboard

## Current Status

✅ Auth context updated to not sign out immediately
✅ RLS fix SQL script created
⏳ Need to run SQL script in Supabase
⏳ Need to test member creation

## Next Steps

1. Run `Database-Files/fix-rls-policies.sql` in Supabase SQL Editor
2. Test adding a new member
3. If still getting 401, implement Option B (Service Role Key)
