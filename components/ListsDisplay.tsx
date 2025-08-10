'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database, List } from '../types'

interface ListsDisplayProps {
  initialLists: List[]
}

export default function ListsDisplay({ initialLists }: ListsDisplayProps) {
  const [lists, setLists] = useState<List[]>(initialLists)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Set up real-time subscription
    const subscription = supabase
      .channel('lists_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lists'
      }, () => {
        // Refresh the page to get updated data
        router.refresh()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  if (lists.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-keep-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-keep-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-keep-gray-900 mb-2">No lists yet</h3>
        <p className="text-keep-gray-500">Create your first list to get started!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {lists.map((list) => (
          <div
            key={list.id}
            className="keep-card p-4 cursor-pointer group"
            onClick={() => router.push(`/list/${list.id}`)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-keep-gray-900 group-hover:text-keep-blue-600 transition-colors line-clamp-2">
                  {list.name}
                </h3>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-keep-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-keep-gray-500">
                <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>List</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
