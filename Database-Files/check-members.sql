-- Check Members in Database
-- Run this in Supabase SQL Editor to see all users

-- 1. Check all users
SELECT 
  uid,
  email,
  name,
  role,
  status,
  join_date
FROM users
ORDER BY join_date DESC;

-- 2. Check only members (not deleted)
SELECT 
  uid,
  email,
  name,
  role,
  status,
  join_date
FROM users
WHERE role = 'member' 
  AND status != 'Deleted'
ORDER BY join_date DESC;

-- 3. Count members by status
SELECT 
  status,
  COUNT(*) as count
FROM users
WHERE role = 'member'
GROUP BY status;

-- 4. Check if there are any members at all
SELECT COUNT(*) as total_members
FROM users
WHERE role = 'member';

-- 5. Check deleted members
SELECT 
  uid,
  email,
  name,
  status
FROM users
WHERE status = 'Deleted';
