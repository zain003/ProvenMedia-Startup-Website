-- Debug: Check users table structure and data
-- Run this in Supabase SQL Editor

-- 1. Check table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check all users with their IDs
SELECT id, uid, email, name, role, status FROM users;

-- 3. Check if 'id' is the primary key
SELECT constraint_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'users' AND constraint_name LIKE '%pkey%';
