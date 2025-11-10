'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Building2, Trophy, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Info className="h-10 w-10" />
            About Hamz Stadium
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Modern Multi-Purpose Venue */}
          <Card className="border-gray-300 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-black">Modern Multi-Purpose Venue</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Experience world-class events at our state-of-the-art facility. Hamz Stadium has been meticulously renovated to meet international standards, setting a new benchmark for sports venues in Uganda.
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Major Events */}
          <Card className="border-gray-300 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-black">Upcoming Major Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Get ready for <strong className="text-black">AFCON 2027</strong> and <strong className="text-black">CHAN 2024</strong>! Hamz Stadium is set to host these prestigious international tournaments, marking a new chapter in Uganda's sporting legacy.
              </p>
            </CardContent>
          </Card>

          {/* Rich History */}
          <Card className="border-gray-300 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-black">Rich History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                From its roots as the home of <strong className="text-black">SC Villa</strong> to now hosting <strong className="text-black">URA FC</strong> and <strong className="text-black">Express FC</strong>, Hamz Stadium continues to be the beating heart of Ugandan football, blending its storied past with an exciting future.
              </p>
            </CardContent>
          </Card>

          {/* Expanded Capacity */}
          <Card className="border-gray-300 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-black">Expanded Capacity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                With an impressive capacity increase from <strong className="text-black">21,000 to 35,000 seats</strong>, Hamz Stadium now offers an unparalleled atmosphere for fans. Officially opened on <strong className="text-black">April 25, 2024</strong>, it stands ready to create unforgettable memories.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

