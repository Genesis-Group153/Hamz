'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default function FuturePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Rocket className="h-10 w-10" />
            The Future
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                With certification milestones achieved and commercial facilities opening in 2025, Nakivubo Stadium is poised to host <strong>domestic league games, regional tournaments, concerts, and cultural events</strong>.
              </p>
              <p>
                Plans are underway to introduce <strong>smart fan systems, ticketing integrations, and sustainability initiatives</strong> including solar energy and waste recycling systems.
              </p>
              <p>
                Together with other national sports projects, Nakivubo cements Kampala's position as a <strong>regional capital for sports, culture, and entertainment</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

