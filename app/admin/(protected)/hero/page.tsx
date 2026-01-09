'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import Modal from '@/components/ui/Modal';
import { Trash2, GripVertical } from 'lucide-react';
import type { HeroImage } from '@/lib/types';

export default function HeroManagementPage() {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchImages = async () => {
        const { data, error } = await supabase
            .from('hero_images')
            .select('*')
            .order('display_order', { ascending: true });

        if (!error && data) {
            setImages(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleAddImage = async (url: string) => {
        setIsUploading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/hero-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_url: url,
                    display_order: images.length,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add image');

            await fetchImages();
            setShowAddModal(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error
                ? err.message
                : (err as { message?: string })?.message || 'An unknown error occurred';
            console.error('Error adding image:', errorMessage, err);
            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/hero-images?id=${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete image');

            setImages(images.filter((img) => img.id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error('Error deleting image:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div>
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold">Hero Images</h1>
                    <p className="text-gray-600 mt-1">Manage homepage carousel images</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>Add Image</Button>
            </header>

            {images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="relative group bg-white rounded-lg border overflow-hidden"
                        >
                            <div className="relative aspect-video">
                                <Image
                                    src={image.image_url}
                                    alt={image.alt_text || 'Hero image'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <GripVertical size={16} />
                                    <span className="text-sm">Order: {index + 1}</span>
                                </div>
                                <button
                                    onClick={() => setDeleteId(image.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <p className="text-gray-500">No hero images yet</p>
                    <Button onClick={() => setShowAddModal(true)} className="mt-4">
                        Add Your First Image
                    </Button>
                </div>
            )}

            {/* Add Image Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Hero Image"
            >
                <ImageUpload
                    onChange={handleAddImage}
                    bucket="hero-images"
                    label="Upload Image"
                />
                {isUploading && (
                    <p className="text-sm text-gray-500 mt-2">Saving...</p>
                )}
                {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Image"
            >
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this image? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setDeleteId(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
