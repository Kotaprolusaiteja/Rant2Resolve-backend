# Supabase Migration Guide

## Step 1: Setup Supabase Account

1. Go to https://supabase.com
2. Sign up with your email
3. Create a new project
4. Wait for the project to initialize
5. Copy your credentials:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Public Key** → `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy ALL SQL from `DATABASE_SCHEMA.sql` file
4. Paste it into the SQL Editor
5. Click **Run**
6. Verify all tables are created (check **Table Editor** section)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` in the backend folder:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-public-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   JWT_SECRET=your-secure-random-string
   ```

## Step 4: Install Dependencies

```bash
cd backend
npm install
```

This will install the new Supabase dependency: `@supabase/supabase-js`

## Step 5: Update Your Controllers

Replace your existing model imports from Mongoose to Supabase:

**Old (Mongoose):**
```javascript
const Issue = require('../models/Issue');
```

**New (Supabase):**
```javascript
const Issue = require('../models/Issue_Supabase');
```

### Available Supabase Model Files:
- `User_Supabase.js` - User operations
- `Issue_Supabase.js` - Issue operations
- `ChatMessage_Supabase.js` - Chat operations
- `Opportunity_Supabase.js` - Opportunity operations
- `Application_Supabase.js` - Application operations
- `Announcement_Supabase.js` - Announcement operations
- `Notification_Supabase.js` - Notification operations

## Step 6: Update Controller Methods

Each Supabase model has these available methods:

### Common Methods (All Models):
```javascript
// Create
await Model.create(data);

// Read operations
await Model.findById(id);
await Model.findAll(limit, offset);

// Update
await Model.update(id, updates);

// Delete
await Model.delete(id);
```

### Specific Methods by Model:

**User:**
- `findByEmail(email)`
- `findByRole(role)`

**Issue:**
- `findByStudentId(studentId)`
- `findByStatus(status)`
- `findByCategory(category)`
- `addReply(id, reply)`
- `updateReaction(id, reactions)`

**ChatMessage:**
- `findBySenderId(senderId, limit)`
- `addLike(id, userId)`
- `removeLike(id, userId)`

**Opportunity:**
- `findByType(type)`
- `findUpcoming()`
- `findByCreatedBy(userId)`

**Application:**
- `findByStudentId(studentId)`
- `findByOpportunityId(opportunityId)`
- `findByStatus(status)`
- `checkDuplicate(studentId, opportunityId)`

**Announcement:**
- `findByCategory(category)`
- `findByCreatedBy(userId)`
- `findRecent(limit)`

**Notification:**
- `findByUserId(userId, limit, offset)`
- `findUnread(userId)`
- `findByType(userId, type)`
- `markAsRead(id)`
- `markAllAsRead(userId)`
- `deleteOldRead(daysOld)`

## Step 7: Running the Server

```bash
npm start
```

The server will now:
1. Connect to Supabase instead of MongoDB
2. Show "✅ Supabase Connection Established" on startup
3. Real-time features (Socket.io) work exactly the same

## Step 8: Update Routes (Example)

### Authentication Route Example:

**Old (Mongoose):**
```javascript
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});
```

**New (Supabase):**
```javascript
const User = require('../models/User_Supabase');

router.post('/register', async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'STUDENT',
      department: req.body.department
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Common Issues & Solutions

### Issue: "SUPABASE credentials missing"
**Solution:** Check that `.env` file has all three keys properly set

### Issue: "Table or function not found"
**Solution:** Re-run all SQL queries from `DATABASE_SCHEMA.sql` in Supabase SQL Editor

### Issue: "Authentication failed"
**Solution:** Use `SUPABASE_SERVICE_ROLE_KEY` for admin operations, `SUPABASE_ANON_KEY` for public OPS

### Issue: "Foreign key error"
**Solution:** Ensure you're using valid UUID values when inserting data with foreign keys

## Data Types Mapping

| Mongoose | PostgreSQL (Supabase) |
|----------|----------------------|
| ObjectId | UUID |
| String | TEXT |
| Number | INTEGER / NUMERIC |
| Boolean | BOOLEAN |
| Date | TIMESTAMP WITH TIME ZONE |
| Array | UUID[] or TEXT[] |
| Object | JSONB |

## Testing Connection

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Next Steps

1. Update all your controller files to use Supabase models
2. Test each endpoint to ensure data is saving correctly
3. Update your frontend API calls if needed (they should work as-is)
4. Deploy to Render/Vercel with updated environment variables

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Supabase JS Client: https://supabase.com/docs/reference/javascript/introduction
- PostgreSQL Docs: https://www.postgresql.org/docs/
