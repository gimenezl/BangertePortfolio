'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function AboutPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate rotation based on mouse position relative to center
                const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 25;
                const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 25;

                setMousePosition({ x: rotateX, y: rotateY });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white">
            <div className="container-custom py-20 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
                    {/* Left side - Text content */}
                    <div className="animate-fade-in">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-8">
                            <span className="text-white/90 block mb-2">Ivana Bangerte /</span>
                            <span className="text-white/80">Born in Argentina. I'm drawn to images, ideas and stories in all their forms.</span>
                        </h1>

                        <p className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-white/60 mb-8 animate-slide-up-delay">
                            Photography, drawing, film, and music constantly inform how I think and create.
                            I enjoy moving beyond the obvious, adapting easily to different projects,
                            rhythms, and schedules — day, night, or somewhere in between.
                        </p>

                        <div className="space-y-4 animate-slide-up-delay-2">
                            <p className="text-lg md:text-xl font-light text-white/50">
                                Chances are every project comes with its own playlist.
                            </p>
                            <p className="text-lg md:text-xl font-light text-white/50 italic">
                                Mood matters. So does intention.
                            </p>
                            <p className="text-lg md:text-xl font-light text-white/50 mt-6">
                                Curious, playful, and always exploring new ways to make brands feel more human.
                            </p>
                        </div>
                    </div>

                    {/* Right side - Circular photo with mouse tracking effect */}
                    <div className="flex justify-center lg:justify-end animate-slide-up-delay">
                        <div
                            className="relative"
                            style={{
                                perspective: '1000px',
                            }}
                        >
                            {/* Glow effect behind image */}
                            <div
                                className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-transform duration-300 ease-out"
                                style={{
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                                    transform: `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)`,
                                }}
                            />

                            {/* Image container with rotation effect */}
                            <div
                                className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden transition-transform duration-300 ease-out"
                                style={{
                                    transform: `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)`,
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                {/* Cyan/teal border ring */}
                                <div className="absolute inset-0 rounded-full border-4 border-cyan-400/50 z-10" />

                                {/* Inner glow ring */}
                                <div
                                    className="absolute inset-2 rounded-full z-10"
                                    style={{
                                        boxShadow: 'inset 0 0 30px rgba(6, 182, 212, 0.3)',
                                    }}
                                />

                                {/* Photo */}
                                <div className="absolute inset-4 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                                    <Image
                                        src="/about-photo.jpg"
                                        alt="Ivana Bangerte"
                                        fill
                                        className="object-cover"
                                        sizes="400px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
