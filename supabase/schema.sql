-- Run this in the Supabase SQL editor to set up the database schema.
-- Supabase Auth handles the users table.

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  graduation_date TIMESTAMPTZ NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  -- Google tokens stored here; rotate via refresh token on each calendar fetch
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE bucket_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'activity',
  location_name TEXT,
  address TEXT,
  yelp_id TEXT,
  hours JSONB,  -- cached VenueHourPeriod[] from Yelp
  added_by UUID REFERENCES auth.users(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bucket_list_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES bucket_list_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(item_id, user_id)
);

CREATE TABLE proposed_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES bucket_list_items(id) ON DELETE CASCADE,
  proposed_by UUID REFERENCES auth.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE proposed_time_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_time_id UUID REFERENCES proposed_times(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  response TEXT NOT NULL,  -- 'yes' | 'no' | 'maybe'
  UNIQUE(proposed_time_id, user_id)
);

-- Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposed_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposed_time_rsvps ENABLE ROW LEVEL SECURITY;

-- Groups: visible to members
CREATE POLICY "group members can view group" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Group members: visible to fellow members
CREATE POLICY "members can view group roster" ON group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "users can join groups" ON group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Bucket list: group members only
CREATE POLICY "members can view bucket list" ON bucket_list_items
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "members can add to bucket list" ON bucket_list_items
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "members can update bucket list" ON bucket_list_items
  FOR UPDATE USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Upvotes
CREATE POLICY "members can view upvotes" ON bucket_list_upvotes
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM bucket_list_items WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "members can upvote" ON bucket_list_upvotes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can remove own upvote" ON bucket_list_upvotes
  FOR DELETE USING (user_id = auth.uid());

-- Proposed times
CREATE POLICY "members can view proposed times" ON proposed_times
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM bucket_list_items WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "members can propose times" ON proposed_times
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RSVPs
CREATE POLICY "members can view rsvps" ON proposed_time_rsvps
  FOR SELECT USING (
    proposed_time_id IN (SELECT id FROM proposed_times)
  );

CREATE POLICY "users can rsvp" ON proposed_time_rsvps
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can update own rsvp" ON proposed_time_rsvps
  FOR UPDATE USING (user_id = auth.uid());
