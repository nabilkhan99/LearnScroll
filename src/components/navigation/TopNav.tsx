'use client';

import Link from 'next/link';
import styles from './TopNav.module.css';

interface TopNavProps {
    showVolumeControl?: boolean;
    isMuted?: boolean;
    onMuteToggle?: () => void;
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
}

export default function TopNav({
    showVolumeControl = true,
    isMuted = true,
    onMuteToggle,
    title,
    showBack = false,
    onBack,
}: TopNavProps) {
    return (
        <nav className={styles.nav}>
            <div className={styles.left}>
                {showBack ? (
                    <button className={styles.iconBtn} onClick={onBack} aria-label="Go back">
                        <BackIcon />
                    </button>
                ) : (
                    <Link href="/discover" className={styles.iconBtn} aria-label="Search">
                        <SearchIcon />
                    </Link>
                )}
            </div>

            <div className={styles.center}>
                {title && <h1 className={styles.title}>{title}</h1>}
            </div>

            <div className={styles.right}>
                {showVolumeControl && (
                    <button
                        className={styles.iconBtn}
                        onClick={onMuteToggle}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
                    </button>
                )}
            </div>
        </nav>
    );
}

// Icon Components
function SearchIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function BackIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function VolumeOnIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    );
}

function VolumeOffIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
    );
}
