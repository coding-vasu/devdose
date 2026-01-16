# Supabase Setup Guide for DevDose

## 📋 Overview

You need to:

1. Create a Supabase project
2. Get your Project URL and Service Key
3. Set up the database schema
4. Test the connection

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Sign In

1. Go to: https://supabase.com/dashboard
2. Click **"Sign in"** (or "Start your project")
3. **Recommended:** Sign in with GitHub (fastest setup)

### 1.2 Create New Project

1. Click **"New Project"** button
2. Fill in the form:

   - **Organization:** Select or create one
   - **Name:** `devdose` (or any name you prefer)
   - **Database Password:** Create a strong password
     - ⚠️ **SAVE THIS PASSWORD!** You'll need it for direct database access
   - **Region:** Choose closest to your location
     - US East (North Virginia) - `us-east-1`
     - Europe (Frankfurt) - `eu-central-1`
     - Asia Pacific (Singapore) - `ap-southeast-1`
   - **Pricing Plan:** Free tier is perfect for this project

3. Click **"Create new project"**
4. Wait 1-2 minutes for provisioning

---

## Step 2: Get Your Credentials

### 2.1 Navigate to API Settings

Once your project is ready:

1. In the left sidebar, click the **⚙️ Settings** icon (at the bottom)
2. Click **"API"** in the settings menu

### 2.2 Copy Your Credentials

You'll see two important sections:

**Project URL:**

```
https://xxxxxxxxxxxxx.supabase.co
```

Copy this entire URL.

**API Keys:**

You'll see multiple keys. You need the **service_role** key:

- `anon` key - Public key (NOT this one)
- `service_role` key - **THIS IS THE ONE YOU NEED** ⚠️
  - Click **"Reveal"** or the eye icon
  - Click **"Copy"** to copy the key
  - It starts with `eyJ...`

⚠️ **IMPORTANT:** The `service_role` key bypasses all security rules. Never commit it to Git or share it publicly!

---

## Step 3: Add to .env File

Open your `.env` file and update these lines:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Step 2.

---

## Step 4: Set Up Database Schema

### 4.1 Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 4.2 Run the Schema Script

Copy the entire contents of `src/pipeline/publishing/schema.sql` and paste it into the SQL editor.

Or run this command from your terminal:

```bash
# Display the schema
cat src/pipeline/publishing/schema.sql
```

Then copy and paste into Supabase SQL Editor.

### 4.3 Execute the SQL

1. Click **"Run"** (or press Cmd/Ctrl + Enter)
2. You should see: ✅ "Success. No rows returned"

### 4.4 Verify Table Creation

1. Click **"Table Editor"** in the left sidebar
2. You should see a `posts` table
3. Click on it to see the columns:
   - `id` (uuid)
   - `title` (text)
   - `code` (text)
   - `language` (text)
   - `explanation` (text)
   - `tags` (text[])
   - `difficulty` (text)
   - And more...

---

## Step 5: Test Your Connection

Run the test script:

```bash
npm run test-supabase
```

You should see:

- ✅ Connection successful
- ✅ Database version
- ✅ Posts table exists
- ✅ Can insert and query data

---

## 🎯 Quick Reference

### Your Credentials Location

- **Dashboard:** https://supabase.com/dashboard
- **Project Settings:** Settings → API
- **SQL Editor:** SQL Editor (left sidebar)
- **Table Editor:** Table Editor (left sidebar)

### Common Issues

**❌ "Invalid API key"**

- Make sure you copied the `service_role` key, not the `anon` key
- Check for extra spaces when pasting

**❌ "Connection failed"**

- Verify your SUPABASE_URL is correct
- Make sure it starts with `https://`
- Check your internet connection

**❌ "Table 'posts' does not exist"**

- Run the schema.sql script in SQL Editor
- Check Table Editor to verify table was created

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` to Git** (already in `.gitignore`)
2. ✅ **Use `service_role` key only in backend** (not in frontend)
3. ✅ **Rotate keys if accidentally exposed**
4. ✅ **Use Row Level Security (RLS)** for production apps

---

## Next Steps

Once your Supabase test passes:

1. ✅ Set up GitHub token (if not done)
2. ✅ Set up Gemini API key
3. 🚀 Run the pipeline: `npm run pipeline`

---

**Need help?** Check the Supabase docs: https://supabase.com/docs
