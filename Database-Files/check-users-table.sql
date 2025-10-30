-- Check the users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check what columns are being used as identifiers
SELECT id, uid, email, name, role, status FROM users LIMIT 5;
