'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PartyIcon, MovieIcon, MicIcon, BasketballIcon, MoreIcon } from '@/components/ui/icons'

export const CategoryFilters = () => {
  const categories = [
    { name: "Party", icon: PartyIcon },
    { name: "Movies", icon: MovieIcon },
    { name: "Concerts", icon: MicIcon },
    { name: "Basketball", icon: BasketballIcon },
    { name: "Basketball", icon: BasketballIcon }, // Has duplicate per design
    { name: "More", icon: MoreIcon }
  ]

  return (
    <div className="flex items-center gap-4">
      {categories.map((category, index) => (
        <Button
          key={index}
          variant="outline"
          className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-orange-500"
        >
          <category.icon />
          {category.name}
        </Button>
      ))}
    </div>
  )
}
