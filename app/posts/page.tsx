'use client';

import React from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PostsPage() {
  const posts = [
    {
      title: "Lukwago left politically bruised as KCCA back Ham, Rusa over Nakivubo works",
      date: "Apr 6, 2025",
      excerpt: "Kampala, Uganda:- Kampala Lord Mayor Erias Lukwago on Thursday left the Capital City Authority chambers red-faced after the council resolved to endorse and back able local private investors to take on the redevelopment of the city's dilapidated drainage systems. The council's resolution came amid a contentious attempt by Lukwago to implicate city businessman Dr. Hajji Hamis Kiggundu, commonly known as Ham, and former Acting Executive Director Frank Nyakana Rusa in what he described as illegal drainage works at the Jugula channel near Nakivubo."
    },
    {
      title: "Namibia's President Engages Dr Hamis Kiggundu on Stadium Projects",
      date: "Mar 26, 2025",
      excerpt: "Windhoek, Namibia – Barely a day after her historic swearing-in as Namibia's first female president, Netumbo Nandi-Ndaitwah held one of her first official business meetings with Ugandan businessman Hamis Kiggundu and Honorary Consul of Namibia to Uganda, Godfrey Kirumira. The meeting, which took place in Windhoek, reaffirmed Uganda's proactive approach to engaging Namibia's new leadership in economic and sports infrastructural development."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10" />
            Posts
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Latest news and updates from Hamz Stadium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {posts.map((post, index) => (
            <Card key={index} className="border-gray-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-black">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">{post.date}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <Link href={`/posts/${index + 1}`}>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ProfessionalFooter />
    </div>
  );
}

