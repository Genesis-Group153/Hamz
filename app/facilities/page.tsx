'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Building2, Star, Dumbbell, Trophy, Target } from 'lucide-react';
import Image from 'next/image';

export default function FacilitiesPage() {
  const facilities = [
    {
      icon: Building2,
      title: "35,000 Seating Capacity",
      description: "All-seater stadium with VIP and VVIP boxes for premium experience",
      image: "/facilities/seat.jpg"
    },
    {
      icon: Star,
      title: "FIFA Certified Turf",
      description: "2024 certified artificial turf meeting international standards",
      image: "/facilities/stadium-1.jpg"
    },
    {
      icon: Target,
      title: "Basketball Court",
      description: "Professional basketball court with modern facilities",
      image: "/facilities/basketball.jpg"
    },
    {
      icon: Dumbbell,
      title: "Gym & Fitness Center",
      description: "State-of-the-art gym and fitness facilities for athletes",
      image: "/facilities/gym.jpg"
    },
    {
      icon: Trophy,
      title: "Indoor Games",
      description: "Multi-purpose indoor games facility for various sports",
      image: "/facilities/indoorgames.jpeg"
    },
    {
      icon: Trophy,
      title: "Netball Court",
      description: "Professional netball court with international standards",
      image: "/facilities/netball.jpg"
    },
    {
      icon: Building2,
      title: "Conference & Hospitality",
      description: "Conference suites, hospitality lounges, and athlete hostels",
      image: "/facilities/241809454.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black flex items-center justify-center gap-3">
            <Settings className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <span>Facilities</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            World-class facilities at Hamz Stadium
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {facilities.map((facility, index) => {
            const Icon = facility.icon;
            return (
              <Card key={index} className="border-gray-300 hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
                <div className="relative h-48 sm:h-56 w-full overflow-hidden flex-shrink-0">
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3 sm:pb-4 flex-grow">
                  <CardTitle className="text-base sm:text-lg font-bold text-black leading-tight">{facility.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {facility.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <ProfessionalFooter />
    </div>
  );
}
