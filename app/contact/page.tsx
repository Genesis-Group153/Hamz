'use client';

import React, { useState } from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Headphones,
  FileText,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      contact: 'privacy@genesistickets.net',
      action: 'mailto:privacy@genesistickets.net'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our support team during business hours',
      contact: '+256 749 277 259',
      action: 'tel:+256749277259'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our headquarters in Kampala, Uganda',
      contact: 'Muyenga-Bukasa, Kampala, Uganda',
      action: 'https://maps.google.com'
    }
  ];

  const supportOptions = [
    {
      icon: HelpCircle,
      title: 'General Support',
      description: 'Get help with booking, account issues, or general questions',
      responseTime: 'Within 24 hours'
    },
    {
      icon: MessageCircle,
      title: 'Event Organizer Support',
      description: 'Dedicated support for event creators and venue managers',
      responseTime: 'Within 12 hours'
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      description: 'Technical issues, API support, and integration help',
      responseTime: 'Within 6 hours'
    },
    {
      icon: FileText,
      title: 'Business Inquiries',
      description: 'Partnership opportunities and business development',
      responseTime: 'Within 48 hours'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(false);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          inquiryType: formData.inquiryType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Success
      toast.success('Message sent successfully!', {
        description: 'We\'ll get back to you soon.',
        icon: <CheckCircle className="h-4 w-4" />,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: ''
      });
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Get in Touch
              <span className="text-primary block">We're Here to Help</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform, need help with your event, or want to partner with us? 
              We'd love to hear from you. Our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <Card key={info.title} className="border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">{info.title}</h3>
                      <p className="text-muted-foreground mb-4">{info.description}</p>
                      <a 
                        href={info.action}
                        className="text-primary font-medium hover:text-primary/80 transition-colors"
                      >
                        {info.contact}
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Support Options */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div>
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                      <Send className="h-6 w-6 text-primary" />
                      Send us a Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-card-foreground mb-2 block">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Your full name"
                            required
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-card-foreground mb-2 block">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-card-foreground mb-2 block">
                          Inquiry Type *
                        </label>
                        <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Support</SelectItem>
                            <SelectItem value="organizer">Event Organizer Support</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="business">Business Inquiries</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-card-foreground mb-2 block">
                          Subject *
                        </label>
                        <Input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Brief description of your inquiry"
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-card-foreground mb-2 block">
                          Message *
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Please provide as much detail as possible..."
                          required
                          rows={5}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                      
                      {submitted && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            <p className="font-medium">Message sent successfully!</p>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            We'll respond to your inquiry as soon as possible.
                          </p>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Support Options */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">How We Can Help</h2>
                <div className="space-y-4">
                  {supportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Card key={option.title} className="border-border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-card-foreground mb-1">{option.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                              <p className="text-xs text-primary font-medium">Response time: {option.responseTime}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Business Hours */}
                <Card className="border-border shadow-sm mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold text-card-foreground">Business Hours</h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM EAT</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>10:00 AM - 4:00 PM EAT</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Emergency support is available 24/7 for critical issues.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Quick answers to common questions about our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">How do I book tickets?</h3>
                  <p className="text-sm text-muted-foreground">
                    Simply browse our events, select your preferred tickets, and complete the booking form. No account required!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">Is my payment secure?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, all payments are processed through secure, encrypted channels to protect your information.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">Can I get a refund?</h3>
                  <p className="text-sm text-muted-foreground">
                    Refund policies vary by event. Check the specific event's refund policy before booking.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">How do I organize an event?</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact our event organizer support team to learn about our platform and get started.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <ProfessionalFooter />
    </div>
  );
}
