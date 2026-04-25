-- Paste this entire block into Supabase SQL Editor and run it.
-- It wraps everything in a transaction so it's all-or-nothing.

BEGIN;

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "group members can view group" ON groups;
DROP POLICY IF EXISTS "authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "members can view group roster" ON group_members;
DROP POLICY IF EXISTS "users can join groups" ON group_members;
DROP POLICY IF EXISTS "members can view bucket list" ON bucket_list_items;
DROP POLICY IF EXISTS "members can add to bucket list" ON bucket_list_items;
DROP POLICY IF EXISTS "members can update bucket list" ON bucket_list_items;
DROP POLICY IF EXISTS "members can view upvotes" ON bucket_list_upvotes;
DROP POLICY IF EXISTS "members can upvote" ON bucket_list_upvotes;
DROP POLICY IF EXISTS "users can remove own upvote" ON bucket_list_upvotes;
DROP POLICY IF EXISTS "members can view proposed times" ON proposed_times;
DROP POLICY IF EXISTS "members can propose times" ON proposed_times;
DROP POLICY IF EXISTS "members can view rsvps" ON proposed_time_rsvps;
DROP POLICY IF EXISTS "users can rsvp" ON proposed_time_rsvps;
DROP POLICY IF EXISTS "users can update own rsvp" ON proposed_time_rsvps;

-- 2. Create a security definer function so policies on group_members
--    don't recursively query group_members (which caused the original error)
DROP FUNCTION IF EXISTS get_my_group_ids();
CREATE FUNCTION get_my_group_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT group_id FROM group_members WHERE user_id = auth.uid();
$$;

-- 3. Groups
CREATE POLICY "anyone authenticated can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "group members can view group" ON groups
  FOR SELECT USING (id IN (SELECT get_my_group_ids()));

-- 4. Group members
CREATE POLICY "members can view group roster" ON group_members
  FOR SELECT USING (group_id IN (SELECT get_my_group_ids()));

CREATE POLICY "users can join groups" ON group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. Bucket list
CREATE POLICY "members can view bucket list" ON bucket_list_items
  FOR SELECT USING (group_id IN (SELECT get_my_group_ids()));

CREATE POLICY "members can add to bucket list" ON bucket_list_items
  FOR INSERT WITH CHECK (group_id IN (SELECT get_my_group_ids()));

CREATE POLICY "members can update bucket list" ON bucket_list_items
  FOR UPDATE USING (group_id IN (SELECT get_my_group_ids()));

-- 6. Upvotes
CREATE POLICY "members can view upvotes" ON bucket_list_upvotes
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM bucket_list_items WHERE group_id IN (SELECT get_my_group_ids())
    )
  );

CREATE POLICY "members can upvote" ON bucket_list_upvotes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can remove own upvote" ON bucket_list_upvotes
  FOR DELETE USING (user_id = auth.uid());

-- 7. Proposed times
CREATE POLICY "members can view proposed times" ON proposed_times
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM bucket_list_items WHERE group_id IN (SELECT get_my_group_ids())
    )
  );

CREATE POLICY "members can propose times" ON proposed_times
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 8. RSVPs
CREATE POLICY "members can view rsvps" ON proposed_time_rsvps
  FOR SELECT USING (
    proposed_time_id IN (SELECT id FROM proposed_times)
  );

CREATE POLICY "users can rsvp" ON proposed_time_rsvps
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can update own rsvp" ON proposed_time_rsvps
  FOR UPDATE USING (user_id = auth.uid());

COMMIT;
