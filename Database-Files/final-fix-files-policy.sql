-- Final fix for files table RLS policy
-- This will allow authenticated users to insert files

-- Drop all existing policies on files table
DROP POLICY IF EXISTS "Authenticated users can view files" ON files;
DROP POLICY IF EXISTS "Authenticated users can insert files" ON files;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON files;

-- Recreate policies with proper configuration
CREATE POLICY "Allow all for authenticated users" ON files
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
