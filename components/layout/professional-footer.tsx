'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Calendar, Users, Info, Settings, MapPin } from 'lucide-react';

export const ProfessionalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10">
            {/* Contact Us */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-black">Contact Us</h3>
              <div className="space-y-3 text-sm sm:text-base text-gray-600">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="leading-relaxed">Nakivubo Stadium</p>
                    <p className="leading-relaxed">Kampala, Uganda</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <a href="tel:+256704141076" className="hover:text-primary transition-colors">
                    +256 704 141076
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <a href="mailto:info@hamzstadium.com" className="hover:text-primary transition-colors break-all">
                    info@hamzstadium.com
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-black">Quick Links</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/events" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors flex items-center gap-2 group">
                    <Calendar className="h-4 w-4 group-hover:text-primary transition-colors" />
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors flex items-center gap-2 group">
                    <Users className="h-4 w-4 group-hover:text-primary transition-colors" />
                    Teams
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors flex items-center gap-2 group">
                    <Info className="h-4 w-4 group-hover:text-primary transition-colors" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="text-sm sm:text-base text-gray-600 hover:text-primary transition-colors flex items-center gap-2 group">
                    <Settings className="h-4 w-4 group-hover:text-primary transition-colors" />
                    Facilities
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                © {currentYear} Hamz Stadium. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
