'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVendorProfile, useUpdateVendorProfile } from '@/lib/hooks/useVendorProfile';
import { Loader2, User, Building2, Mail, Phone, MapPin, CreditCard, FileText, Save, AlertCircle, Edit, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorSettingsPage() {
  const { data: profile, isLoading, error } = useVendorProfile();
  const updateProfile = useUpdateVendorProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    businessAddress: '',
    taxId: '',
    bankDetails: '',
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        companyName: profile.companyName || '',
        phone: profile.phone || '',
        businessAddress: profile.businessAddress || '',
        taxId: profile.taxId || '',
        bankDetails: profile.bankDetails || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        companyName: profile.companyName || '',
        phone: profile.phone || '',
        businessAddress: profile.businessAddress || '',
        taxId: profile.taxId || '',
        bankDetails: profile.bankDetails || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-semibold mb-2">Error loading profile</p>
              <p className="text-red-500 text-sm">
                {(error as any)?.response?.data?.message || (error as any)?.message || 'Please try again'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your vendor profile and business information</p>
        </div>

        {/* Account Status Card */}
        {profile && (
          <Card className="mb-6 border-0 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-600/10"></div>
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${profile.isApproved ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {profile.isApproved ? (
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Account Status</p>
                    <div className="flex items-center gap-2">
                      {profile.isApproved ? (
                        <>
                          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-sm sm:text-base text-green-700 font-semibold">Approved & Active</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                          <span className="text-sm sm:text-base text-orange-700 font-semibold">Pending Approval</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {profile.platformCommission !== undefined && (
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1 font-medium">Platform Commission</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">{profile.platformCommission}%</p>
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                </div>
                <span>Profile Information</span>
              </CardTitle>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfile.isPending}
                    className="flex-1 sm:flex-none text-xs sm:text-sm active:scale-95 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={updateProfile.isPending}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 shrink-0" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Personal Information */}
              <div className="p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-200 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700 shrink-0" />
                  </div>
                  <span>Personal Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="p-4 sm:p-5 bg-green-50 rounded-xl border border-green-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-green-200 rounded-lg">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 shrink-0" />
                  </div>
                  <span>Business Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={2}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="p-4 sm:p-5 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-200 rounded-lg">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700 shrink-0" />
                  </div>
                  <span>Financial Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID / Business Registration
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account Details
                    </label>
                    <Input
                      name="bankDetails"
                      value={formData.bankDetails}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white"
                      placeholder="Account number or details"
                    />
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg shrink-0">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-blue-900 font-semibold mb-1">Important Information</p>
                    <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                      Changes to your email address will require re-verification. Contact support if you need to modify your platform commission rate.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Details */}
        {profile && (
          <Card className="mt-6 border-0 shadow-md">
            <CardHeader className="border-b bg-white p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 shrink-0" />
                </div>
                <span>Account Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1 font-medium">Account ID</p>
                  <p className="font-mono text-xs sm:text-sm text-gray-900 break-all">{profile.id}</p>
                </div>
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1 font-medium">Member Since</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold">{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1 font-medium">Last Updated</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold">{new Date(profile.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




