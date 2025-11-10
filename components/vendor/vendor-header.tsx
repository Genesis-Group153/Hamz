'use client'

import { 
  Bell, 
  Search, 
  Calendar,
  TrendingUp
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useVendorDashboard } from '@/lib/hooks/useVendorDashboard'

export const VendorHeader = () => {
  const { data: session } = useSession()
  const { data: dashboard } = useVendorDashboard()
  
  const analytics = dashboard?.analytics
  const totalRevenue = analytics?.totalRevenue || 0
  const totalEvents = analytics?.totalEvents || 0

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events, bookings..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-80"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Revenue: UGX {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{totalEvents} {totalEvents === 1 ? 'Event' : 'Events'}</span>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-medium">
                {session?.user?.name?.charAt(0) || 'V'}
              </span>
            </div>
            <div>
              <p className="text-gray-900 text-sm font-medium">{session?.user?.name || 'Vendor'}</p>
              <p className="text-gray-500 text-xs">Professional</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
