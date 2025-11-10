'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLogin } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Shield,
  Users,
  Ticket,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useLogin();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      const credentials = loginMethod === 'email' 
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            phone: formData.phone,
            password: formData.password
          };

      // Login mutation handles success/error toasts and redirects
      await loginMutation.mutateAsync(credentials);
    } catch (error: any) {
      // Error is already handled by useLogin.onError, no need to show another toast
      console.error('Login error:', error);
    }
  };

  const features = [
    {
      icon: Ticket,
      title: 'Manage Events',
      description: 'Create, edit, and manage your events with ease'
    },
    {
      icon: Users,
      title: 'Track Attendees',
      description: 'Monitor ticket sales and attendee information'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data and events are protected with enterprise security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
          </Link>
          
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Features */}
            <div className="hidden lg:block">
              <div className="max-w-md">
                <h1 className="text-4xl font-bold text-foreground mb-6">
                  Welcome Back,
                  <span className="text-primary block">Event Organizer</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Access your vendor dashboard to manage events, track sales, 
                  and connect with your audience.
                </p>

                <div className="space-y-6">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-md border-border shadow-lg ">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-card-foreground">
                    Vendor Login
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Sign in to your vendor account
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Login Method Tabs */}
                  <div className="flex bg-muted rounded-lg p-1">
            <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        loginMethod === 'email'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Email
            </button>
            <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        loginMethod === 'phone'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      Phone
            </button>
        </div>

        {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email or Phone Input */}
                    {loginMethod === 'email' ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email address"
                            className="pl-10"
                            disabled={loginMutation.isPending}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter your phone number"
                            className="pl-10"
                            disabled={loginMutation.isPending}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                      </div>
                    )}

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-card-foreground">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          disabled={loginMutation.isPending}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                        />
                        Remember me
                      </label>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Forgot password?
                      </Link>
          </div>
          
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
            </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have a vendor account?{' '}
                      <Link 
                        href="/auth/register" 
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Create one now
                      </Link>
                    </p>
                  </div>

                  {/* Info Badge */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Secure Login
                        </p>
                        <p className="text-xs text-blue-700">
                          Your account is protected with enterprise-grade security.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}