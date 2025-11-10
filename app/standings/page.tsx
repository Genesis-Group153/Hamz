'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <BarChart className="h-10 w-10" />
            Standings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Current league standings and statistics
          </p>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-xl text-gray-600">No standings available at the moment</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for standings updates</p>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

