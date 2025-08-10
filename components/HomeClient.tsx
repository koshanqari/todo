'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import CreateListForm from './CreateListForm'
import { Database, List } from '../types'

interface HomeClientProps {
  initialLists: List[]
}

export default function HomeClient({ initialLists }: HomeClientProps) {
  const [lists, setLists] = useState<List[]>(initialLists)
  const [showDeleted, setShowDeleted] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    const subscription = supabase
      .channel('lists_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lists' }, (payload: any) => {
        setLists(prev => [payload.new as List, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lists' }, (payload: any) => {
        setLists(prev => prev.map(l => l.id === payload.new.id ? (payload.new as List) : l))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lists' }, (payload: any) => {
        setLists(prev => prev.filter(l => l.id !== payload.old.id))
      })
      .subscribe()

    return () => { subscription.unsubscribe() }
  }, [supabase])

  const activeLists = lists.filter(l => (l as any).status !== 'deleted')
  const deletedLists = lists.filter(l => (l as any).status === 'deleted')

  const softDeleteList = async (listId: string) => {
    const { error } = await supabase.from('lists').update({ status: 'deleted' }).eq('id', listId)
    if (error) {
      console.error('Error deleting list:', error)
      return
    }
    // Optimistic local update
    setLists(prev => prev.map(l => l.id === listId ? { ...l, status: 'deleted' } as List : l))
  }

  const recoverList = async (listId: string) => {
    const { error } = await supabase.from('lists').update({ status: 'active' }).eq('id', listId)
    if (error) {
      console.error('Error recovering list:', error)
      return
    }
    // Optimistic local update
    setLists(prev => prev.map(l => l.id === listId ? { ...l, status: 'active' } as List : l))
  }

  const confirmAndDelete = async (listId: string) => {
    const ok = typeof window !== 'undefined' ? window.confirm('Delete this list? It will move to Deleted and can be recovered later.') : true
    if (ok) {
      await softDeleteList(listId)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-keep-gray-900">Your Lists</h2>
        <CreateListForm
          variant="inline"
          onCreated={(list) => setLists(prev => [{ ...(list as any), status: (list as any).status ?? 'active' } as List, ...prev])}
        />
      </div>

      {/* Active lists grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {activeLists.map((list) => (
          <div key={list.id} className="keep-card p-4 group relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); confirmAndDelete(list.id) }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50"
              aria-label={`Delete ${list.name}`}
              title="Delete list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
            <div className="space-y-3" onClick={() => router.push(`/list/${list.id}`)}>
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

      {/* Deleted section */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setShowDeleted(v => !v)}
          className="flex items-center gap-2 text-sm text-keep-gray-700 hover:text-keep-gray-900"
          aria-expanded={showDeleted}
        >
          <svg className={`w-4 h-4 transition-transform ${showDeleted ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Deleted ({deletedLists.length})</span>
        </button>

        {showDeleted && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deletedLists.length === 0 && (
              <div className="text-sm text-keep-gray-500">No deleted lists</div>
            )}
            {deletedLists.map((list) => (
              <div key={list.id} className="keep-card p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-keep-gray-900 line-clamp-2">{list.name}</h3>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-keep-gray-500">
                  <span>Deleted</span>
                  <button
                    type="button"
                    onClick={() => recoverList(list.id)}
                    className="px-3 py-1 rounded-full border border-keep-gray-200 hover:bg-keep-gray-50 text-keep-gray-700"
                  >
                    Recover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


