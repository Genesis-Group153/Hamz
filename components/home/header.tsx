'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@/components/ui/icons'

export const Header = () => {
  return (
    <header className="bg-[#161616] text-white border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="bg-orange-500 text-black px-4 py-2 rounded-md font-semibold">
          Hamz Stadium
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Home
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Discover
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Contact Us
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Tickets
          </a>
        </nav>

        {/* Login Button */}
        <Link href="/auth/login">
          <Button variant="outline" className="bg-transparent border-gray-600 text-orange-500 hover:bg-gray-800 hover:border-orange-400">
            Log In
            <ArrowRightIcon />
          </Button>
        </Link>
      </div>
    </header>
  )
}
