-- Fix the updated_at trigger issue for tasks table
-- Run this in Supabase SQL Editor

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Optional: If you want to track when tasks are updated, add the column first
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Then recreate the trigger (only if you added the column above)
-- CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
