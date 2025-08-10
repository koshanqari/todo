'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Task } from '../types'

interface TempTaskFormProps {
  listId: string
  onTaskCreated: (task: Task) => void
  onCancel: () => void
}

export default function TempTaskForm({ listId, onTaskCreated, onCancel }: TempTaskFormProps) {
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          list_id: listId,
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          completed: false,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      // Add the new task to the local state
      onTaskCreated(data)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="keep-card p-4 mb-4">
      <form onSubmit={createTask} className="space-y-3">
        <input
          type="text"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Task title"
          className="keep-input text-sm"
          autoFocus
          disabled={isSubmitting}
        />
        
        <textarea
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          placeholder="Description (optional)"
          rows={2}
          className="keep-input resize-none text-sm"
          disabled={isSubmitting}
        />
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="keep-button-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="keep-button-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
