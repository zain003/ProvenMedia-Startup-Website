-- Add missing original_name column to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS original_name TEXT NOT NULL DEFAULT '';

-- Update the default to allow NULL temporarily for existing rows
ALTER TABLE files ALTER COLUMN original_name DROP DEFAULT;
ALTER TABLE files ALTER COLUMN original_name DROP NOT NULL;
