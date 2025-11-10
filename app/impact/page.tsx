'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Globe, Award } from 'lucide-react';

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10" />
            Community & Economic Impact
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto mb-8">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Nakivubo Stadium is more than a sports venue; it is a <strong>catalyst for economic revitalization</strong> in central Kampala.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-black" />
                <p className="font-semibold text-black text-lg">3,000+ Jobs Created</p>
              </div>
              <p className="text-sm text-gray-600">Direct and indirect employment during construction and operations</p>
            </CardContent>
          </Card>
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-black" />
                <p className="font-semibold text-black text-lg">Local Trade Stimulation</p>
              </div>
              <p className="text-sm text-gray-600">Through integrated retail zones and commercial spaces</p>
            </CardContent>
          </Card>
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-black" />
                <p className="font-semibold text-black text-lg">Sports Tourism</p>
              </div>
              <p className="text-sm text-gray-600">Attracting regional and international event opportunities</p>
            </CardContent>
          </Card>
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-black" />
                <p className="font-semibold text-black text-lg">National Symbol</p>
              </div>
              <p className="text-sm text-gray-600">Of progress, resilience, and private initiative</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                It stands today as a model of <strong>African-led urban development</strong>, showcasing how local enterprise can deliver global-standard results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

