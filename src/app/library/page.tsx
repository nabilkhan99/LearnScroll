import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LibraryClient from './LibraryClient';

export const metadata = {
    title: 'Library | LearnScroll',
    description: 'Your saved and bookmarked content',
};

export default async function LibraryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/onboarding');
    }

    // Fetch bookmarked content
    const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select(`
            content_id,
            created_at,
            content:content_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch liked content
    const { data: likes } = await supabase
        .from('likes')
        .select(`
            content_id,
            created_at,
            content:content_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Extract content from bookmarks and likes
    const bookmarkedContent = (bookmarks || [])
        .map(b => b.content)
        .filter(Boolean);

    const likedContent = (likes || [])
        .map(l => l.content)
        .filter(Boolean);

    return (
        <LibraryClient
            bookmarkedContent={bookmarkedContent}
            likedContent={likedContent}
        />
    );
}
