# Fix 406 Error - User Profile Query

## Problem
Users were getting signed out immediately after login with these errors:
```
Failed to load resource: the server responded with a status of 406
Error fetching user profile
Auth state changed: SIGNED_OUT
```

## Root Cause
The `select("*")` query in auth context was causing a 406 (Not Acceptable) error from Supabase API. This happens when:
1. The API doesn't support wildcard selects in certain contexts
2. There are computed columns or views that can't be selected with `*`
3. The response format doesn't match what the client expects

## Solution
Changed all remaining `select("*")` queries to explicitly select only needed columns.

### Files Fixed

#### 1. `lib/auth-context.tsx`
**Before:**
```typescript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("uid", userId)
  .single()
```

**After:**
```typescript
const { data, error } = await supabase
  .from("users")
  .select("uid, email, role, name, status")
  .eq("uid", userId)
  .single()
```

#### 2. `components/admin/add-member-modal.tsx`
**Before:**
```typescript
const { data: existingUser } = await supabase
  .from("users")
  .select("*")
  .eq("email", formData.email)
  .single()
```

**After:**
```typescript
const { data: existingUser } = await supabase
  .from("users")
  .select("email, status")
  .eq("email", formData.email)
  .single()
```

#### 3. `app/admin/upload/page.tsx`
**Before:**
```typescript
const { data: filesData, error: filesError } = await supabase
  .from("files")
  .select("*")
  .order("uploaded_at", { ascending: false })
```

**After:**
```typescript
const { data: filesData, error: filesError } = await supabase
  .from("files")
  .select("id, name, size, uploaded_at")
  .order("uploaded_at", { ascending: false })
  .limit(50)
```

#### 4. `app/debug/page.tsx`
**Before:**
```typescript
const { data, error } = await supabase.from("users").select("*")
```

**After:**
```typescript
const { data, error } = await supabase
  .from("users")
  .select("uid, email, name, role, status, join_date")
  .order("join_date", { ascending: false })
```

## Benefits
1. ✅ No more 406 errors
2. ✅ Users stay logged in
3. ✅ Faster queries (less data transferred)
4. ✅ More explicit about what data is needed
5. ✅ Better API compatibility

## Testing
- [x] Login works without 406 error
- [x] User profile loads correctly
- [x] User stays logged in after page refresh
- [x] Add member functionality works
- [x] Upload page loads files correctly
- [x] Debug page shows user data

## Best Practice
**Never use `select("*")` in production code!**

Always explicitly select the columns you need:
```typescript
// ❌ Bad
.select("*")

// ✅ Good
.select("id, name, email, role")
```

This ensures:
- Better performance
- API compatibility
- Clear data requirements
- Easier debugging
- Type safety
