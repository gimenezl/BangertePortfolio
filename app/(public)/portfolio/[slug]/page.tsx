import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ProjectWithImages } from '@/lib/types';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const project = await getProject(slug);

    if (!project) {
        return { title: 'Project Not Found' };
    }

    return {
        title: `${project.title} | Portfolio`,
        description: project.description || `View the ${project.title} project`,
        openGraph: {
            title: project.title,
            description: project.description || undefined,
            images: project.cover_image ? [project.cover_image] : undefined,
        },
    };
}

async function getProject(slug: string): Promise<ProjectWithImages | null> {
    try {
        const supabase = await createClient();

        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('slug', slug)
            .single();

        if (projectError || !project) return null;

        const { data: images, error: imagesError } = await supabase
            .from('project_images')
            .select('*')
            .eq('project_id', project.id)
            .order('display_order', { ascending: true });

        if (imagesError) throw imagesError;

        return { ...project, images: images || [] };
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
}

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params;
    const project = await getProject(slug);

    if (!project) {
        notFound();
    }

    return (
        <div className="container-custom py-12 animate-fade-in">
            {/* Back Link */}
            <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
            >
                <ArrowLeft size={20} />
                <span>Back to Portfolio</span>
            </Link>

            {/* Project Header */}
            <header className="mb-12">
                <h1 className="text-3xl md:text-5xl font-medium mb-6">
                    {project.title}
                </h1>
                {project.description && (
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        {project.description}
                    </p>
                )}
            </header>

            {/* Cover Image */}
            <div className="relative aspect-video mb-12 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                    src={project.cover_image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
            </div>

            {/* Gallery */}
            {project.images.length > 0 && (
                <section>
                    <h2 className="text-xl font-medium mb-6">Gallery</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.images.map((image) => (
                            <div
                                key={image.id}
                                className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden"
                            >
                                <Image
                                    src={image.image_url}
                                    alt={`${project.title} image`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
