-- Restore Deleted Members
-- Run this in Supabase SQL Editor to restore all deleted members

-- 1. Check current deleted members
SELECT uid, email, name, status 
FROM users 
WHERE status = 'Deleted';

-- 2. Restore all deleted members (set status back to 'In Progress')
UPDATE users 
SET status = 'In Progress'
WHERE status = 'Deleted' 
  AND role = 'member';

-- 3. Verify they are restored
SELECT uid, email, name, role, status 
FROM users 
WHERE role = 'member'
ORDER BY join_date DESC;

-- 4. Check count
SELECT COUNT(*) as active_members
FROM users 
WHERE role = 'member' 
  AND status != 'Deleted';
