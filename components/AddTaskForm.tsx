'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Task } from '../types'

interface AddTaskFormProps {
  listId: string
  onTaskAdded: (task: Task) => void
  onCreateTempTask: () => void
}

export default function AddTaskForm({ listId, onTaskAdded, onCreateTempTask }: AddTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const createTempTask = () => {
    onCreateTempTask()
  }

  return (
    <button
      onClick={createTempTask}
      disabled={isSubmitting}
      className="inline-flex items-center space-x-2 bg-keep-blue-600 hover:bg-keep-blue-700 text-white px-4 py-2 rounded-lg shadow-keep hover:shadow-keep-hover transition-all duration-200 font-medium text-sm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Add Task</span>
    </button>
  )
}
