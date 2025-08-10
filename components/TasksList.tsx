'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Task } from '../types'
import TaskItem from './TaskItem'
import AddTaskForm from './AddTaskForm'
import TempTaskForm from './TempTaskForm'

interface TasksListProps {
  listId: string
  initialTasks: Task[]
}

export default function TasksList({ listId, initialTasks }: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showTempForm, setShowTempForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Set up real-time subscription for tasks
    const subscription = supabase
      .channel(`tasks_${listId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks'
      }, (payload: any) => {
        // Only update if the change affects our current list
        if (payload.new && payload.new.list_id === listId) {
          // Add new task to local state
          setTasks(prevTasks => [payload.new, ...prevTasks])
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks'
      }, (payload: any) => {
        // Only update if the change affects our current list
        if (payload.new && payload.new.list_id === listId) {
          // Update task in local state
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === payload.new.id ? payload.new : task
            )
          )
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks'
      }, (payload: any) => {
        // Only update if the change affects our current list
        if (payload.old && payload.old.list_id === listId) {
          // Remove task from local state
          setTasks(prevTasks => 
            prevTasks.filter(task => task.id !== payload.old.id)
          )
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, listId])

  // Function to add a new task to the top of the list
  const addTaskToTop = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks])
    setShowTempForm(false) // Hide the temp form after task is created
  }

  // Function to update a task in the list
  const updateTaskInList = (taskId: string, updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    )
  }

  // Function to delete a task from the list
  const deleteTaskFromList = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
  }

  // Function to show the temporary task form
  const showTempTaskForm = () => {
    setShowTempForm(true)
  }

  // Function to cancel the temporary task form
  const cancelTempTaskForm = () => {
    setShowTempForm(false)
  }

  // Filter tasks by status (handle legacy tasks without status field)
  const pendingTasks = tasks.filter(task => 
    task.status === 'pending' || 
    (!task.status && !task.completed)
  )
  const completedTasks = tasks.filter(task => 
    task.status === 'completed' || 
    (task.completed && task.status !== 'deleted')
  )
  const deletedTasks = tasks.filter(task => task.status === 'deleted')

  // Function to recover a deleted task
  const recoverTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'pending', completed: false })
        .eq('id', taskId)

      if (error) throw error

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: 'pending', completed: false } : task
        )
      )
    } catch (error) {
      console.error('Error recovering task:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-keep-gray-900">Pending ({pendingTasks.length})</h2>
        <AddTaskForm 
          listId={listId} 
          onTaskAdded={addTaskToTop} 
          onCreateTempTask={showTempTaskForm}
        />
      </div>
      
      {/* Show temporary task form at the top when adding */}
      {showTempForm && (
        <TempTaskForm
          listId={listId}
          onTaskCreated={addTaskToTop}
          onCancel={cancelTempTaskForm}
        />
      )}

      {/* Pending Section */}
      <div className="mb-8">
        {pendingTasks.length === 0 && !showTempForm ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-keep-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-keep-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-keep-gray-500 text-sm">No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={updateTaskInList}
                onDelete={deleteTaskFromList}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center space-x-2 text-keep-gray-600 hover:text-keep-gray-800 mb-4 transition-colors duration-200"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showCompleted ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium">Completed ({completedTasks.length})</span>
          </button>
          
          {showCompleted && (
            <div className="space-y-3 ml-4">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={updateTaskInList}
                  onDelete={deleteTaskFromList}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deleted Section */}
      {deletedTasks.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center space-x-2 text-keep-gray-600 hover:text-keep-gray-800 mb-4 transition-colors duration-200"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showDeleted ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium">Deleted ({deletedTasks.length})</span>
          </button>
          
          {showDeleted && (
            <div className="space-y-3 ml-4">
              {deletedTasks.map((task) => (
                <div key={task.id} className="keep-card p-4 opacity-75">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-keep-gray-700 line-through">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-keep-gray-500 mt-1 line-through">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => recoverTask(task.id)}
                      className="text-keep-blue-600 hover:text-keep-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      Recover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no tasks exist */}
      {tasks.length === 0 && !showTempForm && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-keep-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-keep-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-keep-gray-900 mb-2">No tasks yet</h3>
          <p className="text-keep-gray-500">Add your first task to get started!</p>
        </div>
      )}
    </div>
  )
}
