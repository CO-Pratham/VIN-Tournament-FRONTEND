# Database Update Instructions

## Add Registration Fields to Tournament Participants

The join tournament form now captures player name, game ID, and WhatsApp number. You need to update your Supabase database to store this information.

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the contents from `add-registration-fields-migration.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl/Cmd + Enter

4. **Verify the Changes**
   - Go to "Table Editor" in the left sidebar
   - Select the `tournament_participants` table
   - You should now see three new columns:
     - `player_name`
     - `game_id`
     - `whatsapp_no`

### What Changed:

**Before:**
- Only stored tournament_id and user_id

**After:**
- Stores tournament_id, user_id, player_name, game_id, and whatsapp_no
- This allows you to track specific player details for each tournament

### Testing:

After running the migration:
1. Create or join a tournament
2. Fill in the registration form with player name, game ID, and WhatsApp number
3. The data will now be saved to the database
4. You can query this data later to contact participants or verify registrations

---

**Note:** If the migration fails, the columns might already exist. Check the error message and verify in the Table Editor.
