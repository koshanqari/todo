-- Supabase Database Setup for Shared Todo App
-- Run these commands in your Supabase SQL Editor

-- Create lists table
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (required for Supabase)
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for public access MVP)
CREATE POLICY "Allow all operations on lists" ON lists FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

-- Optional: Create indexes for better performance
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_lists_created_at ON lists(created_at);
CREATE INDEX idx_lists_status ON lists(status);

-- Update existing tasks to have proper status
-- Run this after creating the table to update existing data
UPDATE tasks SET status = 'pending' WHERE status IS NULL;
UPDATE tasks SET status = 'completed' WHERE completed = true AND status = 'pending';
-- Ensure lists status is set
UPDATE lists SET status = 'active' WHERE status IS NULL;
