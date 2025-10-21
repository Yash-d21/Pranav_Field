# 🚀 Local Development Setup

## ✅ Quick Start

### Simple Setup (Recommended)
```bash
# Just run this - .env file is already configured!
npm run dev
```

The `.env` file is already set up with your Supabase credentials, so you don't need to set any environment variables manually.

## 🌐 Access Your App

- **Local URL**: http://localhost:3000
- **Admin Login**: admin@fieldmaintenance.com / admin123

## 🔧 Development Features

- ✅ **Hot Reload** - Changes update instantly
- ✅ **Supabase Integration** - Real database connection
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Styled components
- ✅ **PWA Features** - Works offline

## 🐛 Troubleshooting

### White Screen Issues:
1. **Check Console** - Open browser dev tools (F12)
2. **Check Network** - Look for failed requests
3. **Check Supabase** - Verify database is set up

### Build Issues:
```bash
# Clear cache and rebuild
npm run build
```

### Database Issues:
1. **Check Supabase Dashboard** - https://supabase.com/dashboard/project/cocywsgybygqitlkxbfy
2. **Verify Tables** - Make sure all tables exist
3. **Check Admin User** - Verify admin user is in users table

## 📝 Development Workflow

1. **Make Changes** - Edit files in `src/`
2. **See Updates** - Browser refreshes automatically
3. **Test Features** - Use the app locally
4. **Deploy** - Push to Vercel when ready

## 🎯 What's Different from Vercel?

- **Local Development** - No need to push to Vercel
- **Faster Iteration** - Instant updates
- **Same Database** - Uses your Supabase project
- **Same Features** - All functionality works locally

---

**Happy Coding!** 🎉
