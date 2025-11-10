'use client';

import React, { useState } from 'react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function GalleryPage() {
  const galleryImages = [
    { src: '/gallery/67e3e75233991.jpg', alt: 'Stadium view 1' },
    { src: '/gallery/67e3e75234d45.jpg', alt: 'Stadium view 2' },
    { src: '/gallery/67e423f680e2e.jpg', alt: 'Stadium view 3' },
    { src: '/gallery/67f97bf3a408f.jpeg', alt: 'Stadium view 4' },
    { src: '/gallery/stadium-1.jpg', alt: 'Stadium view 5' },
    { src: '/gallery/stadium-2.jpg', alt: 'Stadium view 6' },
    { src: '/gallery/stadium-3.jpg', alt: 'Stadium view 7' },
    { src: '/gallery/stadium-4.jpg', alt: 'Stadium view 8' },
  ];

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
    } else {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black flex items-center justify-center gap-3">
            <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <span>Stadium Gallery</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Capturing memorable moments at Hamz Stadium
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto">
          {galleryImages.map((image, index) => (
            <Card 
              key={index} 
              className="border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer aspect-square overflow-hidden group"
              onClick={() => openLightbox(index)}
            >
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[selectedImage].src}
              alt={galleryImages[selectedImage].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm sm:text-base">
            {selectedImage + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <ProfessionalFooter />
    </div>
  );
}
