# Quick Start Guide - Supabase Migration

## 🚀 Get Started in 5 Minutes

### 1. Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login
3. Click **New Project**
4. Fill in:
   - Name: `provenmedia-portal`
   - Database Password: (save this!)
   - Region: Choose closest to you
5. Wait for project creation (~2 min)

### 2. Get Your Credentials (30 sec)

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 3. Update Environment Variables (30 sec)

Create/update `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Set Up Database (1 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase-schema.sql` from your project
4. Copy all contents and paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

### 5. Create Storage Bucket (30 sec)

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name: `files`
4. Make it **Public**
5. Click **Create**

### 6. Create Admin User (1 min)

**In Supabase Dashboard:**

1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Email: `zain@provenmedia.nl`, Password: `Welkom26!`
4. Copy the User ID (UUID)
5. Go to **SQL Editor** and run:
```sql
INSERT INTO users (uid, email, name, role, status, join_date)
VALUES ('PASTE-USER-ID-HERE', 'zain@provenmedia.nl', 'Zain', 'admin', 'active', NOW());
```
(Replace `PASTE-USER-ID-HERE` with the copied UUID)

### 7. Test Everything (1 min)

1. Go to `http://localhost:3000/login`
2. Login with:
   - **Email**: `zain@provenmedia.nl`
   - **Password**: `Welkom26!`
3. Test admin features:
   - Upload files
   - Create tasks
   - Manage team members

## ✅ You're Done!

Your app is now fully migrated to Supabase!

## 🔧 Common Issues

**"User profile not found"**
- Run the database schema again
- Make sure test users were created successfully

**"Storage bucket not found"**
- Create the `files` bucket in Supabase Storage
- Make sure it's named exactly `files` (lowercase)

**Environment variables not working**
- Restart your dev server after updating `.env.local`
- Check for typos in variable names

## 📚 Next Steps

- Read `SUPABASE-MIGRATION-GUIDE.md` for detailed information
- Check `supabase-schema.sql` to understand the database structure
- Customize RLS policies for your security needs
- Deploy to production (Vercel, Netlify, etc.)

## 🆘 Need Help?

- Check the Troubleshooting section in `SUPABASE-MIGRATION-GUIDE.md`
- Visit [Supabase Docs](https://supabase.com/docs)
- Check the `/debug` page in your app for system status
