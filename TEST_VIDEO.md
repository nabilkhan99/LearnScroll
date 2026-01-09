# Test Video Content

This is a sample video content record for testing the video playback functionality.

Since we don't have actual video files uploaded yet, this uses a publicly available test video.

## Sample Video URLs

For testing purposes, you can use these free sample videos:

1. **Big Buck Bunny** (Blender Foundation)
   - Video: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   - Duration: 596 seconds (full version)
   - License: Creative Commons

2. **Sintel Trailer** (Blender Foundation)
   - Video: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4
   - Duration: 888 seconds
   - License: Creative Commons

## Insert Test Video

Run this SQL to add a test video to your feed:

```sql
INSERT INTO content (
    id,
    type,
    title,
    description,
    category,
    difficulty,
    estimated_time_seconds,
    author,
    metadata
) VALUES (
    gen_random_uuid(),
    'video',
    'Introduction to Quantum Computing',
    'A brief introduction to the fascinating world of quantum computing and how it differs from classical computing.',
    'technology',
    'beginner',
    45,
    'LearnScroll',
    jsonb_build_object(
        'video_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'thumbnail_url', 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        'duration_seconds', 45
    )
);
```

Note: The actual video is longer, but we're setting estimated_time_seconds to 45 for testing purposes.
