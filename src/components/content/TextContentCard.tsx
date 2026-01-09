'use client';

import { useState, useCallback } from 'react';
import { Content, TextContentMetadata, INTERESTS } from '@/lib/content/types';
import styles from './TextContentCard.module.css';

interface TextContentCardProps {
    content: Content & { metadata: TextContentMetadata };
    isLiked: boolean;
    isBookmarked: boolean;
    onLike: () => void;
    onBookmark: () => void;
    onShare: () => void;
}

export default function TextContentCard({
    content,
    isLiked,
    isBookmarked,
    onLike,
    onBookmark,
    onShare,
}: TextContentCardProps) {
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Get category info
    const categoryInfo = INTERESTS.find(i => i.id === content.category);

    // Handle double tap to like
    const handleDoubleTap = useCallback(() => {
        if (!isLiked) {
            onLike();
            setShowHeartAnimation(true);
            setTimeout(() => setShowHeartAnimation(false), 800);
        }
    }, [isLiked, onLike]);

    // Handle content scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
        setScrollProgress(Math.min(1, Math.max(0, progress)));
    }, []);

    // Format reading time
    const readingTime = content.metadata.reading_time_seconds
        ? Math.ceil(content.metadata.reading_time_seconds / 60)
        : Math.ceil(content.metadata.word_count / 200);

    // Format numbers (1200 -> 1.2k)
    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <div
            className={styles.card}
            onDoubleClick={handleDoubleTap}
        >
            {/* Background Gradient */}
            <div className={styles.backgroundGradient} />

            {/* Header Meta - now at top of content */}
            <div className={styles.headerMeta}>
                <span className={styles.categoryPill}>
                    {categoryInfo?.label || content.category}
                </span>
                <span className={styles.timePill}>
                    ⏱ {readingTime} min
                </span>
            </div>

            {/* Scrollable Content */}
            <div className={styles.contentWrapper} onScroll={handleScroll}>
                <h1 className={styles.title}>{content.title}</h1>

                {/* Author Info - from database */}
                <div className={styles.authorInfo}>
                    <div className={styles.authorAvatar}>
                        <div className={styles.avatarPlaceholder} />
                    </div>
                    <span className={styles.authorName}>{content.author}</span>
                </div>

                {/* Body Content */}
                <div className={styles.body}>
                    {content.metadata.body.split('\n\n').map((paragraph, index) => (
                        <p key={index} className={styles.paragraph}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Bottom spacer */}
                <div className={styles.bottomSpacer} />
            </div>

            {/* Interaction Buttons - Right Side */}
            <div className={styles.interactions}>
                <button
                    className={`${styles.interactionBtn} ${isLiked ? styles.liked : ''}`}
                    onClick={onLike}
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                >
                    <span className={styles.iconSymbol}>{isLiked ? '♥' : '♡'}</span>
                    <span className={styles.count}>Like</span>
                </button>

                <button
                    className={`${styles.interactionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                    onClick={onBookmark}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                    <span className={styles.iconSymbol}>{isBookmarked ? '🔖' : '🔖'}</span>
                    <span className={styles.count}>Save</span>
                </button>

                <button
                    className={styles.interactionBtn}
                    onClick={onShare}
                    aria-label="Share"
                >
                    <span className={styles.iconSymbol}>↗</span>
                    <span className={styles.count}>Share</span>
                </button>
            </div>

            {/* Bottom Progress Section */}
            <div className={styles.bottomSection}>
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Lesson Progress</span>
                        <span className={styles.progressPercent}>{Math.round(scrollProgress * 100)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${scrollProgress * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Heart Animation Overlay */}
            {showHeartAnimation && (
                <div className={styles.heartOverlay}>
                    <span className={styles.heartAnimation}>♥</span>
                </div>
            )}
        </div>
    );
}
