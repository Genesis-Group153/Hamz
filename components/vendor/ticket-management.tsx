'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  useEventTickets, 
  useUpdateTicketStatus, 
  useCheckAndUpdateTicketStatus,
  useDeleteTicketCategory
} from '@/lib/hooks/useTickets';
import { TicketResponse } from '@/lib/api/tickets';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Ticket,
  Printer,
  Smartphone,
  Lock,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { CreateTicketForm } from './create-ticket-form';
import { EditTicketForm } from './edit-ticket-form';

interface TicketManagementProps {
  eventId: string;
  eventTitle: string;
}

const statusColors = {
  AVAILABLE: 'bg-green-100 text-green-700 border-green-300',
  SOLD_OUT: 'bg-red-100 text-red-700 border-red-300',
  UNAVAILABLE: 'bg-gray-100 text-gray-700 border-gray-300',
};

const statusIcons = {
  AVAILABLE: CheckCircle,
  SOLD_OUT: XCircle,
  UNAVAILABLE: AlertCircle,
};

export function TicketManagement({ eventId, eventTitle }: TicketManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<TicketResponse | null>(null);
  
  const { data: tickets, isLoading, error, refetch } = useEventTickets(eventId);
  const updateStatusMutation = useUpdateTicketStatus();
  const checkStatusMutation = useCheckAndUpdateTicketStatus();
  const deleteTicketMutation = useDeleteTicketCategory();

  const handleStatusUpdate = async (ticketId: string, newStatus: 'AVAILABLE' | 'SOLD_OUT' | 'UNAVAILABLE') => {
    try {
      await updateStatusMutation.mutateAsync({
        ticketCategoryId: ticketId,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleCheckStatus = async (ticketId: string) => {
    try {
      await checkStatusMutation.mutateAsync(ticketId);
    } catch (error) {
      console.error('Failed to check ticket status:', error);
    }
  };

  const handleEditTicket = (ticket: TicketResponse) => {
    setSelectedTicket(ticket);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setSelectedTicket(null);
    refetch();
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setSelectedTicket(null);
  };

  const handleDeleteClick = (ticket: TicketResponse) => {
    setTicketToDelete(ticket);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;

    try {
      await deleteTicketMutation.mutateAsync(ticketToDelete.id);
      setShowDeleteDialog(false);
      setTicketToDelete(null);
      refetch(); // Refresh the ticket list
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Delete failed:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setTicketToDelete(null);
  };

  // Check if sales have started
  const hasSalesStarted = (ticket: TicketResponse) => {
    if (ticket.status !== 'AVAILABLE') return false;
    if (!ticket.salesStart) return false;
    const salesStartDate = new Date(ticket.salesStart);
    const now = new Date();
    return now >= salesStartDate;
  };

  const getStatusBadge = (status: keyof typeof statusColors) => {
    const Icon = statusIcons[status];
    return (
      <Badge className={`${statusColors[status]} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-white border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white border-gray-200 shadow-sm">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load tickets</p>
          <Button onClick={() => refetch()} variant="outline" className="border-gray-300 text-gray-700">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ticket Categories</h2>
          <p className="text-gray-600 text-sm mt-1">{eventTitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Category
          </Button>
        </div>
      </div>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <CreateTicketForm
          eventId={eventId}
          onSuccess={() => {
            setShowCreateForm(false);
            refetch();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Ticket Form */}
      {showEditForm && selectedTicket && (
        <EditTicketForm
          ticket={selectedTicket}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}

      {/* Tickets List */}
      {!tickets || tickets.length === 0 ? (
        <Card className="p-8 bg-white border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Ticket Categories</h3>
            <p className="text-gray-600 text-sm mb-6">
              Create your first ticket category to start selling tickets for this event.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Ticket Category
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const revenue = (ticket.soldQuantity || 0) * (parseFloat(ticket.price?.toString() || '0'));
            const hardTickets = ticket.calculatedHardTickets || 0;
            const hardTicketPercentage = ticket.hardTicketPercentage 
              ? (typeof ticket.hardTicketPercentage === 'string' 
                  ? parseFloat(ticket.hardTicketPercentage) 
                  : ticket.hardTicketPercentage)
              : 0;
            const softTickets = ticket.quantity - hardTickets;
            return (
            <Card key={ticket.id} className="p-5 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
              
              {/* Row Layout */}
              <div className="flex flex-row items-start gap-6 relative">
                {/* Left Side - Ticket Details */}
                <div className="flex-1 min-w-0">
                  {/* Header with Title and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {ticket.categoryName}
                      </h3>
                      {ticket.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {ticket.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(ticket.status)}
                        <span className="text-gray-600 text-sm font-medium">
                          UGX {parseFloat(ticket.price?.toString() || '0').toLocaleString()} per ticket
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/vendor/tickets-list?eventId=${eventId}&ticketCategoryId=${ticket.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          title="Query tickets for this category"
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Query Tickets
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleEditTicket(ticket)}
                        variant="outline"
                        size="sm"
                        disabled={hasSalesStarted(ticket)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={hasSalesStarted(ticket) ? 'Cannot edit after sales have started' : 'Edit ticket category'}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleCheckStatus(ticket.id)}
                        variant="outline"
                        size="sm"
                        disabled={checkStatusMutation.isPending}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        title="Check and update ticket status"
                      >
                        <RefreshCw className={`h-4 w-4 ${checkStatusMutation.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(ticket)}
                        variant="outline"
                        size="sm"
                        disabled={deleteTicketMutation.isPending || hasSalesStarted(ticket)}
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={hasSalesStarted(ticket) ? 'Cannot delete after sales have started' : 'Delete ticket category'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* UNAVAILABLE Status Message */}
                  {ticket.status === 'UNAVAILABLE' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-yellow-900 font-medium">
                            Ticket category created. Change status to AVAILABLE to start sales.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sales Started Warning */}
                  {hasSalesStarted(ticket) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-900 font-medium">
                            Sales have started. This ticket category cannot be edited. Contact admin for assistance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket Statistics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <Ticket className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-gray-600 block mb-0.5 text-xs">Total</span>
                        <span className="text-gray-900 font-bold text-lg">{ticket.quantity || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <div className="p-2 bg-green-100 rounded-lg shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-gray-600 block mb-0.5 text-xs">Sold</span>
                        <span className="text-green-600 font-bold text-lg">{ticket.soldQuantity || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-gray-600 block mb-0.5 text-xs">Available</span>
                        <span className="text-blue-600 font-bold text-lg">{ticket.availableQuantity || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                        <RefreshCw className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-gray-600 block mb-0.5 text-xs">Revenue</span>
                        <span className="text-yellow-600 font-bold text-lg">
                          UGX {revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hard Tickets vs Soft Tickets */}
                  {hardTickets > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <Printer className="h-4 w-4 text-orange-600" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Ticket Distribution</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-orange-100 rounded-lg shrink-0">
                            <Printer className="h-3.5 w-3.5 text-orange-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-600 block mb-0.5 text-xs">Hard Tickets (Print)</span>
                            <span className="text-orange-700 font-bold text-base">{hardTickets}</span>
                            {hardTicketPercentage > 0 && (
                              <span className="text-orange-600 text-xs">({hardTicketPercentage}%)</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                            <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-600 block mb-0.5 text-xs">Soft Tickets (Digital)</span>
                            <span className="text-blue-700 font-bold text-base">{softTickets}</span>
                            {hardTicketPercentage > 0 && (
                              <span className="text-blue-600 text-xs">({100 - hardTicketPercentage}%)</span>
                            )}
                  </div>
                  </div>
                </div>
                      <p className="text-xs text-orange-700 mt-2 italic">
                        Hard tickets are physical tickets that need to be printed for distribution.
                      </p>
                    </div>
                  )}

                  {/* Status Management and Actions Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-700 text-sm font-medium">Status:</span>
                    {ticket.status !== 'AVAILABLE' && (
                      <Button
                        onClick={() => handleStatusUpdate(ticket.id, 'AVAILABLE')}
                        variant="outline"
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                          className="border-green-300 text-green-700 hover:bg-green-50 text-xs"
                      >
                        Make Available
                      </Button>
                    )}
                    {ticket.status !== 'SOLD_OUT' && (
                      <Button
                        onClick={() => handleStatusUpdate(ticket.id, 'SOLD_OUT')}
                        variant="outline"
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50 text-xs"
                      >
                        Mark Sold Out
                      </Button>
                    )}
                    {ticket.status !== 'UNAVAILABLE' && (
                      <Button
                        onClick={() => handleStatusUpdate(ticket.id, 'UNAVAILABLE')}
                        variant="outline"
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                      >
                        Make Unavailable
                      </Button>
                    )}
                  </div>

                    <div className="text-gray-500 text-xs shrink-0">
                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Sales Period */}
                {(ticket.salesStart || ticket.salesEnd) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-purple-100 rounded-lg">
                          <RefreshCw className="h-3 w-3 text-purple-600" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900">Sales Period</h4>
                      </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {ticket.salesStart && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-xs">Start:</span>
                            <span className="text-gray-900">
                            {new Date(ticket.salesStart).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {ticket.salesEnd && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-xs">End:</span>
                            <span className="text-gray-900">
                            {new Date(ticket.salesEnd).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Ticket Category
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              This action cannot be undone. This will permanently delete the ticket category and all associated tickets.
            </DialogDescription>
          </DialogHeader>
          
          {ticketToDelete && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Category Name:</span>
                    <span className="text-gray-900">{ticketToDelete.categoryName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total Tickets:</span>
                    <span className="text-gray-900">{ticketToDelete.quantity || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Sold Tickets:</span>
                    <span className="text-red-700 font-bold">{ticketToDelete.soldQuantity || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Available Tickets:</span>
                    <span className="text-gray-900">{ticketToDelete.availableQuantity || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-semibold mb-1">⚠️ Warning:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800">
                      <li>All {ticketToDelete.quantity || 0} tickets will be permanently deleted</li>
                      <li>This includes both SOFT (digital) and HARD (physical) tickets</li>
                      <li>Any printed or scanned tickets will also be deleted</li>
                      <li>If confirmed bookings exist, deletion will be blocked</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={handleDeleteCancel}
              className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 hover:bg-gray-50"
              disabled={deleteTicketMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteTicketMutation.isPending}
              className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
            >
              {deleteTicketMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
