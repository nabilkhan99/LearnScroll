'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/navigation/TopNav';
import BottomNav from '@/components/navigation/BottomNav';
import { Content, INTERESTS, Category } from '@/lib/content/types';
import styles from './discover.module.css';

interface DiscoverClientProps {
    trendingContent: Content[];
    contentByCategory: Record<string, Content[]>;
}

export default function DiscoverClient({
    trendingContent,
    contentByCategory
}: DiscoverClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryClick = (category: Category) => {
        // For now, just navigate to feed - later we'll filter
        router.push(`/feed?category=${category}`);
    };

    const handleContentClick = (contentId: string) => {
        router.push(`/feed?id=${contentId}`);
    };

    // Filter categories that have content
    const categoriesWithContent = INTERESTS.filter(
        interest => contentByCategory[interest.id]?.length > 0
    );

    return (
        <div className={styles.container}>
            <TopNav
                showTabs={false}
                title="Discover"
                showVolumeControl={false}
            />

            <main className={styles.main}>
                {/* Search Bar */}
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search topics, creators, content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                {/* Trending Section */}
                {trendingContent.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.trendingIcon}>🔥</span>
                            Trending Now
                        </h2>
                        <div className={styles.trendingGrid}>
                            {trendingContent.slice(0, 4).map((content, index) => (
                                <button
                                    key={content.id}
                                    className={styles.trendingCard}
                                    onClick={() => handleContentClick(content.id)}
                                >
                                    <span className={styles.trendingRank}>#{index + 1}</span>
                                    <div className={styles.trendingContent}>
                                        <p className={styles.trendingTitle}>{content.title}</p>
                                        <span className={styles.trendingCategory}>
                                            {INTERESTS.find(i => i.id === content.category)?.icon}{' '}
                                            {INTERESTS.find(i => i.id === content.category)?.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Grid */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Browse Categories</h2>
                    <div className={styles.categoriesGrid}>
                        {INTERESTS.map((interest) => {
                            const count = contentByCategory[interest.id]?.length || 0;
                            return (
                                <button
                                    key={interest.id}
                                    className={styles.categoryCard}
                                    onClick={() => handleCategoryClick(interest.id)}
                                    style={{
                                        '--category-color': `var(--color-${interest.id})`,
                                    } as React.CSSProperties}
                                >
                                    <span className={styles.categoryIcon}>{interest.icon}</span>
                                    <span className={styles.categoryLabel}>{interest.label}</span>
                                    <span className={styles.categoryCount}>{count} lessons</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Featured Creators (Placeholder) */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Featured Creators</h2>
                    <div className={styles.creatorsRow}>
                        {['Dr. Sarah', 'Prof. Mike', 'Ana Chen', 'James K.'].map((name, i) => (
                            <div key={i} className={styles.creatorCard}>
                                <div className={styles.creatorAvatar}>
                                    {name.charAt(0)}
                                </div>
                                <span className={styles.creatorName}>{name}</span>
                                <button className={styles.followBtn}>Follow</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Collections (Placeholder) */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Collections</h2>
                    <div className={styles.collectionsGrid}>
                        {[
                            { title: 'Quantum Physics 101', count: 8, icon: '⚛️' },
                            { title: 'World History Essentials', count: 12, icon: '🏛️' },
                            { title: 'Psychology Basics', count: 10, icon: '🧠' },
                        ].map((collection, i) => (
                            <button key={i} className={styles.collectionCard}>
                                <span className={styles.collectionIcon}>{collection.icon}</span>
                                <div className={styles.collectionInfo}>
                                    <span className={styles.collectionTitle}>{collection.title}</span>
                                    <span className={styles.collectionCount}>{collection.count} lessons</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
