import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-keep-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-keep-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-keep-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-medium text-keep-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-keep-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 keep-button-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  )
}
