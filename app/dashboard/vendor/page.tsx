'use client'

import { useSession, signOut } from 'next-auth/react'

export default function VendorDashboard() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Vendor Dashboard</h1>
            <p className="text-gray-400">Manage your events, {session?.user?.name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Events</h3>
            <p className="text-gray-400 text-sm mb-4">Create and manage your events</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Manage Events
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Sales</h3>
            <p className="text-gray-400 text-sm mb-4">Track your ticket sales and analytics</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              View Analytics
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bookings</h3>
            <p className="text-gray-400 text-sm mb-4">Manage customer bookings</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              View Bookings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Total Events</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Tickets Sold</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Revenue</span>
                <span>$0</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Approval Status</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  session?.user?.isApproved 
                    ? 'bg-green-900/50 text-green-300 border border-green-700' 
                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                }`}>
                  {session?.user?.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Role</span>
                <span className="capitalize">{session?.user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
