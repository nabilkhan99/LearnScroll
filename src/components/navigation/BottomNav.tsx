'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomNav.module.css';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    label: string;
    isCenter?: boolean;
}

const navItems: NavItem[] = [
    {
        href: '/feed',
        icon: <HomeIcon />,
        activeIcon: <HomeIconFilled />,
        label: 'Home',
    },
    {
        href: '/discover',
        icon: <DiscoverIcon />,
        activeIcon: <DiscoverIconFilled />,
        label: 'Discover',
    },
    {
        href: '/create',
        icon: <PlusIcon />,
        activeIcon: <PlusIcon />,
        label: 'Create',
        isCenter: true,
    },
    {
        href: '/library',
        icon: <LibraryIcon />,
        activeIcon: <LibraryIconFilled />,
        label: 'Library',
    },
    {
        href: '/profile',
        icon: <ProfileIcon />,
        activeIcon: <ProfileIconFilled />,
        label: 'Profile',
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav} aria-label="Main navigation">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.isCenter ? styles.center : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className={styles.icon}>
                            {isActive ? item.activeIcon : item.icon}
                        </span>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

// Icon Components
function HomeIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function HomeIconFilled() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.71 2.29a1 1 0 00-1.42 0l-9 9a1 1 0 001.42 1.42L4 12.41V20a2 2 0 002 2h4a1 1 0 001-1v-5h2v5a1 1 0 001 1h4a2 2 0 002-2v-7.59l.29.3a1 1 0 001.42-1.42z" />
        </svg>
    );
}

function DiscoverIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}

function DiscoverIconFilled() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.21 13.21l-5.47 2.26c-.53.22-1.11-.19-1.03-.76l.8-5.78a.75.75 0 01.56-.56l5.78-.8c.57-.08.98.5.76 1.03l-2.26 5.47a.75.75 0 01-.14.14z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function LibraryIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function LibraryIconFilled() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
    );
}

function ProfileIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function ProfileIconFilled() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    );
}
