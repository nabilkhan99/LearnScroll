import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';

export const metadata = {
    title: 'Profile | LearnScroll',
    description: 'View your learning progress and achievements',
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/onboarding');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user stats
    const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const { count: bookmarkCount } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Calculate XP and level (placeholder logic - will be enhanced later)
    const xp = (likeCount || 0) * 5 + (bookmarkCount || 0) * 10;
    const level = Math.floor(xp / 100) + 1;
    const xpToNextLevel = 100 - (xp % 100);

    return (
        <ProfileClient
            user={{
                id: user.id,
                email: user.email || '',
                displayName: profile?.display_name || user.email?.split('@')[0] || 'Learner',
                avatarUrl: profile?.avatar_url || null,
                interests: profile?.interests || [],
                focusAreas: profile?.focus_areas || [],
            }}
            stats={{
                xp,
                level,
                xpToNextLevel,
                streak: 7, // Placeholder - will be calculated later
                likes: likeCount || 0,
                bookmarks: bookmarkCount || 0,
                lessonsCompleted: 12, // Placeholder
            }}
        />
    );
}
