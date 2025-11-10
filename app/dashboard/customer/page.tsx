'use client'

import { useSession, signOut } from 'next-auth/react'

export default function CustomerDashboard() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Customer Dashboard</h1>
            <p className="text-gray-400">Welcome back, {session?.user?.name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Bookings</h3>
            <p className="text-gray-400 text-sm mb-4">View and manage your event bookings</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              View Bookings
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Browse Events</h3>
            <p className="text-gray-400 text-sm mb-4">Discover new events and activities</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Browse Events
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
            <p className="text-gray-400 text-sm mb-4">Manage your account preferences</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Settings
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <p className="text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  )
}
