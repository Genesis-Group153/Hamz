'use client'

import { Calendar, Eye, Edit, MoreHorizontal } from 'lucide-react'

export const RecentEvents = () => {
  const events = [
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      date: 'Jul 15, 2024',
      status: 'Active',
      tickets: '234/500',
      revenue: '$8,450',
    },
    {
      id: 2,
      title: 'Tech Conference Pro',
      date: 'Aug 22, 2024',
      status: 'Draft',
      tickets: '89/200',
      revenue: '$3,200',
    },
    {
      id: 3,
      title: 'Business Networking Event',
      date: 'Jun 30, 2024',
      status: 'Completed',
      tickets: '156/180',
      revenue: '$5,670',
    },
  ]

  const statusColors = {
    Active: 'bg-green-500/20 text-green-400 border-green-500/50',
    Draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Events</h3>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-medium">{event.title}</h4>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs border ${statusColors[event.status as keyof typeof statusColors]}`}>
                {event.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                <span className="text-gray-400">
                  Tickets: <span className="text-white">{event.tickets}</span>
                </span>
                <span className="text-gray-400">
                  Revenue: <span className="text-green-400">{event.revenue}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors">
          View All Events →
        </button>
      </div>
    </div>
  )
}
