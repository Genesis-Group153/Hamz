'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Calendar,
  User,
  ChevronDown,
  Scan,
  Building2,
  Trophy,
  FileText,
  Info,
  Settings,
  BarChart,
  Users,
  Image,
  Download
} from 'lucide-react';

export const ProfessionalHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Building2 },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Posts', href: '/posts', icon: FileText },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Facilities', href: '/facilities', icon: Settings },
    { name: 'Standings', href: '/standings', icon: BarChart },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Gallery', href: '/gallery', icon: Image },
  ];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 gap-y-2 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1.5 text-xs xl:text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap px-2 xl:px-3 py-1.5 xl:py-2 rounded-md hover:bg-muted/50"
                >
                  <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Download Magazine Button - Desktop */}
          <div className="hidden lg:flex items-center space-x-3 ml-auto">
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm rounded-full"
              asChild
            >
              <Link href="/magazine" className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                <span className="hidden xl:inline">Download Magazine</span>
                <span className="xl:hidden">Magazine</span>
              </Link>
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Login Dropdown - Desktop */}
            <div className="relative hidden sm:block">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="flex items-center gap-1.5 h-9 px-3"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Login</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isLoginDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLoginDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-2">
                      <Link 
                        href="/auth/login"
                        onClick={() => setIsLoginDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                          <User className="h-4 w-4 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-black">Vendor Login</p>
                          <p className="text-xs text-gray-600">Manage your events & tickets</p>
                        </div>
                      </Link>
                      
                      <Link 
                        href="/staff/login"
                        onClick={() => setIsLoginDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group mt-1"
                      >
                        <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                          <Scan className="h-4 w-4 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-black">Staff Login</p>
                          <p className="text-xs text-gray-600">Scan tickets & manage events</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Login Links */}
            <div className="sm:hidden flex items-center gap-1">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/staff/login">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Scan className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t">
            <div className="px-2 pt-4 pb-4 space-y-2">
              {/* Mobile Navigation Links */}
              <div className="grid grid-cols-2 gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Download Magazine */}
              <div className="pt-2">
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold w-full"
                  asChild
                >
                  <Link href="/magazine" className="flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Download Magazine</span>
                  </Link>
                </Button>
              </div>
              
              {/* Mobile Login Options */}
              <div className="pt-4 border-t mt-4">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-600 uppercase">Login As</p>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                    <User className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-black">Vendor Login</p>
                    <p className="text-xs text-gray-600">Manage your events & tickets</p>
                  </div>
                </Link>
                
                <Link
                  href="/staff/login"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                    <Scan className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-black">Staff Login</p>
                    <p className="text-xs text-gray-600">Scan tickets & manage events</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
