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
    animationDelay: number;
    aspectRatio: number;
    loaded: boolean;
}

type DragMode = 'move' | 'rotate' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | null;

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

            {/* Image Grid - Masonry style */}
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
    const [activeId, setActiveId] = useState<string | null>(null);
    const [dragMode, setDragMode] = useState<DragMode>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialState, setInitialState] = useState<ImageState | null>(null);
    const [maxZIndex, setMaxZIndex] = useState(10);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load image dimensions (only for desktop)
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
                            const width = baseWidth;
                            const height = baseWidth * naturalAspect;

                            const angle = (index / images.length) * Math.PI * 2 + Math.random() * 0.5;
                            const radius = Math.random() * clusterWidth * 0.35;
                            const x = clusterCenterX + Math.cos(angle) * radius - width / 2;
                            const y = clusterCenterY + Math.sin(angle) * radius * 0.5 - height / 2;

                            const rotation = (Math.random() - 0.5) * 8;

                            resolve({
                                id: img.id,
                                x: Math.max(20, Math.min(x, containerWidth - width - 20)),
                                y: Math.max(120, Math.min(y, containerHeight - height - 60)),
                                width,
                                height,
                                zIndex: index + 1,
                                rotation,
                                animationDelay: index * 0.12,
                                aspectRatio: naturalAspect,
                                loaded: true,
                            });
                        };
                        image.onerror = () => {
                            const baseWidth = 220;
                            const height = baseWidth * 0.75;
                            const angle = (index / images.length) * Math.PI * 2;
                            const radius = clusterWidth * 0.25;

                            resolve({
                                id: img.id,
                                x: clusterCenterX + Math.cos(angle) * radius - baseWidth / 2,
                                y: clusterCenterY + Math.sin(angle) * radius * 0.5 - height / 2,
                                width: baseWidth,
                                height,
                                zIndex: index + 1,
                                rotation: 0,
                                animationDelay: index * 0.12,
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
        setMaxZIndex((prev) => prev + 1);
        setImageStates((prev) =>
            prev.map((state) =>
                state.id === id ? { ...state, zIndex: maxZIndex + 1 } : state
            )
        );
    }, [maxZIndex]);

    const handlePointerDown = (e: React.PointerEvent, id: string, mode: DragMode) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveId(id);
        setDragMode(mode);
        setDragStart({ x: e.clientX, y: e.clientY });
        const state = imageStates.find((s) => s.id === id);
        if (state) {
            setInitialState(state);
            bringToFront(id);
        }
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activeId || !dragMode || !initialState) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setImageStates((prev) =>
            prev.map((state) => {
                if (state.id !== activeId) return state;

                if (dragMode === 'move') {
                    return {
                        ...state,
                        x: initialState.x + deltaX,
                        y: initialState.y + deltaY,
                    };
                }

                if (dragMode === 'rotate') {
                    const centerX = initialState.x + initialState.width / 2;
                    const centerY = initialState.y + initialState.height / 2;
                    const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
                    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                    const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
                    return {
                        ...state,
                        rotation: initialState.rotation + deltaAngle,
                    };
                }

                if (dragMode.startsWith('resize')) {
                    let newWidth = initialState.width;
                    let newX = initialState.x;

                    if (dragMode.includes('r')) {
                        newWidth = Math.max(100, initialState.width + deltaX);
                    } else if (dragMode.includes('l')) {
                        newWidth = Math.max(100, initialState.width - deltaX);
                        newX = initialState.x + (initialState.width - newWidth);
                    }

                    const newHeight = newWidth * initialState.aspectRatio;
                    let newY = initialState.y;

                    if (dragMode.includes('t')) {
                        newY = initialState.y + (initialState.height - newHeight);
                    }

                    return {
                        ...state,
                        width: newWidth,
                        height: newHeight,
                        x: newX,
                        y: newY,
                    };
                }

                return state;
            })
        );
    };

    const handlePointerUp = () => {
        setActiveId(null);
        setDragMode(null);
        setInitialState(null);
    };

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
            className="relative w-full min-h-screen bg-black overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {/* Tagline with animation */}
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

            {/* Floating Images with staggered entrance animation */}
            {imageStates.map((state) => {
                const image = images.find((img) => img.id === state.id);
                if (!image || !state.loaded) return null;

                const isActive = activeId === state.id;

                return (
                    <div
                        key={state.id}
                        className={`absolute group transition-all duration-700 ease-out ${isAnimated
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-90'
                            }`}
                        style={{
                            left: state.x,
                            top: state.y,
                            width: state.width,
                            height: state.height,
                            zIndex: state.zIndex,
                            transform: `rotate(${state.rotation}deg)`,
                            transitionDelay: `${state.animationDelay}s`,
                            cursor: isActive && dragMode === 'move' ? 'grabbing' : 'grab',
                        }}
                        onPointerDown={(e) => handlePointerDown(e, state.id, 'move')}
                    >
                        <div
                            className={`relative w-full h-full transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-[1.02]'
                                }`}
                        >
                            <div className="relative w-full h-full overflow-hidden shadow-xl rounded-sm">
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

                        {/* Rotate button */}
                        <button
                            className="absolute -top-8 -left-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-gray-100 hover:scale-110"
                            onPointerDown={(e) => handlePointerDown(e, state.id, 'rotate')}
                        >
                            <RotateCcw size={14} className="text-gray-700" />
                        </button>

                        {/* Resize handles */}
                        <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-nw-resize hover:scale-125 hover:bg-blue-400"
                            onPointerDown={(e) => handlePointerDown(e, state.id, 'resize-tl')}
                        />
                        <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-ne-resize hover:scale-125 hover:bg-blue-400"
                            onPointerDown={(e) => handlePointerDown(e, state.id, 'resize-tr')}
                        />
                        <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-sw-resize hover:scale-125 hover:bg-blue-400"
                            onPointerDown={(e) => handlePointerDown(e, state.id, 'resize-bl')}
                        />
                        <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-se-resize hover:scale-125 hover:bg-blue-400"
                            onPointerDown={(e) => handlePointerDown(e, state.id, 'resize-br')}
                        />
                    </div>
                );
            })}
        </div>
    );
}
