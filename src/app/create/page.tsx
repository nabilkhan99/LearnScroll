'use client';

import { useRouter } from 'next/navigation';
import TopNav from '@/components/navigation/TopNav';
import BottomNav from '@/components/navigation/BottomNav';
import styles from './create.module.css';

export default function CreatePage() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <TopNav
                showTabs={false}
                title="Create"
                showVolumeControl={false}
                showBack
                onBack={() => router.back()}
            />

            <main className={styles.main}>
                <div className={styles.comingSoon}>
                    <div className={styles.icon}>✨</div>
                    <h1 className={styles.title}>Creator Tools Coming Soon</h1>
                    <p className={styles.description}>
                        Soon you'll be able to create and share your own educational content with the LearnScroll community.
                    </p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>📝</span>
                            <span className={styles.featureText}>Write text lessons</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🎬</span>
                            <span className={styles.featureText}>Upload short videos</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🎙️</span>
                            <span className={styles.featureText}>Record audio insights</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>📊</span>
                            <span className={styles.featureText}>Create interactive simulations</span>
                        </div>
                    </div>

                    <button
                        className={styles.notifyBtn}
                        onClick={() => alert('You\'ll be notified when creator tools launch!')}
                    >
                        Notify Me When Available
                    </button>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
