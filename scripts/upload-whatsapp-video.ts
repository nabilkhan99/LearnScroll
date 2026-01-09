/**
 * Upload WhatsApp Video - Direct Approach
 * Uses Supabase client with proper authentication
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as crypto from 'crypto';

async function uploadVideo() {
    console.log('🚀 Uploading WhatsApp Video to LearnScroll\n');

    // Get credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials');
        console.error('Please ensure .env.local is loaded');
        process.exit(1);
    }

    // Create client with anon key (storage bucket is public)
    const supabase = createClient(supabaseUrl, supabaseKey);

    const videoPath = '/Users/nabilkhan/Desktop/EduTok/WhatsApp Video 2026-01-09 at 13.53.03.mp4';
    const contentId = crypto.randomUUID();

    console.log(`📦 Content ID: ${contentId}`);
    console.log(`📹 Uploading video...\n`);

    // Upload video to storage
    const videoFile = fs.readFileSync(videoPath);
    const videoStoragePath = `videos/${contentId}.mp4`;

    const { data: uploadData, error: videoError } = await supabase.storage
        .from('content')
        .upload(videoStoragePath, videoFile, {
            contentType: 'video/mp4',
            cacheControl: '31536000',
            upsert: false
        });

    if (videoError) {
        console.error('❌ Video upload failed:', videoError.message);
        console.error('Full error:', videoError);
        process.exit(1);
    }

    const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(videoStoragePath);

    console.log('✅ Video uploaded to storage');
    console.log(`   URL: ${videoUrl}\n`);

    console.log('📝 Video details to insert into database:');
    console.log(`   ID: ${contentId}`);
    console.log(`   Video URL: ${videoUrl}`);
    console.log('\nPlease run the following SQL in Supabase SQL Editor:');
    console.log('\n---SQL START---');
    console.log(`INSERT INTO content (id, type, title, description, category, difficulty, estimated_time_seconds, author, metadata)
VALUES (
    '${contentId}',
    'video',
    'Educational Short Video',
    'A curated educational video for the LearnScroll feed',
    'science',
    'beginner',
    30,
    'LearnScroll',
    jsonb_build_object(
        'video_url', '${videoUrl}',
        'thumbnail_url', null,
        'duration_seconds', 30,
        'captions_url', null
    )
);`);
    console.log('---SQL END---\n');
}

uploadVideo().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
