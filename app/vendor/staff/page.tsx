'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Users, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  QrCode,
  Loader2,
  Plus
} from 'lucide-react';
import { 
  useVendorStaff, 
  useCreateStaff, 
  useUpdateStaff, 
  useDeleteStaff, 
  useStaffStats,
  useAssignStaffToEvent,
  useUnassignStaffFromEvent,
  useStaffAssignedEvents
} from '@/lib/hooks/useStaff';
import { useVendorEvents } from '@/lib/hooks/useEvents';

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffForAssignment, setStaffForAssignment] = useState<any>(null);

  // API hooks
  const { data: staff = [], isLoading: staffLoading, error: staffError } = useVendorStaff();
  const { data: stats } = useStaffStats();
  const { data: events = [] } = useVendorEvents();
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();
  const assignStaffMutation = useAssignStaffToEvent();
  const unassignStaffMutation = useUnassignStaffFromEvent();

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStaff = async (staffData: any) => {
    try {
      await createStaffMutation.mutateAsync(staffData);
      setIsAddStaffOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditStaff = async (staffData: any) => {
    if (!selectedStaff) return;
    
    try {
      await updateStaffMutation.mutateAsync({
        staffId: selectedStaff.id,
        data: staffData
      });
      setIsEditing(false);
      setSelectedStaff(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaffMutation.mutateAsync(staffId);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      await updateStaffMutation.mutateAsync({
        staffId,
        data: { isActive: !currentStatus }
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <AddStaffForm onSubmit={handleAddStaff} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeStaff || 0} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Staff
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.activeStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready to scan tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Scans
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.recentScans || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.inactiveStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              Temporarily disabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Filter by Role
            </Button>
          </div>

          {/* Staff Table */}
          {staffLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : staffError ? (
            <Alert>
              <AlertDescription>
                Failed to load staff members. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No staff members found matching your search' : 'No staff members yet'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddStaffOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{member.email}</div>
                        {member.phone && (
                          <div className="text-sm text-gray-500">{member.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.position}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStaffForAssignment(member);
                              setIsAssignModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStaff(member);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(member.id, member.isActive)}
                          >
                            {member.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStaff(member.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <EditStaffForm 
              staff={selectedStaff} 
              onSubmit={handleEditStaff}
              onCancel={() => {
                setIsEditing(false);
                setSelectedStaff(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign to Event Dialog */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign {staffForAssignment?.name} to Events</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select events to assign this staff member to
            </p>
          </DialogHeader>
          {staffForAssignment && (
            <AssignEventsForm 
              staff={staffForAssignment}
              events={events}
              onClose={() => {
                setIsAssignModalOpen(false);
                setStaffForAssignment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add Staff Form Component
function AddStaffForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    permissions: ['SCAN_TICKETS']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      permissions: ['SCAN_TICKETS']
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Full Name
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Email Address
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Phone Number
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Position
        </label>
        <Input
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="e.g., Security Manager, Ticketing Coordinator"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>
    </form>
  );
}

// Edit Staff Form Component
function EditStaffForm({ 
  staff, 
  onSubmit, 
  onCancel 
}: { 
  staff: any; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    position: staff.position,
    permissions: staff.permissions,
    isActive: staff.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: staff.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Full Name
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Email Address
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Phone Number
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Position
        </label>
        <Input
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="e.g., Security Manager, Ticketing Coordinator"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-border"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-foreground">
          Active Staff Member
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          Update Staff Member
        </Button>
      </div>
    </form>
  );
}

// Assign Events Form Component
function AssignEventsForm({ 
  staff, 
  events, 
  onClose 
}: { 
  staff: any; 
  events: any[]; 
  onClose: () => void;
}) {
  const { data: assignedEvents = [], isLoading: loadingAssignments } = useStaffAssignedEvents(staff.id);
  const assignMutation = useAssignStaffToEvent();
  const unassignMutation = useUnassignStaffFromEvent();

  const isEventAssigned = (eventId: string) => {
    return assignedEvents.some(e => e.id === eventId);
  };

  const handleToggleAssignment = async (eventId: string) => {
    const isAssigned = isEventAssigned(eventId);
    
    if (isAssigned) {
      await unassignMutation.mutateAsync({ staffId: staff.id, eventId });
    } else {
      await assignMutation.mutateAsync({ staffId: staff.id, eventId });
    }
  };

  if (loadingAssignments) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-900">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">
            {assignedEvents.length} {assignedEvents.length === 1 ? 'event' : 'events'} assigned
          </span>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No events available</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event) => {
            const isAssigned = isEventAssigned(event.id);
            return (
              <div
                key={event.id}
                className={`border rounded-lg p-4 transition-all ${
                  isAssigned 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBA'}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.venue || 'Venue TBA'}
                      </div>
                      <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isAssigned ? 'destructive' : 'default'}
                    onClick={() => handleToggleAssignment(event.id)}
                    disabled={assignMutation.isPending || unassignMutation.isPending}
                  >
                    {isAssigned ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Unassign
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
