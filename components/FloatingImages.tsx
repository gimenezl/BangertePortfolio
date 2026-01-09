'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RotateCw } from 'lucide-react';
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
}

// Mobile Grid Component
function MobileLayout({ images }: { images: HeroImage[] }) {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsAnimated(true), 100);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="px-6 pt-20 pb-8">
                <div className={`transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <h1 className="text-2xl font-light leading-relaxed mb-2">Ivana Bangerte /</h1>
                    <p className="text-lg text-white/70 font-light">Advertising & Creative Professional.</p>
                    <p className="text-lg text-white/50 font-light italic">Visually driven, culturally aware — a little surreal.</p>
                </div>
            </div>

            <div className="px-4 pb-8">
                <div className="grid grid-cols-2 gap-3">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative overflow-hidden rounded-lg transition-all duration-700 ease-out ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                } ${index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <Image src={image.image_url} alt={image.alt_text || 'Portfolio image'} fill className="object-cover" sizes="50vw" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FloatingImages({ images }: FloatingImagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageStates, setImageStates] = useState<ImageState[]>([]);
    const [maxZIndex, setMaxZIndex] = useState(10);
    const [isAnimated, setIsAnimated] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Action refs
    const actionRef = useRef<{
        type: 'move' | 'rotate' | 'resize' | null;
        id: string | null;
        startX: number;
        startY: number;
        startValue: number;
        startImgX: number;
        startImgY: number;
    }>({
        type: null,
        id: null,
        startX: 0,
        startY: 0,
        startValue: 0,
        startImgX: 0,
        startImgY: 0,
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize images
    useEffect(() => {
        if (images.length === 0 || imageStates.length > 0 || isMobile) return;
        const container = containerRef.current;
        if (!container) return;

        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        const centerX = cw * 0.5;
        const centerY = ch * 0.55;

        Promise.all(
            images.map((img, i) =>
                new Promise<ImageState>((resolve) => {
                    const imgEl = new window.Image();
                    imgEl.onload = () => {
                        const aspect = imgEl.naturalHeight / imgEl.naturalWidth;
                        const w = 180 + Math.random() * 120;
                        const h = w * aspect;
                        const angle = (i / images.length) * Math.PI * 2 + Math.random() * 0.5;
                        const radius = Math.random() * 300;
                        resolve({
                            id: img.id,
                            x: Math.max(20, Math.min(centerX + Math.cos(angle) * radius - w / 2, cw - w - 20)),
                            y: Math.max(100, Math.min(centerY + Math.sin(angle) * radius * 0.5 - h / 2, ch - h - 60)),
                            width: w,
                            height: h,
                            zIndex: i + 1,
                            rotation: (Math.random() - 0.5) * 10,
                            aspectRatio: aspect,
                        });
                    };
                    imgEl.onerror = () => resolve({ id: img.id, x: centerX - 100, y: centerY - 75, width: 200, height: 150, zIndex: i + 1, rotation: 0, aspectRatio: 0.75 });
                    imgEl.src = img.image_url;
                })
            )
        ).then((states) => {
            setImageStates(states);
            setMaxZIndex(images.length + 1);
            setTimeout(() => setIsAnimated(true), 100);
        });
    }, [images, imageStates.length, isMobile]);

    const bringToFront = (id: string) => {
        const newZ = maxZIndex + 1;
        setMaxZIndex(newZ);
        setImageStates((prev) => prev.map((s) => (s.id === id ? { ...s, zIndex: newZ } : s)));
    };

    const startAction = (e: React.MouseEvent, id: string, type: 'move' | 'rotate' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();

        const state = imageStates.find((s) => s.id === id);
        if (!state) return;

        actionRef.current = {
            type,
            id,
            startX: e.clientX,
            startY: e.clientY,
            startValue: type === 'rotate' ? state.rotation : state.width,
            startImgX: state.x,
            startImgY: state.y,
        };

        setActiveId(id);
        bringToFront(id);

        const handleMove = (ev: MouseEvent) => {
            const ref = actionRef.current;
            if (!ref.type || !ref.id) return;

            const dx = ev.clientX - ref.startX;
            const dy = ev.clientY - ref.startY;

            setImageStates((prev) =>
                prev.map((s) => {
                    if (s.id !== ref.id) return s;

                    if (ref.type === 'move') {
                        return { ...s, x: ref.startImgX + dx, y: ref.startImgY + dy };
                    }

                    if (ref.type === 'rotate') {
                        // Horizontal drag = rotation
                        const newRotation = ref.startValue + dx * 0.5;
                        return { ...s, rotation: newRotation };
                    }

                    if (ref.type === 'resize') {
                        // Diagonal drag = resize
                        const delta = (dx + dy) * 0.5;
                        const newWidth = Math.max(100, Math.min(500, ref.startValue + delta));
                        const newHeight = newWidth * s.aspectRatio;
                        return { ...s, width: newWidth, height: newHeight };
                    }

                    return s;
                })
            );
        };

        const handleUp = () => {
            actionRef.current = { type: null, id: null, startX: 0, startY: 0, startValue: 0, startImgX: 0, startImgY: 0 };
            setActiveId(null);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    };

    if (isMobile) return <MobileLayout images={images} />;

    if (images.length === 0) {
        return (
            <div className="relative w-full min-h-screen bg-black flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full min-h-screen bg-black overflow-hidden select-none">
            {/* Tagline */}
            <div className={`absolute top-12 left-12 z-50 text-white max-w-xl transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <h1 className="text-2xl font-normal leading-relaxed">
                    <span className="block">Ivana Bangerte /</span>
                    <span className="block">Advertising & Creative Professional.</span>
                    <span className="block">Visually driven, culturally aware — a little <em>surreal.</em></span>
                </h1>
            </div>

            {/* Images */}
            {imageStates.map((state, index) => {
                const image = images.find((img) => img.id === state.id);
                if (!image) return null;

                const isActive = activeId === state.id;

                return (
                    <div
                        key={state.id}
                        className={`absolute group ${isActive ? '' : 'transition-all duration-500 ease-out'}`}
                        style={{
                            left: state.x,
                            top: state.y,
                            width: state.width,
                            height: state.height,
                            zIndex: state.zIndex,
                            transform: `rotate(${state.rotation}deg) scale(${isActive ? 1.05 : 1})`,
                            opacity: isAnimated ? 1 : 0,
                            transitionDelay: isAnimated ? '0ms' : `${index * 100}ms`,
                        }}
                    >
                        {/* Image - drag to move */}
                        <div
                            className={`relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden rounded shadow-lg ${isActive ? 'shadow-2xl shadow-cyan-500/30' : 'hover:shadow-xl'
                                } transition-shadow duration-300`}
                            onMouseDown={(e) => startAction(e, state.id, 'move')}
                        >
                            <Image
                                src={image.image_url}
                                alt={image.alt_text || 'Portfolio'}
                                fill
                                className="object-cover pointer-events-none"
                                sizes="400px"
                                draggable={false}
                            />
                        </div>

                        {/* Rotate handle - TOP LEFT corner */}
                        <div
                            className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 hover:scale-125 hover:bg-cyan-400 transition-all duration-200"
                            onMouseDown={(e) => startAction(e, state.id, 'rotate')}
                            title="Drag to rotate"
                        >
                            <RotateCw size={12} className="text-gray-700" />
                        </div>

                        {/* Resize handle - BOTTOM RIGHT corner */}
                        <div
                            className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg cursor-se-resize opacity-0 group-hover:opacity-100 hover:scale-125 hover:bg-cyan-400 transition-all duration-200 flex items-center justify-center"
                            onMouseDown={(e) => startAction(e, state.id, 'resize')}
                            title="Drag to resize"
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-700">
                                <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
