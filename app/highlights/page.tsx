'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function HighlightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Star className="h-10 w-10" />
            Stadium Highlights
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-black">Feature</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-black">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Capacity</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">35,000 all-seater stadium</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Field</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">FIFA-certified artificial turf (2024)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">VIP Areas</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Executive, VVIP & hospitality suites</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Sports Hosted</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Football, Boxing, Netball, Basketball, Kickboxing</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Commercial Integration</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Ham Shopping Grounds – retail and office complex</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Lighting & Broadcast</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Full-LED floodlight system, broadcast-grade cameras</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Parking & Access</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Secure multi-level parking, smart ticketing</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-black">Compliance</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Meets FIFA/CAF safety and performance standards</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

