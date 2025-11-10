'use client'

import React from 'react'
import Link from 'next/link'
import { ProfessionalHeader } from '@/components/layout/professional-header'
import { ProfessionalFooter } from '@/components/layout/professional-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Award,
  Building2,
  Trophy,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      {/* Hero Section 1 - Welcome to Hamz Stadium */}
      <section className="relative bg-white border-b border-gray-300 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/stadium-1.jpg"
            alt="Hamz Stadium"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
              Welcome to Hamz Stadium
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white font-semibold mb-6 sm:mb-8 drop-shadow-lg">
              Home of Champions
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
              <Button 
                size="lg" 
                asChild 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <Link href="/about" className="flex items-center gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section 2 - World-Class Facilities */}
      <section className="relative bg-gray-50 border-b border-gray-300 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-gray-50 to-primary/5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black mb-4 sm:mb-6 leading-tight">
              World-Class Facilities
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 font-semibold mb-6 sm:mb-8">
              Experience Excellence
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
              <Button 
                size="lg" 
                asChild 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <Link href="/facilities" className="flex items-center gap-2">
                  View Facilities
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section 3 - Host Your Events */}
      <section className="relative bg-white border-b border-gray-300 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black mb-4 sm:mb-6 leading-tight">
              Host Your Events
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 font-semibold mb-6 sm:mb-8">
              Create Unforgettable Moments
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
              <Button 
                size="lg" 
                asChild 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <Link href="/events" className="flex items-center gap-2">
                  View Events
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Matches Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 space-y-4">
            <Badge className="mb-2 sm:mb-4 bg-primary text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              LIVE NOW
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
              Live Matches
            </h2>
          </div>
          <Card className="border-gray-300 max-w-2xl mx-auto shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-lg sm:text-xl text-gray-600">No Live Matches</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Check back later for live match updates</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Next Matches Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
              Next Matches
            </h2>
          </div>
          <Card className="border-gray-300 max-w-2xl mx-auto shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-lg sm:text-xl text-gray-600">No upcoming matches scheduled</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Hamz Stadium Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
              About Hamz Stadium
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes Hamz Stadium a world-class venue
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Modern Multi-Purpose Venue */}
            <Card className="border-gray-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-black leading-tight">Modern Multi-Purpose Venue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Experience world-class events at our state-of-the-art facility. Hamz Stadium has been meticulously renovated to meet international standards, setting a new benchmark for sports venues in Uganda.
                </p>
              </CardContent>
            </Card>

            {/* Upcoming Major Events */}
            <Card className="border-gray-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-black leading-tight">Upcoming Major Events</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Get ready for <strong className="text-black">AFCON 2027</strong> and <strong className="text-black">CHAN 2024</strong>! Hamz Stadium is set to host these prestigious international tournaments, marking a new chapter in Uganda's sporting legacy.
                </p>
              </CardContent>
            </Card>

            {/* Rich History */}
            <Card className="border-gray-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-black leading-tight">Rich History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  From its roots as the home of <strong className="text-black">SC Villa</strong> to now hosting <strong className="text-black">URA FC</strong> and <strong className="text-black">Express FC</strong>, Hamz Stadium continues to be the beating heart of Ugandan football, blending its storied past with an exciting future.
                </p>
              </CardContent>
            </Card>

            {/* Expanded Capacity */}
            <Card className="border-gray-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-black leading-tight">Expanded Capacity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  With an impressive capacity increase from <strong className="text-black">21,000 to 35,000 seats</strong>, Hamz Stadium now offers an unparalleled atmosphere for fans. Officially opened on <strong className="text-black">April 25, 2024</strong>, it stands ready to create unforgettable memories.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10 sm:mt-12 md:mt-16">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Button 
                size="lg" 
                asChild 
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all"
              >
                <Link href="/events" className="flex items-center gap-2">
                  View Events
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              </Button>
              <Button 
                size="lg" 
                asChild 
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all"
              >
                <Link href="/teams" className="flex items-center gap-2">
                  Explore Teams
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Updates Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
              Latest News & Updates
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest happenings at Hamz Stadium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* News Article 1 */}
            <Card className="border-gray-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-black leading-tight">
                  Lukwago left politically bruised as KCCA back Ham, Rusa over Nakivubo works
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Apr 6, 2025</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-4">
                  Kampala, Uganda:- Kampala Lord Mayor Erias Lukwago on Thursday left the Capital City Authority chambers red-faced after the council resolved to endorse and back able local private investors to take on the redevelopment of the city's dilapidated drainage systems...
                </p>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                  <Link href="/posts">Read More →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* News Article 2 */}
            <Card className="border-gray-300 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-black leading-tight">
                  Namibia's President Engages Dr Hamis Kiggundu on Stadium Projects
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Mar 26, 2025</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-4">
                  Windhoek, Namibia – Barely a day after her historic swearing-in as Namibia's first female president, Netumbo Nandi-Ndaitwah held one of her first official business meetings with Ugandan businessman Hamis Kiggundu and Honorary Consul of Namibia to Uganda, Godfrey Kirumira...
                </p>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                  <Link href="/posts">Read More →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10 sm:mt-12 md:mt-16">
            <Button 
              size="lg" 
              asChild 
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all"
            >
              <Link href="/posts" className="flex items-center gap-2">
                View All Posts
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stadium Gallery Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
              Stadium Gallery
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Capturing memorable moments at Hamz Stadium
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Link key={item} href="/gallery" className="group">
                <Card className="border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer aspect-square overflow-hidden h-full">
                  <CardContent className="p-0 h-full">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                      <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                      <span className="sr-only">Gallery Image {item}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12 md:mt-16">
            <Button 
              size="lg" 
              asChild 
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all"
            >
              <Link href="/gallery" className="flex items-center gap-2">
                View Full Gallery
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <ProfessionalFooter />
    </div>
  )
}

export default HomePage
