import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DiscoverClient from './DiscoverClient';

export const metadata = {
    title: 'Discover | LearnScroll',
    description: 'Explore topics and find new learning content',
};

export default async function DiscoverPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/onboarding');
    }

    // Fetch trending content
    const { data: trendingContent } = await supabase
        .from('content')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(10);

    // Fetch content by category (sample)
    const { data: allContent } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

    // Group content by category
    const contentByCategory = (allContent || []).reduce((acc, content) => {
        if (!acc[content.category]) {
            acc[content.category] = [];
        }
        acc[content.category].push(content);
        return acc;
    }, {} as Record<string, typeof allContent>);

    return (
        <DiscoverClient
            trendingContent={trendingContent || []}
            contentByCategory={contentByCategory}
        />
    );
}
