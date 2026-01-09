'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroImage } from '@/lib/types';

interface HeroCarouselProps {
    images: HeroImage[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume autoplay after 5 seconds of inactivity
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying || images.length <= 1) return;

        const interval = setInterval(goToNext, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, goToNext, images.length]);

    if (images.length === 0) {
        return (
            <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">No hero images available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-gray-100">
            {/* Images */}
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={image.image_url}
                        alt={image.alt_text || 'Hero image'}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                    />
                </div>
            ))}

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => {
                            goToPrev();
                            setIsAutoPlaying(false);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => {
                            goToNext();
                            setIsAutoPlaying(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Dots Navigation */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                                    ? 'bg-white'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
