'use client'

import { 
  Calendar, 
  Ticket, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export const VendorStats = () => {
  const stats = [
    {
      title: 'Total Events',
      value: '12',
      change: '+3 from last month',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      title: 'Sold Tickets',
      value: '1,247',
      change: '+156 from last month',
      changeType: 'positive' as const,
      icon: Ticket,
    },
    {
      title: 'Monthly Revenue',
      value: '$24,580',
      change: '+$2,340 from last month',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Customers',
      value: '892',
      change: '+45 from last month',
      changeType: 'positive' as const,
      icon: Users,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            {stat.changeType === 'positive' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
          <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
          <p className={`text-xs ${
            stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
          }`}>
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  )
}
