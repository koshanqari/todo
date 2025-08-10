import { Suspense } from 'react'
import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Database } from '../../../types'
import ListHeader from '../../../components/ListHeader'
import TasksList from '../../../components/TasksList'

interface ListPageProps {
  params: { id: string }
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  // Fetch list and tasks on the server
  const [listResult, tasksResult] = await Promise.all([
    supabase.from('lists').select('*').eq('id', id).single(),
    supabase.from('tasks').select('*').eq('list_id', id).order('created_at', { ascending: true })
  ])

  if (listResult.error || !listResult.data) {
    notFound()
  }

  const list = listResult.data
  const tasks = tasksResult.data || []

  return (
    <div className="min-h-screen bg-keep-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-keep-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="https://purplerocket.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3"
              aria-label="ToDoShare by PurpleRocket"
            >
              <div className="w-8 h-8 bg-keep-yellow-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-keep-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-xl font-semibold text-keep-gray-900">ToDoShare</div>
                <div className="text-xs text-keep-gray-500 group-hover:text-keep-gray-700">by PurpleRocket</div>
              </div>
            </a>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 keep-button-secondary hover:bg-keep-gray-200"
              aria-label="Back to lists"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to lists</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* List Header */}
        <ListHeader list={list} />

        {/* Tasks List */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2 text-keep-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-keep-blue-500"></div>
              <span>Loading tasks...</span>
            </div>
          </div>
        }>
          <TasksList listId={id} initialTasks={tasks} />
        </Suspense>
      </main>
    </div>
  )
}
