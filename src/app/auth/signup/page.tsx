'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './auth.module.css';

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (data.user) {
                // Get onboarding selections from localStorage
                const focusAreas = JSON.parse(localStorage.getItem('onboarding_focuses') || '[]');
                const interests = JSON.parse(localStorage.getItem('onboarding_interests') || '[]');

                // Wait a moment for the session to be fully established and trigger to run
                await new Promise(resolve => setTimeout(resolve, 500));

                // Refresh the session to ensure auth.uid() is set
                await supabase.auth.getSession();

                // Update the profile with onboarding data (profile is auto-created by trigger)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        focus_areas: focusAreas,
                        interests: interests,
                    })
                    .eq('id', data.user.id);

                if (profileError) {
                    console.error('Profile update error:', profileError);
                    // Don't block signup if profile update fails - they can set preferences later
                }

                // Clear localStorage
                localStorage.removeItem('onboarding_focuses');
                localStorage.removeItem('onboarding_interests');

                // Redirect to feed
                router.push('/feed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Create your <span className="text-gradient">account</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Start your learning journey today
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            minLength={6}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            className={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitButton}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already have an account?{' '}
                    <Link href="/auth/login" className={styles.link}>
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
