export interface List {
  id: string
  name: string
  status: 'active' | 'deleted'
  created_at: string
}

export interface Task {
  id: string
  list_id: string
  title: string
  description: string | null
  completed: boolean
  status: 'pending' | 'completed' | 'deleted'
  created_at: string
}

export interface NewTask {
  title: string
  description: string
}

export interface Database {
  public: {
    Tables: {
      lists: {
        Row: List
        Insert: Omit<List, 'id' | 'created_at'>
        Update: Partial<Omit<List, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
    }
  }
}
