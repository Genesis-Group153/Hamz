'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <History className="h-10 w-10" />
            History & Legacy
          </h1>
        </div>

        <Card className="border-gray-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                The origins of Nakivubo date back to <strong>1926</strong>, when the Kabaka of Buganda donated the land for communal recreation. In <strong>1954</strong>, the site was upgraded and renamed the <strong>Nakivubo War Memorial Stadium</strong> in honour of Ugandan soldiers who lost their lives during World War II.
              </p>
              <p>
                For decades, Nakivubo served as the cradle of Ugandan football—home to legendary clubs like <strong>SC Villa, Express FC, and KCCA FC</strong>, and host to national and regional tournaments. Over time, however, the structure aged and could no longer meet modern standards, prompting an ambitious redevelopment plan in partnership with the private sector.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

