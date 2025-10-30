# ProvenMedia Portal - Supabase Edition

A modern team management portal built with Next.js 14, TypeScript, and Supabase.

## 🚀 Features

### Admin Dashboard
- **Team Management** - Add, edit, and manage team members
- **Task Assignment** - Create and assign tasks with priorities and due dates
- **File Management** - Upload and assign files to team members
- **User Roles** - Admin and member role management

### Member Dashboard
- **Task Tracking** - View assigned tasks with status and priorities
- **File Access** - Download files assigned by admin
- **Support Tickets** - Submit support requests
- **Profile Management** - Update password and view profile

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Quick Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd provenmedia-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
- Create a project at [supabase.com](https://supabase.com)
- Copy your project URL and anon key
- Run the schema from `supabase-schema.sql` in SQL Editor
- Create a storage bucket named `files`

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. **Create admin user**

In Supabase Dashboard:
- Go to Authentication → Users → Add User
- Email: `zain@provenmedia.nl`, Password: `Welkom26!`
- Copy the User ID
- In SQL Editor, run:
```sql
INSERT INTO users (uid, email, name, role, status, join_date)
VALUES ('PASTE-USER-ID-HERE', 'zain@provenmedia.nl', 'Zain', 'admin', 'active', NOW());
```

6. **Start developing**
```bash
npm run dev
```

## 🔐 Admin Credentials

After creating the admin user in Supabase:

**Admin Account**
- Email: `zain@provenmedia.nl`
- Password: `Welkom26!`

**Team Members**
- Add via Admin Dashboard at `/admin/team`

## 📁 Project Structure

```
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── member/         # Member dashboard pages
│   ├── login/          # Authentication
│   ├── profile/        # User profile
│   └── setup/          # Initial setup
├── components/
│   ├── admin/          # Admin-specific components
│   ├── member/         # Member-specific components
│   └── ui/             # Reusable UI components
├── lib/
│   ├── supabase.ts     # Supabase client
│   ├── auth-context.tsx # Auth state management
│   └── utils.ts        # Utility functions
├── supabase-schema.sql # Database schema
└── public/             # Static assets
```

## 🗄️ Database Schema

### Tables
- **users** - User profiles and roles
- **tasks** - Task assignments and tracking
- **files** - File metadata and assignments
- **support_tickets** - Support request tracking

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have full access to all data

## 🔒 Security Features

- ✅ Row Level Security (RLS)
- ✅ Secure authentication with Supabase Auth
- ✅ Password hashing
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Secure file storage

## 📚 Documentation

- **[Quick Start Guide](QUICK-START.md)** - Get started in 5 minutes
- **[Migration Guide](SUPABASE-MIGRATION-GUIDE.md)** - Detailed setup instructions
- **[Migration Complete](MIGRATION-COMPLETE.md)** - What changed from Firebase
- **[Database Schema](supabase-schema.sql)** - Complete SQL schema

## 🧪 Testing

Visit these pages to test functionality:

- `/login` - Authentication
- `/admin` - Admin dashboard
- `/member` - Member dashboard
- `/profile` - Profile management
- `/debug` - System status and diagnostics

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

Works with any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## 📊 Performance

- Server-side rendering for fast initial loads
- Optimized database queries with indexes
- Image optimization with Next.js
- Code splitting and lazy loading
- Efficient caching strategies

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (recommended)
- Strict mode enabled

## 🐛 Troubleshooting

### Common Issues

**"User profile not found"**
- Run the database schema
- Create test users via `/setup`

**"Storage bucket not found"**
- Create `files` bucket in Supabase Storage
- Make sure it's public

**Environment variables not working**
- Restart dev server after changes
- Check for typos in `.env.local`

See [MIGRATION-COMPLETE.md](MIGRATION-COMPLETE.md) for more troubleshooting tips.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the `/debug` page for system status
- Review documentation in the repo
- Visit [Supabase Docs](https://supabase.com/docs)
- Join [Supabase Discord](https://discord.supabase.com)

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] File preview
- [ ] Activity logs
- [ ] Analytics dashboard
- [ ] Mobile app

## ⭐ Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- UI components from [Radix UI](https://radix-ui.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

Made with ❤️ for team collaboration
