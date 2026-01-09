import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link href={`/portfolio/${project.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-white/5 rounded-sm">
                {project.cover_image ? (
                    <Image
                        src={project.cover_image}
                        alt={project.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                        No Image
                    </div>
                )}

                {/* Hover Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Title Overlay on hover */}
                <div className="absolute inset-0 flex items-end p-6">
                    <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="text-lg font-light text-white">
                            {project.title}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">View project →</p>
                    </div>
                </div>
            </div>

            {/* Title below image */}
            <h4 className="mt-4 text-sm font-light text-white/70 group-hover:text-white transition-colors duration-300">
                {project.title}
            </h4>
        </Link>
    );
}
