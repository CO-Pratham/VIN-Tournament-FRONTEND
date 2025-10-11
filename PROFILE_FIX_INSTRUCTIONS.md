# Profile Fix Instructions

## Issue
The profile page shows:
- Name: "Gaming Player" (default)
- ID: "Loading..." 
- Favorite Game: "No favorite game set"

## Root Cause
The `user_profiles` table doesn't exist in your Supabase database, so profile data can't be loaded or saved.

## Fix Steps

### 1. Create the user_profiles Table

Go to your **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste the contents from `create-user-profiles-table.sql` and click **Run**.

Or run this SQL:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  player_id VARCHAR(50) UNIQUE,
  favorite_game VARCHAR(100),
  level INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_player_id ON user_profiles(player_id);
```

### 2. Verify Table Creation

1. Go to **Table Editor** in Supabase
2. You should see a new table called `user_profiles`
3. Check the columns: `id`, `user_id`, `username`, `email`, `player_id`, `favorite_game`, etc.

### 3. Test the Profile

1. **Logout** and **Login** again (or refresh the page)
2. Go to the **Profile** page
3. You should now see:
   - Your actual username (or email prefix if no name set)
   - A unique Player ID like `VIN123ABC`
   - Ability to edit and save your profile

### 4. Update Profile

1. Click the **Edit** button (pencil icon)
2. Change your name and favorite game
3. Click **Save Changes**
4. The profile should update immediately
5. Refresh the page - changes should persist

## What Was Fixed

### Code Changes:
1. ✅ Updated `AuthContext.jsx` to use `user_profiles` table
2. ✅ Fixed profile update to save to database
3. ✅ Auto-generates unique Player ID on first login
4. ✅ Creates profile automatically for new users
5. ✅ Updates local state after profile changes

### Database Changes:
1. ✅ Created `user_profiles` table
2. ✅ Added RLS policies for security
3. ✅ Added indexes for performance
4. ✅ Linked to auth.users table

## Expected Behavior After Fix

### On First Login:
- Profile is created automatically
- Username is set from registration name or email
- Unique Player ID is generated (e.g., `VINAB12CD`)
- Stats initialized (level 1, 0 wins, 0 losses)

### On Profile Page:
- Shows your username
- Shows unique Player ID
- Shows email
- Shows favorite game (if set)
- Shows gaming statistics

### On Profile Edit:
- Can update username
- Can update favorite game
- Changes save to database
- Page updates immediately
- Changes persist after refresh

## Troubleshooting

### Issue: Profile still shows "Loading..."
**Solution:** 
- Clear browser cache and cookies
- Logout completely
- Login again
- Profile should be created on login

### Issue: Can't update profile
**Solution:**
- Check browser console for errors
- Verify RLS policies are created
- Ensure you're logged in
- Try logging out and back in

### Issue: Player ID not showing
**Solution:**
- Wait a few seconds (it generates in background)
- Refresh the page
- Check `user_profiles` table in Supabase for your record

### Issue: Changes don't save
**Solution:**
- Check RLS policies with: `SELECT * FROM user_profiles WHERE user_id = auth.uid()`
- Verify UPDATE policy allows updates
- Check browser console for errors

## Verification Query

Run this in Supabase SQL Editor to check your profile:

```sql
SELECT * FROM user_profiles;
```

You should see your profile with:
- `user_id`: Your auth user ID
- `username`: Your name
- `player_id`: Unique ID like VINXXX
- `favorite_game`: Your selected game
- Stats: level, wins, losses, earnings

---

**Note:** If you have existing users, they will get profiles created automatically on next login.
