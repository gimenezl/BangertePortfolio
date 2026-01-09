'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProjectWithImages } from '@/lib/types';

interface Props {
    params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [project, setProject] = useState<ProjectWithImages | null>(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (projectError || !projectData) {
                router.push('/admin/projects');
                return;
            }

            const { data: imagesData } = await supabase
                .from('project_images')
                .select('*')
                .eq('project_id', id)
                .order('display_order', { ascending: true });

            const fullProject = { ...projectData, images: imagesData || [] };
            setProject(fullProject);
            setTitle(projectData.title);
            setSlug(projectData.slug);
            setDescription(projectData.description || '');
            setCoverImage(projectData.cover_image);
            setGalleryImages((imagesData || []).map((img: { image_url: string }) => img.image_url));
            setIsLoading(false);
        };

        fetchProject();
    }, [id, supabase, router]);

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
            if (!title.trim()) throw new Error('Title is required');
            if (!slug.trim()) throw new Error('Slug is required');
            if (!coverImage) throw new Error('Cover image is required');

            // Update project via API
            const response = await fetch('/api/admin/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    title: title.trim(),
                    slug: slug.trim(),
                    description: description.trim() || null,
                    cover_image: coverImage,
                    gallery_images: galleryImages,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update project');

            router.push('/admin/projects');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Project not found</p>
                <Link href="/admin/projects">
                    <Button className="mt-4">Back to Projects</Button>
                </Link>
            </div>
        );
    }

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
                <h1 className="text-2xl font-semibold">Edit Project</h1>
                <p className="text-gray-600 mt-1">Update "{project.title}"</p>
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
                        onChange={(e) => setTitle(e.target.value)}
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
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
