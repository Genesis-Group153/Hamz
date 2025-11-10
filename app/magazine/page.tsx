'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function MagazinePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Download className="h-10 w-10" />
            Download Magazine
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download the latest Hamz Stadium magazine
          </p>
        </div>

        <Card className="border-gray-300 max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-xl text-gray-600 mb-6">Magazine coming soon</p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg rounded-full"
              disabled
            >
              <Download className="mr-2 h-5 w-5" />
              Download Magazine
            </Button>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

