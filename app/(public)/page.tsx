import FloatingImages from '@/components/FloatingImages';
import { createClient } from '@/lib/supabase/server';
import type { HeroImage } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getHeroImages(): Promise<HeroImage[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('hero_images')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching hero images:', error);
        return [];
    }
}

export default async function HomePage() {
    const heroImages = await getHeroImages();

    return (
        <div className="animate-fade-in">
            <FloatingImages images={heroImages} />
        </div>
    );
}
