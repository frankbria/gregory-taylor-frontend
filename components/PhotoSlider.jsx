'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useAPI from '@/lib/api';

export default function PhotoSlider() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getFeaturedPhotos } = useAPI();

  useEffect(() => {
    const fetchFeaturedPhotos = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const featuredPhotos = await getFeaturedPhotos();
        setPhotos(featuredPhotos);
      } catch (error) {
        console.error('Error fetching featured photos:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove getFeaturedPhotos from dependency array to prevent infinite loop

  useEffect(() => {
    // Auto rotate photos every 5 seconds if there are photos
    if (photos.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [photos.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] md:h-[70vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[50vh] md:h-[70vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-xl text-red-600">Unable to load featured photos</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return null; // Don't render anything if no featured photos
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Main image */}
      {photos.map((photo, index) => (
        <div
          key={photo._id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={photo.imageUrl}
            alt={photo.title || 'Featured photograph'}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <h2 className="text-xl font-semibold mb-1">{photo.title}</h2>
            {photo.description && (
              <p className="text-sm hidden sm:block">{photo.description}</p>
            )}
          </div>
        </div>
      ))}
      
      {/* Navigation buttons */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
        aria-label="Previous photo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
        aria-label="Next photo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
