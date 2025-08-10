import Link from 'next/link'
import { List } from '../types'

interface ListHeaderProps {
  list: List
}

export default function ListHeader({ list }: ListHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <div>
          <h1 className="text-3xl font-medium text-keep-gray-900 mb-2">{list.name}</h1>
          <p className="text-keep-gray-500">
            Created {new Date(list.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
