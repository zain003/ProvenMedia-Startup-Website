-- Clean up users with "Deleted" status
-- Run this in Supabase SQL Editor to remove old deleted users

DELETE FROM users WHERE status = 'Deleted';

-- Check for duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- If you see duplicates, you can delete them by keeping only the most recent one:
-- DELETE FROM users
-- WHERE id NOT IN (
--   SELECT DISTINCT ON (email) id
--   FROM users
--   ORDER BY email, created_at DESC
-- );
