// Content type enum - extensible for future formats
export type ContentType = 'text' | 'video' | 'audio' | 'simulation';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type Category =
    | 'stem'
    | 'news'
    | 'history'
    | 'technology'
    | 'science'
    | 'philosophy'
    | 'psychology'
    | 'art'
    | 'economics'
    | 'coding'
    | 'space'
    | 'literature';

// Base content metadata interface
interface BaseContentMetadata {
    [key: string]: unknown;
}

// Text-specific metadata
export interface TextContentMetadata extends BaseContentMetadata {
    body: string;
    word_count: number;
    reading_time_seconds: number;
}

// Video-specific metadata (future)
export interface VideoContentMetadata extends BaseContentMetadata {
    video_url: string;
    thumbnail_url: string;
    duration_seconds: number;
    captions_url?: string;
}

// Audio-specific metadata (future)
export interface AudioContentMetadata extends BaseContentMetadata {
    audio_url: string;
    duration_seconds: number;
    transcript?: string;
    waveform_data?: number[];
}

// Main content interface
export interface Content {
    id: string;
    type: ContentType;
    title: string;
    description: string | null;
    category: Category;
    difficulty: DifficultyLevel;
    estimated_time_seconds: number | null;
    metadata: TextContentMetadata | VideoContentMetadata | AudioContentMetadata;
    view_count: number;
    like_count?: number;
    bookmark_count?: number;
    created_at: string;
    updated_at: string;
}

// User profile
export interface Profile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    focus_areas: string[];
    interests: Category[];
    created_at: string;
    updated_at: string;
}

// User likes
export interface Like {
    user_id: string;
    content_id: string;
    created_at: string;
}

// User bookmarks
export interface Bookmark {
    user_id: string;
    content_id: string;
    created_at: string;
}

// Focus area options
export const FOCUS_AREAS = [
    { id: 'build-habit', label: 'Build a Habit', icon: '🧘' },
    { id: 'learn-skill', label: 'Learn a Skill', icon: '🎯' },
    { id: 'stop-doom-scrolling', label: 'Stop Doom Scrolling', icon: '🛑' },
    { id: 'ace-exams', label: 'Ace My Exams', icon: '📚' },
    { id: 'daily-trivia', label: 'Daily Trivia', icon: '❓' },
    { id: 'career-growth', label: 'Career Growth', icon: '📈' },
] as const;

// Interest/category options
export const INTERESTS: { id: Category; label: string; icon: string }[] = [
    { id: 'stem', label: 'STEM', icon: '🔬' },
    { id: 'news', label: 'Global News', icon: '🌍' },
    { id: 'history', label: 'History', icon: '🏛️' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'science', label: 'Science', icon: '🧪' },
    { id: 'philosophy', label: 'Philosophy', icon: '🤔' },
    { id: 'psychology', label: 'Psychology', icon: '🧠' },
    { id: 'art', label: 'Art & Design', icon: '🎨' },
    { id: 'economics', label: 'Economics', icon: '📊' },
    { id: 'coding', label: 'Coding', icon: '👨‍💻' },
    { id: 'space', label: 'Space', icon: '🚀' },
    { id: 'literature', label: 'Literature', icon: '📖' },
];

// Category color mapping
export const CATEGORY_COLORS: Record<Category, string> = {
    stem: 'var(--color-stem)',
    news: 'var(--color-news)',
    history: 'var(--color-history)',
    technology: 'var(--color-technology)',
    science: 'var(--color-science)',
    philosophy: 'var(--color-philosophy)',
    psychology: 'var(--color-psychology)',
    art: 'var(--color-art)',
    economics: 'var(--color-economics)',
    coding: 'var(--color-coding)',
    space: 'var(--color-space)',
    literature: 'var(--color-literature)',
};

// Helper to get gradient for category
export function getCategoryGradient(category: Category): string {
    const color = CATEGORY_COLORS[category];
    return `linear-gradient(180deg, ${color}20 0%, var(--color-bg-primary) 100%)`;
}

// Type guard for text content
export function isTextContent(content: Content): content is Content & { metadata: TextContentMetadata } {
    return content.type === 'text';
}

// Type guard for video content (future)
export function isVideoContent(content: Content): content is Content & { metadata: VideoContentMetadata } {
    return content.type === 'video';
}

// Type guard for audio content (future)
export function isAudioContent(content: Content): content is Content & { metadata: AudioContentMetadata } {
    return content.type === 'audio';
}
