'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import TopNav from '@/components/navigation/TopNav';
import BottomNav from '@/components/navigation/BottomNav';
import { INTERESTS, Category } from '@/lib/content/types';
import styles from './profile.module.css';

interface ProfileClientProps {
    user: {
        id: string;
        email: string;
        displayName: string;
        avatarUrl: string | null;
        interests: Category[];
        focusAreas: string[];
    };
    stats: {
        xp: number;
        level: number;
        xpToNextLevel: number;
        streak: number;
        likes: number;
        bookmarks: number;
        lessonsCompleted: number;
    };
}

export default function ProfileClient({ user, stats }: ProfileClientProps) {
    const router = useRouter();
    const [showSettings, setShowSettings] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/onboarding');
        router.refresh();
    };

    const getLevelTitle = (level: number) => {
        if (level < 3) return 'Beginner';
        if (level < 6) return 'Explorer';
        if (level < 11) return 'Enthusiast';
        if (level < 21) return 'Scholar';
        return 'Master';
    };

    const xpProgress = ((100 - stats.xpToNextLevel) / 100) * 100;

    return (
        <div className={styles.container}>
            <TopNav
                showTabs={false}
                title="Profile"
                showVolumeControl={false}
            />

            <main className={styles.main}>
                {/* Profile Header */}
                <div className={styles.header}>
                    <div className={styles.avatarWrapper}>
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.displayName}
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {user.displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={styles.levelBadge}>
                            <span>{stats.level}</span>
                        </div>
                    </div>

                    <h1 className={styles.displayName}>{user.displayName}</h1>
                    <p className={styles.levelTitle}>{getLevelTitle(stats.level)}</p>

                    {/* XP Progress */}
                    <div className={styles.xpSection}>
                        <div className={styles.xpHeader}>
                            <span className={styles.xpLabel}>Level {stats.level}</span>
                            <span className={styles.xpValue}>{stats.xp} XP</span>
                        </div>
                        <div className={styles.xpBar}>
                            <div
                                className={styles.xpFill}
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                        <p className={styles.xpHint}>{stats.xpToNextLevel} XP to Level {stats.level + 1}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>🔥</span>
                        <span className={styles.statValue}>{stats.streak}</span>
                        <span className={styles.statLabel}>Day Streak</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📚</span>
                        <span className={styles.statValue}>{stats.lessonsCompleted}</span>
                        <span className={styles.statLabel}>Lessons</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>❤️</span>
                        <span className={styles.statValue}>{stats.likes}</span>
                        <span className={styles.statLabel}>Likes</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>🔖</span>
                        <span className={styles.statValue}>{stats.bookmarks}</span>
                        <span className={styles.statLabel}>Saved</span>
                    </div>
                </div>

                {/* Interests Section */}
                {user.interests.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Your Interests</h2>
                        <div className={styles.interestTags}>
                            {user.interests.map((interestId) => {
                                const interest = INTERESTS.find(i => i.id === interestId);
                                return interest ? (
                                    <span key={interestId} className={styles.interestTag}>
                                        {interest.icon} {interest.label}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Settings</h2>
                    <div className={styles.settingsList}>
                        <button className={styles.settingsItem}>
                            <span className={styles.settingsIcon}>👤</span>
                            <span className={styles.settingsLabel}>Edit Profile</span>
                            <span className={styles.settingsArrow}>›</span>
                        </button>
                        <button className={styles.settingsItem}>
                            <span className={styles.settingsIcon}>🔔</span>
                            <span className={styles.settingsLabel}>Notifications</span>
                            <span className={styles.settingsArrow}>›</span>
                        </button>
                        <button className={styles.settingsItem}>
                            <span className={styles.settingsIcon}>🎯</span>
                            <span className={styles.settingsLabel}>Learning Goals</span>
                            <span className={styles.settingsArrow}>›</span>
                        </button>
                        <button className={styles.settingsItem}>
                            <span className={styles.settingsIcon}>🔒</span>
                            <span className={styles.settingsLabel}>Privacy</span>
                            <span className={styles.settingsArrow}>›</span>
                        </button>
                        <button className={styles.settingsItem}>
                            <span className={styles.settingsIcon}>❓</span>
                            <span className={styles.settingsLabel}>Help & Support</span>
                            <span className={styles.settingsArrow}>›</span>
                        </button>
                    </div>
                </div>

                {/* Sign Out */}
                <button className={styles.signOutBtn} onClick={handleSignOut}>
                    Sign Out
                </button>

                <p className={styles.version}>LearnScroll v1.0</p>
            </main>

            <BottomNav />
        </div>
    );
}
