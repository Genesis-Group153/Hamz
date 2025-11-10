'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';

export default function TeamsPage() {
  const teams = [
    { name: 'SC Villa', description: 'One of Uganda\'s most successful football clubs' },
    { name: 'URA FC', description: 'Uganda Revenue Authority Football Club' },
    { name: 'Express FC', description: 'One of the oldest and most respected clubs in Uganda' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <Users className="h-10 w-10" />
            Teams
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Teams that call Hamz Stadium home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {teams.map((team, index) => (
            <Card key={index} className="border-gray-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-black">{team.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {team.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

