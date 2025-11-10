'use client'

import { User, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'

export const RecentBookings = () => {
  const bookings = [
    {
      id: 1,
      customer: 'John Smith',
      event: 'Summer Music Festival',
      tickets: '2x VIP',
      date: '2024-07-15',
      status: 'Confirmed',
      amount: '$240',
    },
    {
      id: 2,
      customer: 'Sarah Johnson',
      event: 'Tech Conference Pro',
      tickets: '1x General',
      date: '2024-08-22',
      status: 'Pending',
      amount: '$120',
    },
    {
      id: 3,
      customer: 'Mike Wilson',
      event: 'Business Networking',
      tickets: '3x Standard',
      date: '2024-06-30',
      status: 'Confirmed',
      amount: '$180',
    },
    {
      id: 4,
      customer: 'Emma Davis',
      event: 'Music Festival',
      tickets: '1x VIP',
      date: '2024-07-15',
      status: 'Cancelled',
      amount: '$120',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'text-green-400'
      case 'Pending':
        return 'text-yellow-400'
      case 'Cancelled':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
        <div className="text-sm text-gray-400">Last 7 days</div>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{booking.customer}</h4>
                  <p className="text-gray-400 text-sm">{booking.event}</p>
                </div>
              </div>
              <span className={`flex items-center space-x-1 text-xs ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span>{booking.status}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.date}</span>
                </div>
                <span className="text-gray-400">
                  {booking.tickets}
                </span>
              </div>
              <span className="text-green-400 font-medium">{booking.amount}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors">
          View All Bookings →
        </button>
      </div>
    </div>
  )
}
