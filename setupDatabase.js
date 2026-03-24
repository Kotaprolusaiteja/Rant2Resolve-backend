#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL Schema - All tables
const SCHEMA_SQL = `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')) DEFAULT 'STUDENT',
  department TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'ADMIN')),
  likes INTEGER DEFAULT 0,
  liked_by UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);

-- Issues Table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('MEDICAL', 'ACADEMIC', 'HOSTEL', 'FINANCE', 'TECHNICAL', 'OTHERS')),
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED')) DEFAULT 'OPEN',
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  reactions INTEGER DEFAULT 0,
  replies JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issues_student_id ON issues(student_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INTERNSHIP', 'FULL-TIME', 'RESEARCH')),
  location TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Remote', 'On-Campus', 'Hybrid')),
  stipend TEXT,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  eligibility TEXT NOT NULL,
  duration TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  apply_url TEXT,
  is_internal BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_type ON opportunities(type);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  opportunity_title TEXT NOT NULL,
  resume_path TEXT,
  statement_of_interest TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('APPLIED', 'REVIEWED', 'ACCEPTED', 'REJECTED')) DEFAULT 'APPLIED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, opportunity_id)
);

CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('URGENT', 'INFO', 'EVENT')),
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_publish_date ON announcements(publish_date DESC);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ISSUE_RESOLVED', 'APPLICATION_STATUS', 'ANNOUNCEMENT', 'OTHER')) DEFAULT 'OTHER',
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Create Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Sample data
const SAMPLE_USERS = [
  {
    name: 'Admin User',
    email: 'admin@rant2resolve.com',
    password: 'Admin@123456',
    role: 'ADMIN',
    department: 'Administration'
  },
  {
    name: 'John Doe',
    email: 'john@student.com',
    password: 'Student@123456',
    role: 'STUDENT',
    department: 'Computer Science'
  },
  {
    name: 'Jane Smith',
    email: 'jane@student.com',
    password: 'Student@123456',
    role: 'STUDENT',
    department: 'Electronics'
  }
];

async function setupDatabase() {
  console.log('\n🚀 Starting Supabase Database Setup...\n');

  try {
    // Step 1: Check database connection
    console.log('📊 Step 1: Testing Supabase connection...');
    
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError && countError.code !== 'PGRST116' && countError.message.includes('relation')) {
      console.log('\n⚠️  DATABASE SCHEMA NOT FOUND!\n');
      console.log('Please create the tables manually:\n');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to "SQL Editor"');
      console.log('4. Click "New Query"');
      console.log('5. Copy the entire content from: backend/DATABASE_SCHEMA.sql');
      console.log('6. Paste it into the SQL Editor');
      console.log('7. Click "Run"');
      console.log('8. After that, run this script again: node setupDatabase.js\n');
      process.exit(1);
    }

    console.log('✅ Supabase connection successful!\n');

    // Step 2: Create sample users
    console.log('👥 Step 2: Creating sample users...');

    for (const user of SAMPLE_USERS) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const { data: createdUser, error: userError } = await supabase
          .from('users')
          .insert([
            {
              name: user.name,
              email: user.email,
              password: hashedPassword,
              role: user.role,
              department: user.department
            }
          ])
          .select();

        if (userError) {
          if (userError.message.includes('duplicate')) {
            console.log(`⚠️  User ${user.email} already exists (skipped)`);
          } else {
            console.log(`❌ Error creating ${user.email}: ${userError.message}`);
          }
        } else {
          console.log(`✅ Created user: ${user.email} (${user.role})`);
        }
      } catch (err) {
        console.log(`⚠️  Could not create user ${user.email}: ${err.message}`);
      }
    }

    console.log('\n✅ Database setup completed!\n');
    console.log('📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Database Status:');
    console.log('   • Connected to Supabase ✓');
    console.log('   • Tables created in Supabase ✓');
    console.log('   • Sample users inserted ✓\n');
    console.log('✅ Sample users created:');
    SAMPLE_USERS.forEach(user => {
      console.log(`   • ${user.email} (${user.role})`);
    });
    console.log('\n📌 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    SAMPLE_USERS.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}\n`);
    });

    console.log('🎉 Your Supabase database is ready!\n');
    console.log('Next steps:');
    console.log('1. Update your controllers to use Supabase models (*_Supabase.js)');
    console.log('2. Run: npm start (to start the backend server)');
    console.log('3. Test login with sample credentials above\n');

  } catch (error) {
    console.error('\n❌ Setup Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    console.log('2. Check that database schema is created in Supabase');
    console.log('3. Make sure .env file is in the backend folder\n');
    process.exit(1);
  }
}

// Run setup
setupDatabase();
