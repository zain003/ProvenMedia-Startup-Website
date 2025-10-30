-- Verify all tables exist with correct columns
-- Run this in Supabase SQL Editor

-- Check if files table exists and show its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- If the above returns no rows, the files table doesn't exist
-- Run the complete supabase-schema.sql file to create all tables

-- Check if the table exists at all
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tasks', 'files', 'support_tickets');
