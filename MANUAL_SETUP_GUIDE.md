# 🚀 Manual Supabase Table Setup Guide

## IMPORTANT: Complete This FIRST Before Running Setup Script

The database tables need to be created in Supabase manually. Follow these steps:

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: **issiznoczipthhkwodpx**
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Create New Query

1. Click **"New Query"** button
2. A blank SQL editor will open

### Step 3: Copy & Paste Database Schema

1. Open the file: `backend/DATABASE_SCHEMA.sql` in VS Code
2. Select ALL content (Ctrl+A)
3. Copy it (Ctrl+C)
4. Paste it into the Supabase SQL Editor (Ctrl+V)

### Step 4: Execute the Query

1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for the query to complete
3. You should see ✅ "Success" message

### Step 5: Verify Tables Were Created

1. Click on **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ chat_messages
   - ✅ issues
   - ✅ opportunities
   - ✅ applications
   - ✅ announcements
   - ✅ notifications

### Step 6: Run Setup Script

Once tables are created, run this command in terminal:

```bash
cd backend
node setupDatabase.js
```

This will:
- ✅ Create 3 sample users
- ✅ Show you test credentials
- ✅ Prepare your database for the application

---

## 📝 SQL Query Breakdown (What Gets Created)

The DATABASE_SCHEMA.sql file creates:

### Tables
- **users** - Student and admin accounts
- **chat_messages** - Community chat with likes
- **issues** - Issue tracking (MEDICAL, ACADEMIC, HOSTEL, FINANCE, TECHNICAL, OTHERS)
- **opportunities** - Internship/Job opportunities
- **applications** - Student applications to opportunities
- **announcements** - Admin announcements
- **notifications** - User notifications

### Indexes
- Indexes on frequently queried fields (email, status, created_at)
- Faster search and filtering

### Triggers
- Auto-update `updated_at` timestamp on any table change

---

## ❓ Troubleshooting

### Issue: "Relation already exists"
**Solution:** This is OK! It means the tables are already created. Skip the SQL execution.

### Issue: "Syntax Error" in SQL
**Solution:** 
1. Make sure you copied the ENTIRE content from DATABASE_SCHEMA.sql
2. Try clearing the editor and pasting again
3. Contact support if error persists

### Issue: Tables appeared but script still fails
**Solution:** 
1. Refresh your browser (F5)
2. Close and reopen Supabase dashboard
3. Run the setup script again

---

## 🎯 Next Steps After Table Creation

1. ✅ Create tables (following this guide)
2. ✅ Run setup script to add sample users
3. ✅ Start backend server: `npm start`
4. ✅ Test login with sample credentials:
   - admin@rant2resolve.com / Admin@123456
   - john@student.com / Student@123456
   - jane@student.com / Student@123456

---

## 📞 Support

If you encounter issues:
1. Check DATABASE_SCHEMA.sql exists in backend folder
2. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
3. Check Supabase project is active
4. Review error message carefully for clues
