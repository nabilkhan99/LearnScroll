'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/navigation/TopNav';
import BottomNav from '@/components/navigation/BottomNav';
import { Content, INTERESTS } from '@/lib/content/types';
import styles from './library.module.css';

type LibraryTab = 'bookmarks' | 'likes' | 'history';

interface LibraryClientProps {
    bookmarkedContent: Content[];
    likedContent: Content[];
}

export default function LibraryClient({
    bookmarkedContent,
    likedContent
}: LibraryClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<LibraryTab>('bookmarks');

    const handleContentClick = (contentId: string) => {
        router.push(`/feed?id=${contentId}`);
    };

    const getCurrentContent = () => {
        switch (activeTab) {
            case 'bookmarks':
                return bookmarkedContent;
            case 'likes':
                return likedContent;
            case 'history':
                return []; // Placeholder for history
        }
    };

    const content = getCurrentContent();

    return (
        <div className={styles.container}>
            <TopNav
                title="Library"
                showVolumeControl={false}
            />

            <main className={styles.main}>
                {/* Tab Selector */}
                <div className={styles.tabBar}>
                    <button
                        className={`${styles.tab} ${activeTab === 'bookmarks' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookmarks')}
                    >
                        <span className={styles.tabIcon}>🔖</span>
                        <span>Saved</span>
                        <span className={styles.tabCount}>{bookmarkedContent.length}</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'likes' ? styles.active : ''}`}
                        onClick={() => setActiveTab('likes')}
                    >
                        <span className={styles.tabIcon}>❤️</span>
                        <span>Liked</span>
                        <span className={styles.tabCount}>{likedContent.length}</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className={styles.tabIcon}>🕒</span>
                        <span>History</span>
                    </button>
                </div>

                {/* Content Grid */}
                {content.length > 0 ? (
                    <div className={styles.contentGrid}>
                        {content.map((item) => {
                            const categoryInfo = INTERESTS.find(i => i.id === item.category);
                            return (
                                <button
                                    key={item.id}
                                    className={styles.contentCard}
                                    onClick={() => handleContentClick(item.id)}
                                >
                                    <div className={styles.cardHeader}>
                                        <span className={styles.categoryBadge}>
                                            {categoryInfo?.icon} {categoryInfo?.label}
                                        </span>
                                        <span className={styles.difficulty}>{item.difficulty}</span>
                                    </div>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    {item.description && (
                                        <p className={styles.cardDescription}>{item.description}</p>
                                    )}
                                    <div className={styles.cardFooter}>
                                        <span className={styles.readTime}>
                                            ⏱ {Math.ceil((item.estimated_time_seconds || 60) / 60)} min
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            {activeTab === 'bookmarks' && '🔖'}
                            {activeTab === 'likes' && '❤️'}
                            {activeTab === 'history' && '🕒'}
                        </div>
                        <h3 className={styles.emptyTitle}>
                            {activeTab === 'bookmarks' && 'No saved content yet'}
                            {activeTab === 'likes' && 'No liked content yet'}
                            {activeTab === 'history' && 'No watch history yet'}
                        </h3>
                        <p className={styles.emptyText}>
                            {activeTab === 'bookmarks' && 'Tap the bookmark icon on content you want to save for later.'}
                            {activeTab === 'likes' && 'Double-tap or tap the heart icon to like content.'}
                            {activeTab === 'history' && 'Content you view will appear here.'}
                        </p>
                        <button
                            className={styles.exploreBtn}
                            onClick={() => router.push('/feed')}
                        >
                            Explore Content
                        </button>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
