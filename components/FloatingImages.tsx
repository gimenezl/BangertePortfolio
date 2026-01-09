'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Drag refs
    const dragRef = useRef({
        active: false,
        id: null as string | null,
        startX: 0,
        startY: 0,
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

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const state = imageStates.find((s) => s.id === id);
        if (!state) return;

        dragRef.current = {
            active: true,
            id,
            startX: e.clientX,
            startY: e.clientY,
            startImgX: state.x,
            startImgY: state.y,
        };

        setDraggingId(id);
        setMaxZIndex((z) => z + 1);
        setImageStates((prev) => prev.map((s) => (s.id === id ? { ...s, zIndex: maxZIndex + 1 } : s)));

        const handleMove = (ev: MouseEvent) => {
            if (!dragRef.current.active) return;
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;
            setImageStates((prev) =>
                prev.map((s) =>
                    s.id === dragRef.current.id
                        ? { ...s, x: dragRef.current.startImgX + dx, y: dragRef.current.startImgY + dy }
                        : s
                )
            );
        };

        const handleUp = () => {
            dragRef.current.active = false;
            dragRef.current.id = null;
            setDraggingId(null);
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

                const isDragging = draggingId === state.id;

                return (
                    <div
                        key={state.id}
                        className={`absolute cursor-grab active:cursor-grabbing ${isDragging ? '' : 'transition-[transform,box-shadow] duration-500 ease-out'
                            }`}
                        style={{
                            left: state.x,
                            top: state.y,
                            width: state.width,
                            height: state.height,
                            zIndex: state.zIndex,
                            transform: `rotate(${state.rotation}deg) scale(${isDragging ? 1.08 : 1})`,
                            opacity: isAnimated ? 1 : 0,
                            transitionDelay: isAnimated ? '0ms' : `${index * 100}ms`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, state.id)}
                    >
                        <div
                            className={`relative w-full h-full overflow-hidden rounded shadow-lg transition-shadow duration-300 ${isDragging ? 'shadow-2xl shadow-white/20' : 'hover:shadow-xl'
                                }`}
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
                    </div>
                );
            })}
        </div>
    );
}
