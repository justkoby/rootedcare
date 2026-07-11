-- ============================================================
-- Migration 1: Add is_published, enable RLS, create policies
-- ============================================================

-- Add is_published column to content tables (safe: IF NOT EXISTS)
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE wellness_concerns ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create index for published content filtering
CREATE INDEX IF NOT EXISTS idx_herbs_is_published ON herbs (is_published);
CREATE INDEX IF NOT EXISTS idx_wellness_is_published ON wellness_concerns (is_published);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles (is_published);

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_care_plan ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Content tables: public read-only for published records
-- ============================================================
CREATE POLICY "Anyone can read published herbs"
  ON herbs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can read published wellness concerns"
  ON wellness_concerns FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can read published articles"
  ON articles FOR SELECT
  USING (is_published = true);

-- ============================================================
-- Favorites: authenticated users manage their own
-- ============================================================
CREATE POLICY "Users read own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- user_favorites (legacy): same pattern
-- ============================================================
CREATE POLICY "Users read own user_favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own user_favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own user_favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- user_care_plan: authenticated users own their data
-- ============================================================
CREATE POLICY "Users read own care plan"
  ON user_care_plan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own care plan"
  ON user_care_plan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own care plan"
  ON user_care_plan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own care plan"
  ON user_care_plan FOR DELETE
  USING (auth.uid() = user_id);
