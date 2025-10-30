# Firebase to Supabase Migration Guide

## Overview
This guide will help you migrate from Firebase to Supabase for authentication, database, and storage.

## Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project Name: `provenmedia-portal`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Wait for project to be created (2-3 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon/public key** (starts with eyJ...)

## Step 3: Update Environment Variables

Create/update `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Install Supabase Client

Run:
```bash
npm install @supabase/supabase-js
```

## Step 5: Database Schema

In Supabase SQL Editor, run the complete schema from `supabase-schema.sql`:

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute

This will create:
- `users` table with proper columns and RLS policies
- `tasks` table for task management
- `files` table for file metadata
- `support_tickets` table for support requests
- All necessary indexes and triggers

## Step 6: Storage Bucket Setup

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it `files`
4. Set it to **Public** (for easy file access)
5. Click **Create Bucket**

### Storage Policies (Optional - for more security)

If you want to restrict file access, add these policies in Storage > Policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow public read access
CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'files');

-- Allow admins to delete files
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' AND
  EXISTS (
    SELECT 1 FROM users WHERE uid = auth.uid()::text AND role = 'admin'
  )
);
```

## Benefits of Supabase

✅ No CORS issues
✅ Built-in PostgreSQL database
✅ Real-time subscriptions
✅ Better developer experience
✅ Generous free tier
✅ Easier security rules

## Step 7: Create Admin User

After setting up the database, create your admin user manually in Supabase:

### Create Auth User
1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click **Add User**
3. Enter:
   - Email: `zain@provenmedia.nl`
   - Password: `Welkom26!`
4. Click **Create User**
5. **Copy the User ID (UUID)** that appears - you'll need it in the next step

### Add User Profile to Database
1. Go to **SQL Editor** in Supabase dashboard
2. Run this SQL (replace `PASTE-USER-ID-HERE` with the UUID you copied):

```sql
INSERT INTO users (uid, email, name, role, status, join_date)
VALUES ('PASTE-USER-ID-HERE', 'zain@provenmedia.nl', 'Zain', 'admin', 'active', NOW());
```

3. Click **Run** to execute

Now you can login at `/login` with:
- Email: `zain@provenmedia.nl`
- Password: `Welkom26!`

To add team members later, use the admin dashboard at `/admin/team`.

## Migration Checklist

- [x] Create Supabase project
- [x] Get API credentials
- [x] Update .env.local
- [x] Install @supabase/supabase-js (already installed)
- [ ] Run database schema from `supabase-schema.sql`
- [ ] Create storage bucket named `files`
- [ ] Create admin user in Supabase Auth
- [ ] Add admin profile to users table
- [ ] Test authentication at `/login` with zain@provenmedia.nl
- [ ] Test admin dashboard at `/admin`
- [ ] Add team members via admin dashboard
- [ ] Test file uploads
- [ ] Test task management

## What Was Migrated

✅ **Authentication**
- Login/logout functionality
- Password change
- User session management

✅ **Database Operations**
- User profiles and management
- Task creation, editing, deletion
- File metadata storage
- Support ticket submission

✅ **File Storage**
- File uploads to Supabase Storage
- File downloads
- File assignment to users

✅ **Admin Features**
- Team member management
- Task assignment
- File uploads and management

✅ **Member Features**
- View assigned tasks
- Download assigned files
- Submit support tickets
- Update profile and password

## Key Differences from Firebase

1. **Database**: PostgreSQL instead of Firestore (more powerful queries)
2. **Storage**: Supabase Storage instead of Firebase Storage (simpler setup)
3. **Auth**: Similar but with better TypeScript support
4. **RLS**: Row Level Security for fine-grained access control
5. **No CORS issues**: Supabase handles CORS automatically

## Troubleshooting

### "User profile not found" error
- Make sure you ran the database schema
- Verify the user exists in both Auth and the `users` table
- Check that the `uid` in the `users` table matches the auth user ID

### File upload fails
- Verify the `files` storage bucket exists
- Check that it's set to Public or has proper policies
- Ensure the bucket name in code matches exactly

### Can't see tasks/files
- Check RLS policies are properly set up
- Verify the user's role in the `users` table
- Check that `assigned_to` values match user UIDs

### Authentication issues
- Verify environment variables are set correctly
- Check Supabase project URL and anon key
- Ensure email confirmation is disabled in Supabase Auth settings (for testing)
