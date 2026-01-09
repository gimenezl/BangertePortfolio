import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST - Add a new hero image
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image_url, display_order } = body;

        if (!image_url) {
            return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('hero_images')
            .insert({
                image_url,
                display_order: display_order ?? 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Hero image insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Hero image API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove a hero image
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('hero_images')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Hero image delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Hero image delete API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
