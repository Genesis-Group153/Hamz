'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Ticket,
  Clock,
  Shield,
  Award
} from 'lucide-react';

export const ProfessionalHero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLocation && selectedLocation !== 'all') params.set('location', selectedLocation);
    
    window.location.href = `/events?${params.toString()}`;
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Music', label: 'Music' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Business', label: 'Business' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Food', label: 'Food & Drink' },
    { value: 'Health', label: 'Health & Fitness' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'Kampala', label: 'Kampala' },
    { value: 'Entebbe', label: 'Entebbe' },
    { value: 'Jinja', label: 'Jinja' },
    { value: 'Mbarara', label: 'Mbarara' },
    { value: 'Gulu', label: 'Gulu' },
    { value: 'Mbale', label: 'Mbale' }
  ];

  return (
    <section className="relative bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gray-200/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-gray-300/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gray-200/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="animate-fade-in">
            <Badge className="bg-black text-white border-0 px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow">
              <Ticket className="h-4 w-4 mr-2" />
              Premium Event Platform
            </Badge>
          </div>
          
          {/* Heading */}
          <div className="animate-fade-in-up animation-delay-200">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black mb-6">
              Find Your Next
              <span className="block text-black">
                Amazing Experience
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover and book tickets for concerts, festivals, sports, and more
            </p>
          </div>

          {/* Enhanced Search Box */}
          <div className="animate-fade-in-up animation-delay-400">
            <Card className="p-2 shadow-2xl border border-gray-300 bg-white backdrop-blur-md rounded-2xl max-w-3xl mx-auto">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search events, artists, venues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-12 h-14 text-base bg-transparent border-0 focus-visible:ring-0 font-medium"
                      />
                    </div>
                  </div>

                  {/* Category Select */}
                  <div className="md:w-48">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-14 border-0 bg-transparent focus:ring-0 font-medium">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Select */}
                  <div className="md:w-48">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-14 border-0 bg-transparent focus:ring-0 font-medium">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Button */}
                  <Button 
                    size="lg" 
                    onClick={handleSearch}
                    className="h-14 px-8 bg-black hover:bg-gray-800 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="animate-fade-in animation-delay-600">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-8">
              <div className="flex items-center gap-2 text-gray-700">
                <Shield className="h-5 w-5 text-black" />
                <span className="text-sm font-semibold">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-black" />
                <span className="text-sm font-semibold">Instant Tickets</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Star className="h-5 w-5 text-black" />
                <span className="text-sm font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="h-5 w-5 text-black" />
                <span className="text-sm font-semibold">2M+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
