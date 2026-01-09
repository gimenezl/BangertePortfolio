'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { RotateCcw } from 'lucide-react';
import type { HeroImage } from '@/lib/types';

interface FloatingImagesProps {
    images: HeroImage[];
}

interface ImageState {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    rotation: number;
    aspectRatio: number;
    loaded: boolean;
}

// Mobile Grid Component - Clean static layout for touch devices
function MobileLayout({ images }: { images: HeroImage[] }) {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsAnimated(true), 100);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="px-6 pt-20 pb-8">
                <div
                    className={`transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                >
                    <h1 className="text-2xl font-light leading-relaxed mb-2">
                        Ivana Bangerte /
                    </h1>
                    <p className="text-lg text-white/70 font-light">
                        Advertising & Creative Professional.
                    </p>
                    <p className="text-lg text-white/50 font-light italic">
                        Visually driven, culturally aware — a little surreal.
                    </p>
                </div>
            </div>

            {/* Image Grid */}
            <div className="px-4 pb-8">
                <div className="grid grid-cols-2 gap-3">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative overflow-hidden rounded-lg transition-all duration-700 ease-out ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                } ${index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}
                            style={{
                                transitionDelay: `${index * 100}ms`,
                            }}
                        >
                            <Image
                                src={image.image_url}
                                alt={image.alt_text || 'Portfolio image'}
                                fill
                                className="object-cover"
                                sizes="50vw"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll hint */}
            <div className="flex justify-center pb-8">
                <div className="flex flex-col items-center text-white/30">
                    <span className="text-xs uppercase tracking-widest mb-2">Scroll to explore</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
                </div>
            </div>
        </div>
    );
}

// Desktop Floating Images Component
export default function FloatingImages({ images }: FloatingImagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageStates, setImageStates] = useState<ImageState[]>([]);
    const [maxZIndex, setMaxZIndex] = useState(10);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Drag state - using refs to avoid re-renders during drag
    const isDragging = useRef(false);
    const dragMode = useRef<'move' | 'rotate' | 'resize' | null>(null);
    const activeId = useRef<string | null>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startState = useRef<ImageState | null>(null);
    const startAngle = useRef(0);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize image positions
    useEffect(() => {
        if (images.length === 0 || isInitialized || isMobile) return;

        const container = containerRef.current;
        if (!container) return;

        const loadImages = async () => {
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const clusterCenterX = containerWidth * 0.5;
            const clusterCenterY = containerHeight * 0.55;
            const clusterWidth = Math.min(containerWidth * 0.8, 900);

            const loadedStates: ImageState[] = await Promise.all(
                images.map((img, index) => {
                    return new Promise<ImageState>((resolve) => {
                        const image = new window.Image();
                        image.onload = () => {
                            const naturalAspect = image.naturalHeight / image.naturalWidth;
                            const baseWidth = 200 + Math.random() * 100;
                            const height = baseWidth * naturalAspect;

                            const angle = (index / images.length) * Math.PI * 2 + Math.random() * 0.5;
                            const radius = Math.random() * clusterWidth * 0.35;
                            const x = clusterCenterX + Math.cos(angle) * radius - baseWidth / 2;
                            const y = clusterCenterY + Math.sin(angle) * radius * 0.5 - height / 2;

                            resolve({
                                id: img.id,
                                x: Math.max(20, Math.min(x, containerWidth - baseWidth - 20)),
                                y: Math.max(120, Math.min(y, containerHeight - height - 60)),
                                width: baseWidth,
                                height,
                                zIndex: index + 1,
                                rotation: (Math.random() - 0.5) * 8,
                                aspectRatio: naturalAspect,
                                loaded: true,
                            });
                        };
                        image.onerror = () => {
                            resolve({
                                id: img.id,
                                x: clusterCenterX - 110,
                                y: clusterCenterY - 82,
                                width: 220,
                                height: 165,
                                zIndex: index + 1,
                                rotation: 0,
                                aspectRatio: 0.75,
                                loaded: true,
                            });
                        };
                        image.src = img.image_url;
                    });
                })
            );

            setImageStates(loadedStates);
            setMaxZIndex(images.length + 1);
            setIsInitialized(true);
            setTimeout(() => setIsAnimated(true), 100);
        };

        loadImages();
    }, [images, isInitialized, isMobile]);

    const bringToFront = useCallback((id: string) => {
        const newZ = maxZIndex + 1;
        setMaxZIndex(newZ);
        setImageStates((prev) =>
            prev.map((state) => state.id === id ? { ...state, zIndex: newZ } : state)
        );
    }, [maxZIndex]);

    // Start drag
    const handleMouseDown = (e: React.MouseEvent, id: string, mode: 'move' | 'rotate' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();

        const state = imageStates.find((s) => s.id === id);
        if (!state) return;

        isDragging.current = true;
        dragMode.current = mode;
        activeId.current = id;
        startPos.current = { x: e.clientX, y: e.clientY };
        startState.current = { ...state };

        // For rotation, calculate initial angle
        if (mode === 'rotate') {
            const centerX = state.x + state.width / 2;
            const centerY = state.y + state.height / 2;
            startAngle.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        }

        bringToFront(id);

        // Add global listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Handle drag
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !startState.current || !activeId.current) return;

        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;
        const state = startState.current;

        setImageStates((prev) =>
            prev.map((s) => {
                if (s.id !== activeId.current) return s;

                if (dragMode.current === 'move') {
                    return { ...s, x: state.x + deltaX, y: state.y + deltaY };
                }

                if (dragMode.current === 'rotate') {
                    const centerX = state.x + state.width / 2;
                    const centerY = state.y + state.height / 2;
                    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                    const angleDelta = (currentAngle - startAngle.current) * (180 / Math.PI);
                    return { ...s, rotation: state.rotation + angleDelta };
                }

                if (dragMode.current === 'resize') {
                    // Simple resize: just use horizontal delta
                    const newWidth = Math.max(80, state.width + deltaX);
                    const newHeight = newWidth * state.aspectRatio;
                    return { ...s, width: newWidth, height: newHeight };
                }

                return s;
            })
        );
    }, []);

    // End drag
    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        dragMode.current = null;
        activeId.current = null;
        startState.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Show mobile layout on small screens
    if (isMobile) {
        return <MobileLayout images={images} />;
    }

    if (images.length === 0) {
        return (
            <div className="relative w-full min-h-screen bg-black flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-screen bg-black overflow-hidden select-none"
        >
            {/* Tagline */}
            <div
                className={`absolute top-12 left-12 z-50 text-white max-w-xl transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}
            >
                <h1 className="text-2xl font-normal leading-relaxed">
                    <span className="block">Ivana Bangerte /</span>
                    <span className="block">Advertising & Creative Professional.</span>
                    <span className="block">
                        Visually driven, culturally aware — a little <em>surreal.</em>
                    </span>
                </h1>
            </div>

            {/* Floating Images */}
            {imageStates.map((state) => {
                const image = images.find((img) => img.id === state.id);
                if (!image || !state.loaded) return null;

                return (
                    <div
                        key={state.id}
                        className={`absolute group transition-opacity duration-700 ${isAnimated ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            left: state.x,
                            top: state.y,
                            width: state.width,
                            height: state.height,
                            zIndex: state.zIndex,
                            transform: `rotate(${state.rotation}deg)`,
                        }}
                    >
                        {/* Main image - drag to move */}
                        <div
                            className="relative w-full h-full cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => handleMouseDown(e, state.id, 'move')}
                        >
                            <div className="relative w-full h-full overflow-hidden shadow-xl rounded-sm hover:shadow-2xl transition-shadow">
                                <Image
                                    src={image.image_url}
                                    alt={image.alt_text || 'Portfolio image'}
                                    fill
                                    className="object-cover pointer-events-none"
                                    sizes="600px"
                                    draggable={false}
                                />
                            </div>
                        </div>

                        {/* Rotate handle - top left */}
                        <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-gray-100 hover:scale-110"
                            onMouseDown={(e) => handleMouseDown(e, state.id, 'rotate')}
                            title="Drag to rotate"
                        >
                            <RotateCcw size={16} className="text-gray-700" />
                        </div>

                        {/* Resize handle - bottom right corner */}
                        <div
                            className="absolute -bottom-2 -right-2 w-5 h-5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-se-resize hover:bg-blue-400 hover:scale-110"
                            onMouseDown={(e) => handleMouseDown(e, state.id, 'resize')}
                            title="Drag to resize"
                        />
                    </div>
                );
            })}
        </div>
    );
}
