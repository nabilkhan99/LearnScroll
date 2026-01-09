'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';
import { FOCUS_AREAS, INTERESTS, Category } from '@/lib/content/types';

type OnboardingStep = 'welcome' | 'focus' | 'interests';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<Category[]>([]);

    const handleFocusToggle = useCallback((focusId: string) => {
        setSelectedFocuses(prev =>
            prev.includes(focusId)
                ? prev.filter(id => id !== focusId)
                : [...prev, focusId]
        );
    }, []);

    const handleInterestToggle = useCallback((interestId: Category) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    }, []);

    const handleContinue = useCallback(() => {
        if (step === 'welcome') {
            setStep('focus');
        } else if (step === 'focus') {
            setStep('interests');
        } else if (step === 'interests') {
            // Store selections in localStorage for now, will sync to Supabase on signup
            localStorage.setItem('onboarding_focuses', JSON.stringify(selectedFocuses));
            localStorage.setItem('onboarding_interests', JSON.stringify(selectedInterests));
            router.push('/auth/signup');
        }
    }, [step, selectedFocuses, selectedInterests, router]);

    const handleSkip = useCallback(() => {
        localStorage.setItem('onboarding_interests', JSON.stringify([]));
        router.push('/auth/signup');
    }, [router]);

    const canProceed = step === 'welcome'
        || (step === 'focus' && selectedFocuses.length >= 1)
        || (step === 'interests' && selectedInterests.length >= 3);

    return (
        <div className={styles.container}>
            {/* Progress Indicator */}
            {step !== 'welcome' && (
                <div className={styles.progress}>
                    <div className={styles.progressDots}>
                        <span className={`${styles.dot} ${step === 'focus' || step === 'interests' ? styles.active : ''}`} />
                        <span className={`${styles.dot} ${step === 'interests' ? styles.active : ''}`} />
                    </div>
                </div>
            )}

            {/* Welcome Step */}
            {step === 'welcome' && (
                <div className={`${styles.stepContent} animate-fade-in`}>
                    <div className={styles.welcomeGraphic}>
                        <div className={styles.logo}>📚</div>
                    </div>
                    <h1 className={styles.title}>
                        Welcome to <span className="text-gradient">LearnScroll</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Transform scrolling into learning. Bite-sized knowledge that fits your life.
                    </p>
                    <button
                        className={`btn btn-primary ${styles.ctaButton}`}
                        onClick={handleContinue}
                    >
                        Get Started
                        <span className={styles.arrow}>→</span>
                    </button>
                </div>
            )}

            {/* Focus Selection Step */}
            {step === 'focus' && (
                <div className={`${styles.stepContent} animate-slide-up`}>
                    <h1 className={styles.title}>
                        What's your main <span className="text-gradient">focus</span>?
                    </h1>
                    <p className={styles.subtitle}>
                        We'll curate your feed based on your targets. Pick as many as you like.
                    </p>

                    <div className={styles.focusGrid}>
                        {FOCUS_AREAS.map((focus) => (
                            <button
                                key={focus.id}
                                className={`${styles.focusCard} ${selectedFocuses.includes(focus.id) ? styles.selected : ''}`}
                                onClick={() => handleFocusToggle(focus.id)}
                            >
                                <span className={styles.focusIcon}>{focus.icon}</span>
                                <span className={styles.focusLabel}>{focus.label}</span>
                                {selectedFocuses.includes(focus.id) && (
                                    <span className={styles.checkmark}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        className={`btn btn-primary ${styles.ctaButton}`}
                        onClick={handleContinue}
                        disabled={!canProceed}
                    >
                        Continue
                        <span className={styles.arrow}>→</span>
                    </button>
                </div>
            )}

            {/* Interest Selection Step */}
            {step === 'interests' && (
                <div className={`${styles.stepContent} animate-slide-up`}>
                    <h1 className={styles.title}>
                        What sparks your <span className="text-gradient">curiosity</span>?
                    </h1>
                    <p className={styles.subtitle}>
                        Select at least 3 topics to curate your personal infinite feed.
                    </p>

                    <div className={styles.interestGrid}>
                        {INTERESTS.map((interest) => (
                            <button
                                key={interest.id}
                                className={`pill ${selectedInterests.includes(interest.id) ? 'selected' : ''} ${styles.interestPill}`}
                                onClick={() => handleInterestToggle(interest.id)}
                            >
                                <span>{interest.icon}</span>
                                <span>{interest.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.bottomActions}>
                        <button
                            className={`btn btn-primary ${styles.ctaButton}`}
                            onClick={handleContinue}
                            disabled={!canProceed}
                        >
                            Start Learning
                            <span className={styles.arrow}>→</span>
                        </button>
                        <button
                            className={styles.skipButton}
                            onClick={handleSkip}
                        >
                            I'll choose later
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
