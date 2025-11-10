'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function RedevelopmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Construction className="h-10 w-10" />
            The Redevelopment
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                In <strong>2015</strong>, the Government of Uganda, through a 49-year public-private partnership, entrusted <strong>Ham Enterprises (U) Ltd</strong>, under the leadership of <strong>Dr. Hamis Kiggundu</strong>, with the task of <strong>redeveloping the iconic stadium</strong>.
              </p>
              <p>
                Demolition of the old facility began in <strong>2017</strong>, paving the way for a fully modernized sports and commercial hub that balances <strong>athletic excellence, fan experience, and commercial sustainability</strong>.
              </p>
              <p className="font-semibold text-black mb-3 mt-6">Today, Nakivubo (Hamz) Stadium is a <strong>multi-purpose arena</strong> featuring:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-black">35,000 all-seater capacity</p>
                    <p className="text-sm text-gray-600">with VIP and VVIP boxes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-black">FIFA-certified turf (2024)</p>
                    <p className="text-sm text-gray-600">and competition-grade lighting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-black">Multi-sport courts</p>
                    <p className="text-sm text-gray-600">Boxing, basketball, volleyball, and netball</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-black">Conference & hospitality</p>
                    <p className="text-sm text-gray-600">Suites, lounges, and athlete hostels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-black">Commercial integration</p>
                    <p className="text-sm text-gray-600">Ham Shopping Grounds retail complex</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="h-2 w-2 bg-black rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-black">Security systems</p>
                    <p className="text-sm text-gray-600">State-of-the-art surveillance and access control</p>
                  </div>
                </div>
              </div>
              <p className="mt-6">
                This redevelopment is a benchmark for how <strong>private investment can elevate national infrastructure</strong> while preserving cultural identity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

