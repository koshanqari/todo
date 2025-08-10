'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Task } from '../types'

interface TaskItemProps {
  task: Task
  onUpdate: (taskId: string, updatedTask: Task) => void
  onDelete: (taskId: string) => void
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ title: task.title, description: task.description || '' })
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggleCompleted = async () => {
    if (isUpdating) return
    setIsUpdating(true)

    try {
      const newStatus = task.completed ? 'pending' : 'completed'
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !task.completed,
          status: newStatus
        })
        .eq('id', task.id)

      if (error) throw error
      
      // Update local state
      onUpdate(task.id, { ...task, completed: !task.completed, status: newStatus })
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const saveEdit = async () => {
    if (isUpdating || !editData.title.trim()) return
    setIsUpdating(true)

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: editData.title.trim(),
          description: editData.description.trim() || null
        })
        .eq('id', task.id)

      if (error) throw error
      
      // Update local state
      onUpdate(task.id, { 
        ...task, 
        title: editData.title.trim(),
        description: editData.description.trim() || null
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const cancelEdit = () => {
    setEditData({ title: task.title, description: task.description || '' })
    setIsEditing(false)
  }

  const deleteTask = async () => {
    if (isUpdating) return
    setIsUpdating(true)

    try {
      // Soft delete - set status to deleted instead of removing from database
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', task.id)

      if (error) throw error
      
      // Update local state to mark as deleted
      onUpdate(task.id, { ...task, status: 'deleted' })
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="keep-card p-4 group hover:shadow-keep-hover transition-all duration-200">
      <div className="flex items-start space-x-3">
        <button
          onClick={toggleCompleted}
          disabled={isUpdating}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
            task.completed 
              ? 'bg-keep-blue-500 border-keep-blue-500' 
              : 'border-keep-gray-300 hover:border-keep-blue-400'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {task.completed && (
            <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="keep-input text-sm"
                autoFocus
                disabled={isUpdating}
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Description (optional)"
                rows={2}
                className="keep-input resize-none text-sm"
                disabled={isUpdating}
              />
              <div className="flex space-x-2">
                <button
                  onClick={saveEdit}
                  disabled={isUpdating}
                  className="keep-button-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={isUpdating}
                  className="keep-button-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={`text-base font-medium ${
                task.completed 
                  ? 'text-keep-gray-500 line-through' 
                  : 'text-keep-gray-900'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 ${
                  task.completed 
                    ? 'text-keep-gray-400 line-through' 
                    : 'text-keep-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              disabled={isUpdating}
              className={`p-1 rounded-full hover:bg-keep-gray-100 ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-label="Edit task"
            >
              <svg className="w-4 h-4 text-keep-gray-400 hover:text-keep-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={deleteTask}
            disabled={isUpdating}
            className={`p-1 rounded-full hover:bg-red-50 ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label="Delete task"
          >
            <svg className="w-4 h-4 text-keep-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
