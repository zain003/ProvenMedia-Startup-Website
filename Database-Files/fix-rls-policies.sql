-- Fix RLS Policies for User Creation
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON users;

-- Recreate policies with better permissions
-- Allow all authenticated users to view users
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert users (for admin adding members)
-- This allows any authenticated user to insert, we handle role checks in the app
CREATE POLICY "Authenticated users can insert users" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own profile, or any authenticated user (admin check in app)
CREATE POLICY "Authenticated users can update users" ON users
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete (admin check in app)
CREATE POLICY "Authenticated users can delete users" ON users
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
