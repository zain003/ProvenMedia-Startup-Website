-- Fix the INSERT policy for files table
-- The WITH CHECK clause was missing

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Authenticated users can insert files" ON files;

-- Recreate with proper WITH CHECK clause
CREATE POLICY "Authenticated users can insert files" ON files
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
