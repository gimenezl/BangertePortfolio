import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a mock client for build time
        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
                signOut: async () => ({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            },
            from: () => ({
                select: () => ({
                    order: () => Promise.resolve({ data: [], error: null }),
                    eq: () => ({
                        single: () => Promise.resolve({ data: null, error: null }),
                    }),
                }),
                insert: () => Promise.resolve({ data: null, error: null }),
                update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
                delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
            }),
            storage: {
                from: () => ({
                    upload: async () => ({ error: null }),
                    getPublicUrl: () => ({ data: { publicUrl: '' } }),
                }),
            },
        } as ReturnType<typeof createBrowserClient>;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
