'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, LocationIcon, MapIcon } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'

interface EventCardProps {
  id?: string
  title: string
  category: string
  date: string
  time: string
  location: string
  imageUrl: string
  imageAlt: string
  featured?: boolean
}

export const EventCard = ({ 
  id,
  title, 
  category, 
  date, 
  time, 
  location, 
  imageUrl, 
  imageAlt,
  featured = false 
}: EventCardProps) => {
  const router = useRouter()

  const handleCardClick = () => {
    if (id) {
      router.push(`/events/${id}`)
    }
  }
  const cardClasses = featured 
    ? "w-full h-96 relative overflow-hidden rounded-lg"
    : "w-full h-80 relative overflow-hidden rounded-lg"

  return (
    <Card 
      className={`${cardClasses} cursor-pointer hover:shadow-2xl transition-all duration-300`}
      onClick={handleCardClick}
    >
      <div className="relative h-full group">
        {/* Event Image */}
        <img 
          src={imageUrl} 
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Event Info */}
        <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-orange-500 text-black hover:bg-orange-600">
              {category}
            </Badge>
            
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
            
            <div className="flex items-center text-sm text-gray-300">
              <CalendarIcon />
              <span className="ml-2">{date}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-300">
              <CalendarIcon />
              <span className="ml-2">{time}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-300">
                <LocationIcon />
                <div className="ml-2">
                  <div>{location}</div>
                  <div className="text-xs">Kimihurura</div>
                </div>
              </div>
              
              <Button size="sm" variant="link" className="text-orange-500 hover:text-orange-400 p-0">
                <MapIcon />
                <span className="ml-1 text-xs">View Map</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
