import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();

        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);

        // Get the user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Check if profile exists, if not redirect to complete onboarding
            const { data: profile } = await supabase
                .from('profiles')
                .select('interests')
                .eq('id', user.id)
                .single();

            // If profile exists but has no interests, redirect to onboarding interest selection
            if (profile && (!profile.interests || profile.interests.length === 0)) {
                return NextResponse.redirect(`${origin}/onboarding?step=interests`);
            }
        }
    }

    // Default redirect to feed
    return NextResponse.redirect(`${origin}/feed`);
}
