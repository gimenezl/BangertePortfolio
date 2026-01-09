'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import type { Project } from '@/lib/types';

export default function ProjectsManagementPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchProjects = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProjects(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);

            if (error) throw error;

            setProjects(projects.filter((p) => p.id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error('Error deleting project:', err);
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
                    <h1 className="text-2xl font-semibold">Projects</h1>
                    <p className="text-gray-600 mt-1">Manage your portfolio projects</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Project
                    </Button>
                </Link>
            </header>

            {projects.length > 0 ? (
                <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                    Project
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 hidden md:table-cell">
                                    Slug
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 hidden lg:table-cell">
                                    Created
                                </th>
                                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {project.cover_image && (
                                                    <Image
                                                        src={project.cover_image}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{project.title}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1 md:hidden">
                                                    /{project.slug}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                        /{project.slug}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/portfolio/${project.slug}`}
                                                target="_blank"
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <ExternalLink size={18} />
                                            </Link>
                                            <Link
                                                href={`/admin/projects/${project.id}/edit`}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteId(project.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <p className="text-gray-500">No projects yet</p>
                    <Link href="/admin/projects/new">
                        <Button className="mt-4">Create Your First Project</Button>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Project"
            >
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this project? This will also delete all associated images. This action cannot be undone.
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
