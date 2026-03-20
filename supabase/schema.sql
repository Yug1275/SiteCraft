-- =============================================
-- SiteCraft Database Schema for Supabase
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT,
  avatar_url TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  budget DECIMAL(15,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'On Track',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  manager VARCHAR(255),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- =============================================
-- MATERIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255) DEFAULT '',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_materials_user_id ON materials(user_id);
CREATE INDEX idx_materials_project_id ON materials(project_id);

-- =============================================
-- LABOR TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS labor (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  role VARCHAR(100) NOT NULL,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  daily_wage DECIMAL(10,2) DEFAULT 0,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_present BOOLEAN DEFAULT FALSE,
  check_in_time VARCHAR(10),
  check_out_time VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_labor_user_id ON labor(user_id);
CREATE INDEX idx_labor_project_id ON labor(project_id);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'Pending',
  priority VARCHAR(50) DEFAULT 'Medium',
  assignee VARCHAR(255) DEFAULT '',
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- =============================================
-- DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size VARCHAR(50) DEFAULT '',
  file_type VARCHAR(50) DEFAULT 'document',
  category VARCHAR(100) DEFAULT 'General',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for Express backend using service key)
CREATE POLICY "Service role has full access to users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to materials" ON materials
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to labor" ON labor
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- CONTACT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to contact_messages
CREATE POLICY "Service role has full access to contact_messages" ON contact_messages
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- SUPABASE STORAGE BUCKET
-- =============================================
-- Create a storage bucket for documents
-- Run this in Supabase Dashboard → Storage → Create Bucket
-- Bucket name: documents
-- Public: true (or configure as needed)
