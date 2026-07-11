-- ============================================================
-- Migration 4: Profiles roles + write policies
-- ============================================================

-- Add role + extra columns to user_profiles (created in migration 3)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role      TEXT DEFAULT 'user'
    CHECK (role IN ('admin', 'editor', 'doctor', 'user')),
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS email     TEXT;

-- Update handle_new_user to also capture email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- ── Helper functions ────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_editor_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- ── Profiles policies ──────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (is_admin());

-- ── Herbs write policies ───────────────────────────────
CREATE POLICY "Editors can insert herbs"
  ON herbs FOR INSERT
  WITH CHECK (is_editor_or_above());

CREATE POLICY "Editors can update herbs"
  ON herbs FOR UPDATE
  USING (is_editor_or_above());

CREATE POLICY "Admins can delete herbs"
  ON herbs FOR DELETE
  USING (is_admin());

-- ── Wellness write policies ────────────────────────────
CREATE POLICY "Editors can insert wellness"
  ON wellness_concerns FOR INSERT
  WITH CHECK (is_editor_or_above());

CREATE POLICY "Editors can update wellness"
  ON wellness_concerns FOR UPDATE
  USING (is_editor_or_above());

CREATE POLICY "Admins can delete wellness"
  ON wellness_concerns FOR DELETE
  USING (is_admin());

-- ── Articles write policies ────────────────────────────
CREATE POLICY "Editors can insert articles"
  ON articles FOR INSERT
  WITH CHECK (is_editor_or_above());

CREATE POLICY "Editors can update articles"
  ON articles FOR UPDATE
  USING (is_editor_or_above());

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  USING (is_admin());

-- ── NOTE ───────────────────────────────────────────────
-- After running this migration, go to Supabase → Table Editor → user_profiles
-- Find your own row and set role = 'admin'
-- This gives you full access to the Admin Dashboard.
