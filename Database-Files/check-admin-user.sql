-- Check if admin user exists in database
-- Run this in Supabase SQL Editor to verify your admin user

-- Check users table
SELECT * FROM users WHERE email = 'zain@provenmedia.nl';

-- If the above returns no rows, you need to add the user profile
-- First, get the user ID from Auth:
-- Go to Authentication > Users in Supabase dashboard
-- Find zain@provenmedia.nl and copy the User ID
-- Then run this (replace PASTE-USER-ID-HERE with the actual UUID):

-- INSERT INTO users (uid, email, name, role, status, join_date)
-- VALUES ('PASTE-USER-ID-HERE', 'zain@provenmedia.nl', 'Zain', 'admin', 'active', NOW());
