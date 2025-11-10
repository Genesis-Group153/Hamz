'use client';

import React from 'react';
import { TicketList } from '@/components/vendor/ticket-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from 'lucide-react';

export default function TicketsListPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="py-6">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Ticket Query & Management</h1>
                <p className="text-sm font-normal text-gray-600 mt-1">
                  Query and filter individual tickets across all your events. Use the filters below to find specific tickets by type, status, booking, dates, and more.
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Ticket List Component */}
        <TicketList />
      </div>
    </div>
  );
}

