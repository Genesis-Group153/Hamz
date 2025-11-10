'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { VendorSidebar } from '@/components/vendor/vendor-sidebar'
import { VendorHeader } from '@/components/vendor/vendor-header'

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return

    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    // Check if user is a vendor
    const userRole = user.role?.toLowerCase()
    if (!userRole?.includes('vendor')) {
      // Redirect based on role
      if (userRole?.includes('admin')) {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard')
      }
      return
    }
  }, [user, isLoading, isAuthenticated, router, mounted])

  // Show nothing until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-gray-200 rounded mb-4"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !user.role?.toLowerCase()?.includes('vendor')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <VendorSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
