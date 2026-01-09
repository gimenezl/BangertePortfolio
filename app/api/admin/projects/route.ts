import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST - Create a new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, slug, description, cover_image, gallery_images } = body;

        if (!title || !slug || !cover_image) {
            return NextResponse.json({
                error: 'title, slug, and cover_image are required'
            }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Create the project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                title: title.trim(),
                slug: slug.trim(),
                description: description?.trim() || null,
                cover_image,
            })
            .select()
            .single();

        if (projectError) {
            console.error('Project insert error:', projectError);
            return NextResponse.json({ error: projectError.message }, { status: 500 });
        }

        // Add gallery images if provided
        if (gallery_images && gallery_images.length > 0) {
            const imageRecords = gallery_images.map((url: string, index: number) => ({
                project_id: project.id,
                image_url: url,
                display_order: index,
            }));

            const { error: imagesError } = await supabase
                .from('project_images')
                .insert(imageRecords);

            if (imagesError) {
                console.error('Project images insert error:', imagesError);
                // Don't fail the whole request, project was created
            }
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Project API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update a project
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, slug, description, cover_image, gallery_images } = body;

        if (!id || !title || !slug || !cover_image) {
            return NextResponse.json({
                error: 'id, title, slug, and cover_image are required'
            }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Update the project
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                title: title.trim(),
                slug: slug.trim(),
                description: description?.trim() || null,
                cover_image,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (updateError) {
            console.error('Project update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Delete existing gallery images
        await supabase.from('project_images').delete().eq('project_id', id);

        // Add new gallery images if provided
        if (gallery_images && gallery_images.length > 0) {
            const imageRecords = gallery_images.map((url: string, index: number) => ({
                project_id: id,
                image_url: url,
                display_order: index,
            }));

            const { error: imagesError } = await supabase
                .from('project_images')
                .insert(imageRecords);

            if (imagesError) {
                console.error('Project images update error:', imagesError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Project update API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove a project
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Project delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Project delete API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

