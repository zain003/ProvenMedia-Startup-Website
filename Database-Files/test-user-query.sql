-- Test if we can query the users table
-- Run this in Supabase SQL Editor

-- Check if the user exists
SELECT * FROM users WHERE uid = '51f8f28d-66bb-4fc4-bf0e-b0ac2e0909ed';

-- Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- If the first query returns no rows, the user profile doesn't exist
-- If it returns a row, check if RLS is blocking it
