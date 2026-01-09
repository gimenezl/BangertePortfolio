import ProjectCard from '@/components/ProjectCard';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Portfolio | My Work',
    description: 'Browse through my creative projects and design work.',
};

export const dynamic = 'force-dynamic';

async function getProjects(): Promise<Project[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

export default async function PortfolioPage() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container-custom py-20 md:py-32 animate-fade-in">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-4 animate-slide-up">
                        <span className="text-white/90">My Work</span>{' '}
                        <span className="text-white/50">— and side experiments</span>
                    </h1>
                </header>

                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className="animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-white/40 text-lg font-light">
                            No projects yet. Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
