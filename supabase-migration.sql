-- Migration to add status field to existing tasks table
-- Run this in your Supabase SQL Editor after the initial setup

-- Add status column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add check constraint for status values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'completed', 'deleted'));

-- Update existing tasks to have proper status based on completed field
UPDATE tasks SET status = 'pending' WHERE status IS NULL AND completed = false;
UPDATE tasks SET status = 'completed' WHERE status IS NULL AND completed = true;

-- Create index on status field for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Verify the migration
SELECT 
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_tasks,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status_tasks
FROM tasks;

-- Add soft-delete support for lists
ALTER TABLE lists ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE lists DROP CONSTRAINT IF EXISTS lists_status_check;
ALTER TABLE lists ADD CONSTRAINT lists_status_check CHECK (status IN ('active','deleted'));
UPDATE lists SET status = 'active' WHERE status IS NULL;
CREATE INDEX IF NOT EXISTS idx_lists_status ON lists(status);
