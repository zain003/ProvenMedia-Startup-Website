-- Check if RLS policies are causing slow queries
-- Run this in Supabase SQL Editor

-- Check current RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- Test query performance (should be fast)
EXPLAIN ANALYZE
SELECT * FROM users WHERE uid = 'test-uid-123';

-- Check if there are any indexes on uid column
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'users';
