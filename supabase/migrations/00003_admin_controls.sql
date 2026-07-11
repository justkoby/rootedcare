-- ============================================================
-- Migration 3: Admin controls, featured content, app config
-- ============================================================

-- ── is_featured column on content tables ──────────────────
ALTER TABLE herbs          ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE wellness_concerns ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE articles       ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- ── updated_at column with auto-update trigger ────────────
ALTER TABLE herbs          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE wellness_concerns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE articles       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_herbs_updated_at
    BEFORE UPDATE ON herbs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_wellness_updated_at
    BEFORE UPDATE ON wellness_concerns
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Indexes for featured content ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_herbs_is_featured      ON herbs (is_featured);
CREATE INDEX IF NOT EXISTS idx_wellness_is_featured    ON wellness_concerns (is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured    ON articles (is_featured);

-- ── app_config table for admin-configurable settings ─────
CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default values (safe to re-run)
INSERT INTO app_config (key, value, description) VALUES
  ('ai_rate_limit_per_day', '20', 'Maximum AI assistant queries per user per day'),
  ('ai_model',              'llama-3.3-70b-versatile', 'Groq model used for AI responses'),
  ('ai_max_tokens',         '900',  'Maximum tokens in AI response'),
  ('ai_temperature',        '0.3',  'AI response temperature (0=deterministic, 1=creative)'),
  ('featured_herbs_limit',  '6',    'Number of featured herbs shown on home screen'),
  ('featured_wellness_limit','4',   'Number of featured wellness items shown on home screen')
ON CONFLICT (key) DO NOTHING;

-- RLS for app_config: public read, service-role write only
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app config"
  ON app_config FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policy = only service role can write

-- ── user_profiles table for admin flags ──────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin   BOOLEAN DEFAULT false,
  full_name  TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Admin RLS policies for content tables ────────────────
-- Admins (via service role in dashboard) can manage all content.
-- Service role bypasses RLS automatically, so no extra policy needed.
-- These policies are for future JWT-based admin claims:

-- Allow admin JWT claim to read ALL herbs (including unpublished)
CREATE POLICY "Admins can read all herbs"
  ON herbs FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR is_published = true
  );

CREATE POLICY "Admins can read all wellness"
  ON wellness_concerns FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR is_published = true
  );

CREATE POLICY "Admins can read all articles"
  ON articles FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR is_published = true
  );
