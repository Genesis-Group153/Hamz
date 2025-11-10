'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    // Redirect based on user role
    const userRole = session.user?.role?.toLowerCase()
    if (userRole?.includes('end')) {
      router.push('/dashboard/customer')
    } else if (userRole?.includes('vendor')) {
      router.push('/dashboard/vendor')
    } else if (userRole?.includes('admin')) {
      router.push('/dashboard/admin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-gray-700 rounded mb-4"></div>
          <div className="w-20 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Session Info</h2>
          <pre className="text-gray-400 text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
