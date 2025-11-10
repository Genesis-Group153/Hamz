'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  BarChart3, 
  Ticket, 
  Users, 
  Settings, 
  Plus,
  Building2,
  LogOut,
  Bell,
  QrCode,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'

const navigation = [
  { name: 'Dashboard', href: '/vendor', icon: BarChart3 },
  { name: 'Events', href: '/vendor/events', icon: Calendar },
  { name: 'Tickets', href: '/vendor/tickets', icon: Ticket },
  { name: 'Staff', href: '/vendor/staff', icon: UserPlus },
  { name: 'Scan Tickets', href: '/vendor/scan-tickets', icon: QrCode },
  { name: 'Bookings', href: '/vendor/bookings', icon: Users },
  { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/vendor/settings', icon: Settings },
]

export const VendorSidebar = () => {
  // Collapsed by default on mobile, expanded on desktop
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Handle logout - clear both NextAuth session and localStorage
  const handleLogout = async () => {
    try {
      // Clear NextAuth session
      await signOut({ redirect: false })
      // Clear localStorage tokens
      authApi.logout()
      // Clear React Query cache
      queryClient.clear()
      // Show success message
      toast.success('Logged out successfully')
      // Redirect to login
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if signOut fails, still clear localStorage and redirect
      authApi.logout()
      queryClient.clear()
      router.push('/auth/login')
    }
  }

  // Auto-collapse/expand based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on screens smaller than 1024px (lg breakpoint)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`
      relative h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all hover:bg-gray-50 active:scale-95"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white p-2.5 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg">Hamz Stadium</h2>
              <p className="text-gray-500 text-xs">Vendor Portal</p>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Info */}
      <div className="p-4 border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-medium text-sm">
                {session?.user?.name?.charAt(0) || 'V'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-medium text-sm">
                {session?.user?.name?.charAt(0) || 'V'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-gray-900 font-medium text-sm truncate">{session?.user?.name || 'Vendor'}</h3>
              <p className="text-gray-500 text-xs">Event Organizer</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg transition-all group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
        
        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>
        
        {/* Create Event Button */}
        <Link
          href="/vendor/events"
          title={isCollapsed ? 'Create Event' : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 group relative`}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">Create Event</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Create Event
            </div>
          )}
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        {/* Notifications */}
        <button
          title={isCollapsed ? 'Notifications' : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all active:bg-gray-100 group relative`}
        >
          <div className="relative">
            <Bell className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-gray-600" />
            {!isCollapsed && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold">3</span>}
            {isCollapsed && <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>}
          </div>
          {!isCollapsed && (
            <>
              <span className="font-medium text-sm flex-1 text-left">Notifications</span>
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">3</span>
            </>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Notifications (3)
            </div>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:bg-red-100 group relative`}
        >
          <LogOut className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-red-600" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
