import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Image as ImageIcon, FolderOpen, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
    try {
        const supabase = await createClient();

        const [heroResult, projectsResult] = await Promise.all([
            supabase.from('hero_images').select('id', { count: 'exact' }),
            supabase.from('projects').select('id', { count: 'exact' }),
        ]);

        return {
            heroImages: heroResult.count || 0,
            projects: projectsResult.count || 0,
        };
    } catch {
        return { heroImages: 0, projects: 0 };
    }
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    const cards = [
        {
            title: 'Hero Images',
            count: stats.heroImages,
            icon: ImageIcon,
            href: '/admin/hero',
            description: 'Manage homepage carousel images',
        },
        {
            title: 'Projects',
            count: stats.projects,
            icon: FolderOpen,
            href: '/admin/projects',
            description: 'Manage portfolio projects',
        },
    ];

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to your portfolio admin panel</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Icon size={24} className="text-gray-700" />
                                </div>
                                <ArrowRight
                                    size={20}
                                    className="text-gray-400 group-hover:text-gray-700 transition-colors"
                                />
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-semibold">{card.count}</p>
                                <h3 className="text-lg font-medium mt-1">{card.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <section className="mt-12">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/admin/hero"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Add Hero Image
                    </Link>
                    <Link
                        href="/admin/projects/new"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Create New Project
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        View Site →
                    </Link>
                </div>
            </section>
        </div>
    );
}
