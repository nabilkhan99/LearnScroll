'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Content, VideoContentMetadata, INTERESTS } from '@/lib/content/types';
import styles from './VideoContentCard.module.css';

interface VideoContentCardProps {
    content: Content & { metadata: VideoContentMetadata };
    isActive: boolean; // Controls auto-play
    isMuted: boolean;
    isLiked: boolean;
    isBookmarked: boolean;
    onLike: () => void;
    onBookmark: () => void;
    onShare: () => void;
}

export default function VideoContentCard({
    content,
    isActive,
    isMuted,
    isLiked,
    isBookmarked,
    onLike,
    onBookmark,
    onShare,
}: VideoContentCardProps) {
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Get category info
    const categoryInfo = INTERESTS.find(i => i.id === content.category);

    // Auto-play/pause based on visibility
    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            videoRef.current.play().catch(() => {
                // Auto-play failed, user needs to interact first
                setIsPlaying(false);
            });
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    // Sync mute state
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Handle double tap to like
    const handleDoubleTap = useCallback(() => {
        if (!isLiked) {
            onLike();
            setShowHeartAnimation(true);
            setTimeout(() => setShowHeartAnimation(false), 800);
        }
    }, [isLiked, onLike]);

    // Handle video progress
    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current) return;
        const currentProgress = videoRef.current.currentTime / videoRef.current.duration;
        setProgress(Math.min(1, Math.max(0, currentProgress)));
    }, []);

    // Handle play/pause
    const handlePlayPause = useCallback(() => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={styles.card}
            onDoubleClick={handleDoubleTap}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className={styles.video}
                src={content.metadata.video_url}
                poster={content.metadata.thumbnail_url}
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={handlePlayPause}
            >
                {content.metadata.captions_url && (
                    <track
                        kind="captions"
                        src={content.metadata.captions_url}
                        srcLang="en"
                        label="English"
                        default
                    />
                )}
            </video>

            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div className={styles.playOverlay} onClick={handlePlayPause}>
                    <div className={styles.playButton}>▶</div>
                </div>
            )}

            {/* Header Meta */}
            <div className={styles.headerMeta}>
                <span className={styles.categoryPill}>
                    {categoryInfo?.label || content.category}
                </span>
                <span className={styles.timePill}>
                    ⏱ {formatDuration(content.metadata.duration_seconds)}
                </span>
            </div>

            {/* Bottom Content Overlay */}
            <div className={styles.bottomOverlay}>
                <h1 className={styles.title}>{content.title}</h1>

                {/* Author Info */}
                <div className={styles.authorInfo}>
                    <div className={styles.authorAvatar}>
                        <div className={styles.avatarPlaceholder} />
                    </div>
                    <span className={styles.authorName}>{content.author}</span>
                </div>

                {content.description && (
                    <p className={styles.description}>{content.description}</p>
                )}
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
                    <span className={styles.iconSymbol}>🔖</span>
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

            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress * 100}%` }}
                />
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
