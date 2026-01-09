'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import { generateSlug } from '@/lib/utils';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewProjectPage() {
    const router = useRouter();
    const supabase = createClient();

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(value));
        }
    };

    const handleAddGalleryImage = (url: string) => {
        setGalleryImages([...galleryImages, url]);
    };

    const handleRemoveGalleryImage = (index: number) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Validate
            if (!title.trim()) throw new Error('Title is required');
            if (!slug.trim()) throw new Error('Slug is required');
            if (!coverImage) throw new Error('Cover image is required');

            // Create project via API
            const response = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    slug: slug.trim(),
                    description: description.trim() || null,
                    cover_image: coverImage,
                    gallery_images: galleryImages,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create project');

            router.push('/admin/projects');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <Link
                href="/admin/projects"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={18} />
                Back to Projects
            </Link>

            <header className="mb-8">
                <h1 className="text-2xl font-semibold">New Project</h1>
                <p className="text-gray-600 mt-1">Create a new portfolio project</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                )}

                <div className="bg-white p-6 rounded-lg border space-y-6">
                    <h2 className="font-medium">Project Details</h2>

                    <Input
                        id="title"
                        label="Title"
                        placeholder="Project title"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                    />

                    <Input
                        id="slug"
                        label="Slug"
                        placeholder="project-slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                    />

                    <Textarea
                        id="description"
                        label="Description"
                        placeholder="Describe your project..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg border space-y-6">
                    <h2 className="font-medium">Cover Image</h2>
                    <ImageUpload
                        value={coverImage}
                        onChange={setCoverImage}
                        onRemove={() => setCoverImage('')}
                        bucket="project-images"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg border space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium">Gallery Images</h2>
                        <span className="text-sm text-gray-500">{galleryImages.length} images</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryImages.map((url, index) => (
                            <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-full shadow-sm"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                            <Plus size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-500 mt-1">Add Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('bucket', 'project-images');

                                    const response = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: formData,
                                    });

                                    if (response.ok) {
                                        const data = await response.json();
                                        handleAddGalleryImage(data.url);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link href="/admin/projects">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" isLoading={isSubmitting}>
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    );
}
