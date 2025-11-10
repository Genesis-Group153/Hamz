'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function VisionaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <User className="h-10 w-10" />
            The Visionary Behind the Project
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>Dr. Hamis Kiggundu</strong> is a <strong>Ugandan entrepreneur, investor, author, and lawyer</strong>, best known as the founder and Chief Executive of <strong>Ham Group of Companies</strong>—a conglomerate spanning <strong>real estate, construction, manufacturing, and trade</strong>.
              </p>
              <p>
                At just 39, his bold vision has transformed the Nakivubo grounds from a historic stadium into a <strong>symbol of national transformation and urban renewal</strong>. His approach blends <strong>strategic investment</strong> with <strong>patriotic purpose</strong>: to demonstrate that Ugandans can create, fund, and manage world-class projects on their own soil.
              </p>
              <p>
                Under his leadership, the stadium was <strong>fully financed and delivered by the private sector</strong>, yet remains a <strong>national asset</strong> operated under government oversight. This model has become a reference point for sustainable development partnerships across East Africa.
              </p>
              <div className="bg-gray-100 border-l-4 border-black p-6 my-6 rounded-r-lg">
                <p className="italic text-gray-800 text-lg mb-3">
                  "This is not just a stadium; it's a statement of what Ugandans can build when vision meets commitment."
                </p>
                <p className="text-sm text-gray-600">
                  — <strong>Dr. Hamis Kiggundu</strong>, Developer & CEO, Ham Enterprises (U) Ltd
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

