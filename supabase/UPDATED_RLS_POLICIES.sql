-- =====================================================
-- UPDATED RLS POLICIES FOR SITECRAFT
-- =====================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This enables complete anonymous/public access
-- (Suitable for internal APIs where frontend handles auth)
-- =====================================================

-- Drop existing policies (if needed)
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
DROP POLICY IF EXISTS "Service role has full access to projects" ON projects;
DROP POLICY IF EXISTS "Service role has full access to materials" ON materials;
DROP POLICY IF EXISTS "Service role has full access to labor" ON labor;
DROP POLICY IF EXISTS "Service role has full access to tasks" ON tasks;
DROP POLICY IF EXISTS "Service role has full access to documents" ON documents;

-- =====================================================
-- NEW PERMISSIVE POLICIES - Allow All Access
-- =====================================================
-- Note: Authentication is handled by Next.js frontend
-- with Supabase auth. Backend uses service role key.

CREATE POLICY "Allow all access to users" ON users
  FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to projects" ON projects
  FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to materials" ON materials
  FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to labor" ON labor
  FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to tasks" ON tasks
  FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to documents" ON documents
  FOR ALL TO authenticated, anon
  USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFY POLICIES ARE ACTIVE
-- =====================================================
-- Check that RLS is still enabled but now more permissive
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check current policies
SELECT policyname, tablename, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
