'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function AboutPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current && !isMobile) {
                const rect = containerRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 25;
                const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 25;

                setMousePosition({ x: rotateX, y: rotateY });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', checkMobile);
        };
    }, [isMobile]);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white">
            <div className="container-custom py-12 md:py-20 lg:py-32">
                {/* Mobile: Photo first, then text. Desktop: side by side */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">

                    {/* Photo - Shows first on mobile */}
                    <div className="flex justify-center lg:order-2 animate-fade-in">
                        <div
                            className="relative"
                            style={{
                                perspective: '1000px',
                            }}
                        >
                            {/* Glow effect */}
                            <div
                                className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-transform duration-300 ease-out"
                                style={{
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                                    transform: isMobile ? 'none' : `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)`,
                                }}
                            />

                            {/* Image container */}
                            <div
                                className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden transition-transform duration-300 ease-out"
                                style={{
                                    transform: isMobile ? 'none' : `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)`,
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                <div className="absolute inset-0 rounded-full border-2 md:border-4 border-cyan-400/50 z-10" />
                                <div
                                    className="absolute inset-1 md:inset-2 rounded-full z-10"
                                    style={{
                                        boxShadow: 'inset 0 0 20px rgba(6, 182, 212, 0.3)',
                                    }}
                                />
                                <div className="absolute inset-2 md:inset-4 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                                    <Image
                                        src="/about-photo.jpg"
                                        alt="Ivana Bangerte"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 200px, 400px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="lg:order-1 animate-slide-up-delay text-center lg:text-left">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-6 md:mb-8">
                            <span className="text-white/90 block mb-2">Ivana Bangerte /</span>
                            <span className="text-white/80">Born in Argentina. I'm drawn to images, ideas and stories in all their forms.</span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-white/60 mb-6 md:mb-8">
                            Photography, drawing, film, and music constantly inform how I think and create.
                            I enjoy moving beyond the obvious, adapting easily to different projects,
                            rhythms, and schedules — day, night, or somewhere in between.
                        </p>

                        <div className="space-y-3 md:space-y-4">
                            <p className="text-base md:text-lg lg:text-xl font-light text-white/50">
                                Chances are every project comes with its own playlist.
                            </p>
                            <p className="text-base md:text-lg lg:text-xl font-light text-white/50 italic">
                                Mood matters. So does intention.
                            </p>
                            <p className="text-base md:text-lg lg:text-xl font-light text-white/50 mt-4 md:mt-6">
                                Curious, playful, and always exploring new ways to make brands feel more human.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
