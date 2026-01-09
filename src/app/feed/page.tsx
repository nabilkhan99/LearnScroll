'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Content, isTextContent } from '@/lib/content/types';
import TextContentCard from '@/components/content/TextContentCard';
import TopNav from '@/components/navigation/TopNav';
import BottomNav from '@/components/navigation/BottomNav';
import styles from './feed.module.css';

export default function FeedPage() {
    const [content, setContent] = useState<Content[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userInterests, setUserInterests] = useState<string[]>([]);
    const [likedContentIds, setLikedContentIds] = useState<Set<string>>(new Set());
    const [bookmarkedContentIds, setBookmarkedContentIds] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
    const [isMuted, setIsMuted] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Fetch user profile and content
    useEffect(() => {
        async function loadData() {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get user profile for interests
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('interests')
                    .eq('id', user.id)
                    .single();

                if (profile?.interests) {
                    setUserInterests(profile.interests);
                }

                // Get user's likes
                const { data: likes } = await supabase
                    .from('likes')
                    .select('content_id')
                    .eq('user_id', user.id);

                if (likes) {
                    setLikedContentIds(new Set(likes.map(l => l.content_id)));
                }

                // Get user's bookmarks
                const { data: bookmarks } = await supabase
                    .from('bookmarks')
                    .select('content_id')
                    .eq('user_id', user.id);

                if (bookmarks) {
                    setBookmarkedContentIds(new Set(bookmarks.map(b => b.content_id)));
                }
            }

            // Fetch content (for now, fetch all - we'll filter in future)
            const { data: contentData, error } = await supabase
                .from('content')
                .select('*')
                .eq('type', 'text')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching content:', error);
            } else if (contentData) {
                setContent(contentData as Content[]);
            }

            setLoading(false);
        }

        loadData();
    }, []);

    // Intersection Observer to track current visible item
    useEffect(() => {
        if (content.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                        setCurrentIndex(index);
                    }
                });
            },
            {
                root: containerRef.current,
                threshold: 0.5, // Trigger when 50% visible
            }
        );

        // Observe all feed items
        itemRefs.current.forEach((element) => {
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [content]);

    // Keyboard navigation - scrolls to item instead of state update
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            let targetIndex = currentIndex;

            if (e.key === 'ArrowDown' || e.key === 'j') {
                targetIndex = Math.min(currentIndex + 1, content.length - 1);
            } else if (e.key === 'ArrowUp' || e.key === 'k') {
                targetIndex = Math.max(currentIndex - 1, 0);
            } else {
                return;
            }

            const targetElement = itemRefs.current.get(targetIndex);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, content.length]);

    // Handle like
    const handleLike = useCallback(async (contentId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const isLiked = likedContentIds.has(contentId);

        if (isLiked) {
            // Unlike
            await supabase
                .from('likes')
                .delete()
                .eq('user_id', user.id)
                .eq('content_id', contentId);

            setLikedContentIds(prev => {
                const next = new Set(prev);
                next.delete(contentId);
                return next;
            });
        } else {
            // Like
            await supabase
                .from('likes')
                .insert({ user_id: user.id, content_id: contentId });

            setLikedContentIds(prev => new Set([...prev, contentId]));
        }
    }, [likedContentIds]);

    // Handle bookmark
    const handleBookmark = useCallback(async (contentId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const isBookmarked = bookmarkedContentIds.has(contentId);

        if (isBookmarked) {
            // Remove bookmark
            await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('content_id', contentId);

            setBookmarkedContentIds(prev => {
                const next = new Set(prev);
                next.delete(contentId);
                return next;
            });
        } else {
            // Add bookmark
            await supabase
                .from('bookmarks')
                .insert({ user_id: user.id, content_id: contentId });

            setBookmarkedContentIds(prev => new Set([...prev, contentId]));
        }
    }, [bookmarkedContentIds]);

    // Handle share
    const handleShare = useCallback(async (contentItem: Content) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: contentItem.title,
                    text: contentItem.description || '',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled or failed:', err);
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
        }
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading your feed...</p>
            </div>
        );
    }

    if (content.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>📚</div>
                <h2>No content yet</h2>
                <p>Check back soon for new learning content!</p>
            </div>
        );
    }

    return (
        <>
            <TopNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isMuted={isMuted}
                onMuteToggle={() => setIsMuted(!isMuted)}
            />

            <div
                ref={containerRef}
                className={styles.container}
            >
                {/* Scrollable feed - renders all items */}
                {content.map((item, index) => (
                    <div
                        key={item.id}
                        data-index={index}
                        ref={(el) => {
                            if (el) itemRefs.current.set(index, el);
                        }}
                        className={styles.feedItem}
                    >
                        {isTextContent(item) && (
                            <TextContentCard
                                content={item}
                                isLiked={likedContentIds.has(item.id)}
                                isBookmarked={bookmarkedContentIds.has(item.id)}
                                onLike={() => handleLike(item.id)}
                                onBookmark={() => handleBookmark(item.id)}
                                onShare={() => handleShare(item)}
                            />
                        )}
                    </div>
                ))}

                {/* Navigation hint - only show when not at end */}
                <div className={styles.navHint}>
                    {currentIndex < content.length - 1 && (
                        <div className={styles.swipeHint}>
                            <span>↑</span>
                            <span className={styles.swipeText}>Scroll up</span>
                        </div>
                    )}
                </div>

                {/* Progress indicator */}
                <div className={styles.progressIndicator}>
                    <span>{currentIndex + 1}</span>
                    <span className={styles.separator}>/</span>
                    <span>{content.length}</span>
                </div>

                {/* Progress dots - like TikTok */}
                <div className={styles.progressDots}>
                    {content.slice(0, 10).map((_, i) => (
                        <div
                            key={i}
                            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : i < currentIndex ? styles.dotPassed : ''}`}
                        />
                    ))}\n                    {content.length > 10 && <span className={styles.dotMore}>+{content.length - 10}</span>}
                </div>
            </div>

            <BottomNav />
        </>
    );
}
