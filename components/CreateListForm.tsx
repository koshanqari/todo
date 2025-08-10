'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types'

interface CreateListFormProps {
  variant?: 'inline' | 'default'
  onCreated?: (list: { id: string; name: string; created_at: string; status?: 'active' | 'deleted' }) => void
}

export default function CreateListForm({ variant = 'default', onCreated }: CreateListFormProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const createList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('lists')
        .insert([{ name: newListName.trim() }])
        .select()

      if (error) throw error

      setNewListName('')
      setIsCreating(false)

      if (data && data[0]) {
        if (onCreated) {
          onCreated(data[0] as any)
        } else {
          // fallback: navigate to the new list
          router.push(`/list/${data[0].id}`)
        }
      }
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isCreating) {
    return (
      <div className={variant === 'inline' ? '' : 'flex justify-center'}>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-2 bg-white hover:bg-keep-gray-50 text-keep-gray-700 px-6 py-3 rounded-full shadow-keep hover:shadow-keep-hover border border-keep-gray-200 transition-all duration-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create a list</span>
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="keep-card p-6">
        <form onSubmit={createList} className="space-y-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Title"
            className="keep-input text-lg font-medium"
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="keep-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setNewListName('')
                }}
                disabled={isSubmitting}
                className="keep-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
