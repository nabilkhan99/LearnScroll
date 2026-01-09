# Video Content Management Guide

This guide explains how to add video content to LearnScroll using Supabase Storage.

## Overview

Video content is stored in Supabase Storage and served via their global CDN (285+ cities). Each video has:
- **Video file** (MP4 or WebM)
- **Thumbnail image** (JPEG/PNG)
- **Captions** (VTT format, optional)
- **Metadata** in the database

## Storage Structure

```
content/                    (Supabase Storage Bucket)
├── videos/
│   ├── {uuid}.mp4
│   └── {uuid}.webm
├── thumbnails/
│   └── {uuid}.jpg
└── captions/
    └── {uuid}.vtt
```

## Video Specifications

### Recommended Settings (Cost-Optimized)
- **Resolution:** 480p (854x480) or 720p (1280x720)
- **Format:** MP4 (H.264) or WebM (VP9)
- **Duration:** 30-60 seconds
- **Bitrate:** 1-2 Mbps
- **File size:** ~25-50 MB per video
- **Aspect ratio:** 9:16 (vertical) or 16:9

### Why These Settings?
- **480p:** Reduces file size by ~50% vs 720p, still looks great on mobile
- **30-60 seconds:** Keeps engagement high and file sizes manageable
- **WebM format:** ~30% smaller than MP4 with same quality
- **Result:** ~$163/month for 1,000 DAU instead of $655/month

## Upload Methods

### Method 1: Interactive Script (Recommended)

```bash
npx tsx scripts/upload-video.ts
```

Follow the prompts to enter:
- Video file path
- Title
- Description
- Category
- Difficulty level
- Duration
- Thumbnail path (optional)
- Captions path (optional)
- Author name

### Method 2: Direct Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Storage → `content` bucket
2. Upload files manually to appropriate folders
3. Get public URLs
4. Insert record in `content` table:

```sql
INSERT INTO content (id, type, title, category, difficulty, estimated_time_seconds, author, metadata)
VALUES (
    gen_random_uuid(),
    'video',
    'Your Video Title',
    'science',
    'beginner',
    45,
    'LearnScroll',
    jsonb_build_object(
        'video_url', 'https://your-project.supabase.co/storage/v1/object/public/content/videos/abc.mp4',
        'thumbnail_url', 'https://your-project.supabase.co/storage/v1/object/public/content/thumbnails/abc.jpg',
        'duration_seconds', 45,
        'captions_url', 'https://your-project.supabase.co/storage/v1/object/public/content/captions/abc.vtt'
    )
);
```

## Video Preparation

### Converting Videos to Optimal Format

Using **ffmpeg** (install via `brew install ffmpeg`):

```bash
# Convert to 480p MP4 (recommended)
ffmpeg -i input.mp4 -vf "scale=854:480" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Convert to WebM (even smaller)
ffmpeg -i input.mp4 -vf "scale=854:480" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm

# Extract thumbnail at 1 second
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -vf "scale=720:-1" thumbnail.jpg
```

### Creating Captions (VTT Format)

Create a `.vtt` file:

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to this quick lesson on quantum physics.

00:00:03.000 --> 00:00:07.000
Today we'll explore the concept of superposition.

00:00:07.000 --> 00:00:12.000
This is when particles exist in multiple states simultaneously.
```

## Categories

Valid categories:
- `stem`
- `science`
- `technology`
- `news`
- `history`
- `philosophy`
- `psychology`
- `art`
- `economics`
- `coding`
- `space`
- `literature`

## Difficulty Levels

- `beginner` - Introductory content, no prior knowledge required
- `intermediate` - Some familiarity with the topic helpful
- `advanced` - In-depth content for experienced learners

## Cost Optimization Tips

1. **Use 480p instead of 720p** → 50% file size reduction
2. **Keep videos 30-45 seconds** → Smaller files, better engagement
3. **Use WebM format** → 30% smaller than MP4
4. **Set long cache headers** → CDN caching reduces egress costs
5. **Compress thumbnails** → Use JPEG at 80% quality

**Example savings:**
- 720p MP4 60s: ~50 MB → $655/month for 1,000 DAU
- 480p WebM 30s: ~15 MB → $163/month for 1,000 DAU

## Testing Your Upload

After uploading, verify:

1. **Storage:** Check Supabase Dashboard → Storage → `content` bucket
2. **Database:** Query the content table:
   ```sql
   SELECT * FROM content WHERE type = 'video' ORDER BY created_at DESC LIMIT 5;
   ```
3. **Frontend:** Visit `http://localhost:3000/feed` and scroll to your video
4. **CDN:** Check browser DevTools → Network tab for `cache-control` headers

## Troubleshooting

### Video won't upload
- Check file size (max 50 MB per file)
- Verify MIME type is `video/mp4` or `video/webm`
- Ensure Supabase credentials are set in `.env.local`

### Video uploaded but not showing in feed
- Check database record was created: `SELECT * FROM content WHERE type = 'video'`
- Verify `metadata.video_url` is a valid public URL
- Clear browser cache and refresh

### Video plays but no thumbnail
- Ensure thumbnail was uploaded to `thumbnails/` folder
- Check `metadata.thumbnail_url` in database
- Verify thumbnail is a valid image (JPEG/PNG)

### Auto-play not working
- Browser may block auto-play with sound
- Videos are muted by default (user can unmute)
- Check browser console for errors

## Example: Complete Upload Flow

```bash
# 1. Prepare your video
ffmpeg -i raw-video.mov -vf "scale=854:480" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k optimized.mp4

# 2. Generate thumbnail
ffmpeg -i optimized.mp4 -ss 00:00:01 -vframes 1 -vf "scale=720:-1" thumb.jpg

# 3. Run upload script
npx tsx scripts/upload-video.ts

# Enter details when prompted:
# Video: ./optimized.mp4
# Title: The Fibonacci Sequence in Nature
# Description: Discover how this mathematical pattern appears everywhere
# Category: stem
# Difficulty: beginner
# Duration: 45
# Thumbnail: ./thumb.jpg
# Captions: (leave empty if none)
# Author: LearnScroll

# 4. Verify in browser
# Visit http://localhost:3000/feed
```

## Next Steps

- Consider building an admin UI for easier uploads
- Set up automated video processing pipeline
- Implement video analytics (views, completion rate)
- Add video quality selection (480p/720p toggle)

## Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [WebVTT Captions Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API)
