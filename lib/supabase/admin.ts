import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for elevated operations
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        // Return a mock client for build time
        return {
            storage: {
                from: () => ({
                    upload: async () => ({ error: new Error('Supabase not configured') }),
                    getPublicUrl: () => ({ data: { publicUrl: '' } }),
                }),
            },
        } as unknown as ReturnType<typeof createClient>;
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
