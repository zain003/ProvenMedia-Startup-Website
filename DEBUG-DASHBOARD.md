# Debug Dashboard - No Members Showing

## Issue
Dashboard shows "0" for team members count even though members were created.

## Possible Causes

### 1. Members Not Actually in Database
**Check:** Run this SQL in Supabase SQL Editor:
```sql
SELECT uid, email, name, role, status 
FROM users 
WHERE role = 'member';
```

**Expected:** Should show all members with their status

### 2. Members Have Wrong Status
**Check:** Run this SQL:
```sql
SELECT status, COUNT(*) 
FROM users 
WHERE role = 'member' 
GROUP BY status;
```

**Expected:** Should show counts by status (e.g., "In Progress": 2)

### 3. Query Not Working
**Check:** Look at browser console for:
```
Dashboard stats: {
  teamCount: X,
  filesCount: Y,
  tasksCount: Z,
  ticketsCount: W
}
```

**Expected:** teamCount should be > 0 if members exist

## Debugging Steps

### Step 1: Check Database
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select "users" table
4. Look for rows where `role = 'member'`
5. Check their `status` column

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the admin dashboard
4. Look for "Dashboard stats:" log
5. Check what `teamCount` shows

### Step 3: Verify Query
Run this in Supabase SQL Editor:
```sql
-- This is exactly what the dashboard runs
SELECT COUNT(*) 
FROM users 
WHERE role = 'member' 
  AND status != 'Deleted';
```

### Step 4: Check Member Creation
After adding a member, immediately run:
```sql
SELECT * FROM users 
WHERE email = 'the-email-you-just-added@example.com';
```

Check:
- ✓ Row exists?
- ✓ `role` = 'member'?
- ✓ `status` = 'In Progress'?
- ✓ `uid` matches Auth user ID?

## Quick Fix Options

### Option A: If Members Don't Exist
The user creation is failing silently. Check:
1. RLS policies are applied (run `fix-rls-policies.sql`)
2. Admin session is being restored
3. No errors in console during member creation

### Option B: If Members Exist But Wrong Status
Update their status:
```sql
UPDATE users 
SET status = 'In Progress' 
WHERE role = 'member' 
  AND status IS NULL;
```

### Option C: If Query Issue
The dashboard query might be cached. Try:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server

## What to Report

Please check and report:
1. **How many members in database?**
   ```sql
   SELECT COUNT(*) FROM users WHERE role = 'member';
   ```

2. **What are their statuses?**
   ```sql
   SELECT status, COUNT(*) FROM users WHERE role = 'member' GROUP BY status;
   ```

3. **What does console show?**
   Look for "Dashboard stats:" in browser console

4. **Any errors?**
   Check console for red error messages

## Expected Behavior

After adding a member:
- Database should have a row in `users` table
- `role` should be 'member'
- `status` should be 'In Progress'
- Dashboard should show count > 0
- Team management page should list the member

## Files to Check

- `app/admin/page.tsx` - Dashboard (just added debug logging)
- `app/admin/team/page.tsx` - Team list
- `components/admin/add-member-modal.tsx` - Member creation
- `Database-Files/check-members.sql` - SQL queries to check data
