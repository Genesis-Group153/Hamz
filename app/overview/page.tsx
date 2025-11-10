'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Award } from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-black text-white">
            <Award className="h-4 w-4 mr-2" />
            National Icon
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Building2 className="h-10 w-10" />
            Overview
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Rising above the skyline of downtown Kampala, <strong>Nakivubo War Memorial Stadium</strong>—now known commercially as <strong>Hamz Stadium</strong>—stands as a monumental fusion of <strong>heritage, innovation, and national pride</strong>. Once Uganda's most historic football ground, the stadium has been reimagined as a <strong>35,000-seat multi-sport and events complex</strong>, redefining urban sports infrastructure in East Africa.
              </p>
              <p>
                Commissioned by <strong>H.E. President Yoweri K. Museveni on 25 April 2024</strong>, the new Nakivubo Stadium is a testament to <strong>visionary entrepreneurship, private-public collaboration</strong>, and the country's growing investment in modern, world-class facilities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

