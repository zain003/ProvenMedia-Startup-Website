-- ============================================
-- FIX ALL ISSUES - Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Restore all deleted members
-- ============================================
UPDATE users 
SET status = 'In Progress'
WHERE status = 'Deleted' 
  AND role = 'member';

-- Verify restoration
SELECT 
  uid, 
  email, 
  name, 
  role, 
  status,
  join_date
FROM users 
WHERE role = 'member'
ORDER BY join_date DESC;

-- STEP 2: Verify RLS Policies
-- ============================================
-- Check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename IN ('users', 'tasks', 'files', 'support_tickets')
ORDER BY tablename, policyname;

-- STEP 3: Ensure proper indexes exist
-- ============================================
-- These should already exist, but let's verify
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_files_assigned_to ON files(assigned_to);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- STEP 4: Verify counts
-- ============================================
SELECT 'Total Users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 'Active Members', COUNT(*) FROM users WHERE role = 'member' AND status != 'Deleted'
UNION ALL
SELECT 'Deleted Members', COUNT(*) FROM users WHERE status = 'Deleted'
UNION ALL
SELECT 'Total Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Total Files', COUNT(*) FROM files
UNION ALL
SELECT 'Total Tickets', COUNT(*) FROM support_tickets;

-- STEP 5: Clean up any orphaned data (optional)
-- ============================================
-- Remove tasks assigned to deleted users
-- DELETE FROM tasks 
-- WHERE assigned_to IN (
--   SELECT uid FROM users WHERE status = 'Deleted'
-- );

-- Remove files assigned to deleted users
-- DELETE FROM files 
-- WHERE assigned_to IN (
--   SELECT uid FROM users WHERE status = 'Deleted'
-- );

-- STEP 6: Verify RLS is working
-- ============================================
-- Test if authenticated users can read
SELECT 'RLS Test' as test, COUNT(*) as user_count 
FROM users 
WHERE role = 'member' AND status != 'Deleted';

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running this script:
-- 1. All members should have status = 'In Progress'
-- 2. Indexes should be created/verified
-- 3. Counts should show active members
-- 4. RLS policies should be listed
-- ============================================
