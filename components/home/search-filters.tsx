'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchIcon, CalendarIcon, ChevronDownIcon } from '@/components/ui/icons'
import { Search } from 'lucide-react'

export const SearchFilters = () => {
  return (
    <div className=" py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1 relative w-full bg-[#181717]  bg-red-[10px] rounded-[10px] flex items-center gap-2 px-4 py-4">
            <div className="">
            <Search className='text-white' size={20} />
            </div>
            <Input 
              type="text" 
              placeholder="Search Event "
              className="text-white outline-none border-none "
            />
          </div>

          {/* Filters Row */}
          <div className="flex gap-4">
            {/* Starting Date 1 */}
            <div className="relative min-w-[180px] bg-[#181717] rounded-[10px] px-4 py-2">
              <label className="block text-sm text-gray-300 mb-1">Starting Date</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                  <CalendarIcon />
                </div>
                <Input 
                  type="text" 
                  placeholder="mm/dd/yy"
                  className="pl-12 pr-4 py-3 rounded-lg text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Starting Date 2 */}
            <div className="relative min-w-[180px] bg-[#181717] rounded-[10px] px-4 py-2">
              <label className="block text-sm text-gray-300 mb-1">Ending Date</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                  <CalendarIcon />
                </div>
                <Input 
                  type="text" 
                  placeholder="mm/dd/yy"
                  className="pl-12 pr-4 py-3 rounded-lg text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[180px] bg-[#181717] rounded-[10px] px-4 py-2">
              <label className="block text-sm text-gray-300 mb-1">Category</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                  <ChevronDownIcon />
                </div>
                <Input 
                  type="text" 
                  placeholder="All Categories"
                  className="pl-12 pr-4 py-3 rounded-lg text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
