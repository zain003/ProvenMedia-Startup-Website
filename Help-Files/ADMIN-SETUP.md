# Admin User Setup Guide

## Overview

This application uses Supabase for authentication and database. The admin user must be created manually in Supabase.

## Admin Credentials

**Email:** `zain@provenmedia.nl`  
**Password:** `Welkom26!`

## Setup Steps

### 1. Complete Supabase Configuration

Make sure you have:
- Created a Supabase project
- Updated `.env.local` with your credentials
- Run `supabase-schema.sql` in SQL Editor
- Created `files` storage bucket

### 2. Create Admin User in Supabase Auth

1. Open your Supabase dashboard
2. Go to **Authentication** → **Users**
3. Click **Add User** button
4. Fill in the form:
   - **Email:** `zain@provenmedia.nl`
   - **Password:** `Welkom26!`
   - **Auto Confirm User:** Yes (check this box)
5. Click **Create User**
6. **Important:** Copy the **User ID (UUID)** that appears in the user list

### 3. Add Admin Profile to Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL (replace `PASTE-USER-ID-HERE` with the UUID you copied):

```sql
INSERT INTO users (uid, email, name, role, status, join_date)
VALUES ('PASTE-USER-ID-HERE', 'zain@provenmedia.nl', 'Zain', 'admin', 'active', NOW());
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### 4. Verify Setup

1. Go to **Table Editor** → **users** table
2. You should see one row with:
   - email: `zain@provenmedia.nl`
   - role: `admin`
   - status: `active`

### 5. Test Login

1. Start your development server (if not running):
```bash
npm run dev
```

2. Open `http://localhost:3000/login`

3. Enter credentials:
   - Email: `zain@provenmedia.nl`
   - Password: `Welkom26!`

4. Click **Sign In**

5. You should be redirected to `/admin` dashboard

## How Authentication Works

1. **Login Process:**
   - User enters email and password at `/login`
   - Supabase Auth verifies credentials
   - If valid, creates a session

2. **Profile Loading:**
   - App fetches user profile from `users` table
   - Matches by `uid` (user ID from Auth)
   - Loads role, name, and status

3. **Role-Based Routing:**
   - If role is `admin` → redirect to `/admin`
   - If role is `member` → redirect to `/member`
   - If no profile found → show error

4. **Protected Routes:**
   - Middleware checks authentication
   - Admin routes require `role = 'admin'`
   - Member routes require `role = 'member'`

## Adding Team Members

Once logged in as admin:

1. Go to **Manage Team** in admin dashboard
2. Click **Add Member** button
3. Fill in the form:
   - Name
   - Email
   - Password
4. Click **Add Member**

This will:
- Create user in Supabase Auth
- Add profile to `users` table with `role = 'member'`
- Send them their credentials (you'll need to share manually)

## Troubleshooting

### "User profile not found" error

**Cause:** User exists in Auth but not in `users` table

**Solution:**
1. Go to Authentication → Users in Supabase
2. Find the user and copy their ID
3. Run the INSERT query in SQL Editor with their ID

### "Invalid login credentials" error

**Cause:** Wrong email or password, or user doesn't exist in Auth

**Solution:**
1. Verify email and password are correct
2. Check Authentication → Users in Supabase
3. If user doesn't exist, create them following Step 2 above

### Can't access admin dashboard

**Cause:** User profile has wrong role

**Solution:**
1. Go to Table Editor → users in Supabase
2. Find the user by email
3. Check the `role` column - it should be `admin`
4. If it's `member`, click to edit and change to `admin`

### Session expires immediately

**Cause:** Supabase configuration issue

**Solution:**
1. Check `.env.local` has correct values
2. Verify Supabase URL and anon key are correct
3. Restart dev server after changing env vars

## Security Notes

- Never commit `.env.local` to git
- Change the default password after first login
- Use strong passwords for production
- Enable email verification in production
- Set up proper RLS policies in Supabase
- Monitor auth logs in Supabase dashboard

## Database Schema

The `users` table structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,           -- Matches Supabase Auth user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,                 -- 'admin' or 'member'
  status TEXT DEFAULT 'In Progress',  -- User status
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps

After successful login:

1. **Customize Profile:**
   - Go to `/profile`
   - Update your password
   - Review your information

2. **Add Team Members:**
   - Go to `/admin/team`
   - Add your team members
   - Assign them tasks and files

3. **Upload Files:**
   - Go to `/admin/upload`
   - Upload files for your team
   - Assign to specific members or all

4. **Create Tasks:**
   - Go to `/admin/tasks`
   - Create tasks with priorities
   - Assign to team members

5. **Monitor Activity:**
   - Check `/debug` for system status
   - Review Supabase dashboard for logs
   - Monitor storage usage

## Support

If you encounter issues:

1. Check `/debug` page for system status
2. Review Supabase dashboard logs
3. Check browser console for errors
4. Verify all setup steps were completed
5. Refer to `SUPABASE-MIGRATION-GUIDE.md` for detailed info
