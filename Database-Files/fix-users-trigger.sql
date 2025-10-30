-- Fix the updated_at trigger issue for users table
-- Option 1: Drop the trigger (simpler)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Option 2: Or add the updated_at column if you want to track updates
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- Then recreate the trigger:
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
