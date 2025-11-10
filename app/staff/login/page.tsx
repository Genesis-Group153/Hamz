'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStaffLogin } from '@/lib/hooks/useStaff';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowLeft,
  UserCheck,
  Shield,
  Clock,
  Eye,
  EyeOff,
  Scan,
  QrCode,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function StaffLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const staffLoginMutation = useStaffLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await staffLoginMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-purple-50 opacity-50"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Staff Portal</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Ticket scanning and event management
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-600/5"></div>
       
          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-blue-100 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="staff@example.com"
                    className="pl-16 h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-purple-100 rounded-lg">
                    <Lock className="h-4 w-4 text-purple-600 shrink-0" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-16 pr-12 h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link 
                  href="/contact" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Need help?
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]" 
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-5 w-5 mr-2" />
                    Sign In to Portal
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Portal Features</span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 border-2 border-blue-100 rounded-xl text-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QrCode className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">QR Scanner</p>
                  <p className="text-xs text-blue-700">Fast ticket validation</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 p-3 bg-green-50 border-2 border-green-100 rounded-xl text-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-900">Real-time</p>
                  <p className="text-xs text-green-700">Instant verification</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 border-2 border-purple-100 rounded-xl text-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900">Secure</p>
                  <p className="text-xs text-purple-700">Encrypted access</p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong className="text-gray-900">First time logging in?</strong><br />
                Contact your event manager for credentials
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 Hamz Stadium. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Professional Event Management System
          </p>
        </div>
      </div>
    </div>
  );
}
