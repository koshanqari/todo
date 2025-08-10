-- Test query to check current database state
-- Run this in your Supabase SQL Editor to see what's happening

-- Check if status column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'status';

-- Check current task data
SELECT 
  id,
  title,
  completed,
  status,
  CASE 
    WHEN status IS NULL THEN 'NO_STATUS'
    WHEN status = 'pending' THEN 'PENDING'
    WHEN status = 'completed' THEN 'COMPLETED'
    WHEN status = 'deleted' THEN 'DELETED'
    ELSE 'UNKNOWN: ' || status
  END as status_display
FROM tasks 
ORDER BY created_at DESC 
LIMIT 10;

-- Check task counts by status
SELECT 
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_tasks,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status_tasks,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed_boolean,
  COUNT(CASE WHEN completed = false THEN 1 END) as pending_boolean
FROM tasks;
