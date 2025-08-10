# Keep - Notes & Lists

A minimal, clean shared to-do list webapp inspired by Google Keep, built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- **Google Keep-inspired design** with clean, modern UI and smooth animations
- **Three-section task organization**:
  - Pending tasks (always visible)
  - Completed tasks (collapsible dropdown)
  - Deleted tasks (collapsible dropdown with recovery option)
- **Real-time updates** for all connected users
- **Task editing** - click the edit icon to modify any task
- **Soft deletion** - tasks are marked as deleted but can be recovered
- **Mobile-first, fully responsive** layout
- **No authentication required** - public access for MVP
- **Beautiful empty states** and thoughtful UX

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom Google Keep design system
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime with granular event handling
- **Deployment**: Vercel-ready

## Database Schema

### Lists Table
- `id` (uuid, primary key)
- `name` (text)
- `created_at` (timestamp)

### Tasks Table
- `id` (uuid, primary key)
- `list_id` (uuid, foreign key to lists.id)
- `title` (text)
- `description` (text)
- `completed` (boolean, default false)
- `status` (text, default 'pending', check: 'pending'|'completed'|'deleted')
- `created_at` (timestamp)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local`
4. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Create Database Tables
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create lists table
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (required for Supabase)
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for public access)
CREATE POLICY "Allow all operations on lists" ON lists FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_lists_created_at ON lists(created_at);
```

### 4. Migration (if updating existing database)
If you have an existing database, run this migration script:

```sql
-- Add status column to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add check constraint for status values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'completed', 'deleted'));

-- Update existing tasks to have proper status based on completed field
UPDATE tasks SET status = 'pending' WHERE status IS NULL AND completed = false;
UPDATE tasks SET status = 'completed' WHERE status IS NULL AND completed = true;

-- Create index on status field for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create a List**: Click "Take a note..." on the homepage
2. **Add Tasks**: Open a list and click "Add Task" button
3. **Edit Tasks**: Click the edit icon on any task to modify it
4. **Mark Complete**: Check the checkbox next to any task
5. **View Sections**: 
   - Pending tasks are always visible
   - Click "Completed Tasks" dropdown to view completed items
   - Click "Deleted Tasks" dropdown to view deleted items
6. **Recover Deleted Tasks**: Click "Recover" on any deleted task
7. **Real-time Updates**: All changes sync automatically across devices

## Project Structure

```
├── app/                     # Next.js 14 App Router
│   ├── layout.tsx          # Root layout with Google Sans font
│   ├── page.tsx            # Homepage (lists dashboard)
│   ├── list/[id]/page.tsx  # Individual list page
│   └── not-found.tsx       # Custom 404 page
├── components/              # React components
│   ├── CreateListForm.tsx  # Form to create new lists
│   ├── ListsDisplay.tsx    # Display and manage lists
│   ├── ListHeader.tsx      # List page header
│   ├── TasksList.tsx       # Main tasks container with 3 sections
│   ├── TaskItem.tsx        # Individual task with edit/delete
│   ├── AddTaskForm.tsx     # Button to add new tasks
│   └── TempTaskForm.tsx    # Inline form for new tasks
├── types/                   # TypeScript type definitions
│   └── index.ts            # Database and component types
├── styles/                  # Global styles
│   └── globals.css         # Tailwind CSS and custom styles
├── tailwind.config.js      # Tailwind configuration with Keep colors
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Design System

The app uses a custom Google Keep-inspired design system:

- **Colors**: `keep-gray`, `keep-blue`, `keep-yellow` palette
- **Typography**: Google Sans font family
- **Shadows**: Custom `keep` and `keep-hover` shadow utilities
- **Spacing**: Consistent spacing scale with `keep-` prefixed utilities
- **Components**: Reusable `keep-card`, `keep-input`, `keep-button` classes

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app is a standard Next.js app and can be deployed to any platform that supports Node.js.

## Customization

- **Colors**: Modify `tailwind.config.js` to change the Keep color scheme
- **Styling**: Update `styles/globals.css` for global styles and custom utilities
- **Components**: Modify individual components in the `components/` directory
- **Task Organization**: Adjust the filtering logic in `TasksList.tsx`

## Troubleshooting

- **Database connection issues**: Verify your Supabase credentials in `.env.local`
- **Real-time not working**: Check that Row Level Security policies allow all operations
- **Build errors**: Ensure all dependencies are installed with `npm install`
- **TypeScript errors**: Run `npm run type-check` to identify type issues
- **Migration issues**: Run the migration script in Supabase SQL editor

## Recent Updates

- **v2.0**: Complete UI redesign inspired by Google Keep
- **v2.1**: Added 3-section task organization (Pending, Completed, Deleted)
- **v2.2**: Implemented soft deletion with task recovery
- **v2.3**: Enhanced task editing and real-time updates
- **v2.4**: Migrated to Next.js 14 App Router and TypeScript

## License

MIT License - feel free to use this project for any purpose.
