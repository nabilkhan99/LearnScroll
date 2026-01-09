/**
 * Simple Video Upload Utility for LearnScroll
 * 
 * This script uploads curated video content to Supabase Storage and creates
 * corresponding content records in the database.
 * 
 * Usage:
 *   npx tsx scripts/upload-video.ts
 * 
 * Then follow the interactive prompts.
 * 
 * Prerequisites:
 *   npm install -D tsx
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('🚀 LearnScroll Video Upload Utility\n');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials.');
        console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Interactive prompts
    const videoPath = await question('📹 Video file path: ');

    if (!fs.existsSync(videoPath)) {
        console.error(`❌ Video file not found: ${videoPath}`);
        process.exit(1);
    }

    const title = await question('📝 Title: ');
    const description = await question('📄 Description (optional): ');
    const category = await question('🏷️  Category (stem/science/technology/etc.): ');
    const difficulty = await question('⭐ Difficulty (beginner/intermediate/advanced, default: beginner): ') || 'beginner';
    const durationStr = await question('⏱️  Duration in seconds: ');
    const duration = parseInt(durationStr) || 60;
    const thumbnailPath = await question('🖼️  Thumbnail path (optional): ');
    const captionsPath = await question('💬 Captions VTT file path (optional): ');
    const author = await question('✍️  Author (default: LearnScroll): ') || 'LearnScroll';

    rl.close();

    // Generate unique ID
    const contentId = crypto.randomUUID();

    console.log(`\n📦 Content ID: ${contentId}`);
    console.log('Starting upload...\n');

    // Upload video
    console.log('📤 Uploading video...');
    const videoFile = fs.readFileSync(videoPath);
    const videoExt = path.extname(videoPath);
    const videoStoragePath = `videos/${contentId}${videoExt}`;

    const { error: videoError } = await supabase.storage
        .from('content')
        .upload(videoStoragePath, videoFile, {
            contentType: videoExt === '.webm' ? 'video/webm' : 'video/mp4',
            cacheControl: '31536000',
            upsert: false
        });

    if (videoError) {
        console.error('❌ Video upload failed:', videoError.message);
        process.exit(1);
    }

    const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(videoStoragePath);

    console.log('✅ Video uploaded');

    // Upload thumbnail
    let thumbnailUrl: string | null = null;
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
        console.log('📤 Uploading thumbnail...');
        const thumbnailFile = fs.readFileSync(thumbnailPath);
        const thumbnailStoragePath = `thumbnails/${contentId}.jpg`;

        const { error: thumbError } = await supabase.storage
            .from('content')
            .upload(thumbnailStoragePath, thumbnailFile, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: false
            });

        if (!thumbError) {
            const { data: { publicUrl } } = supabase.storage
                .from('content')
                .getPublicUrl(thumbnailStoragePath);
            thumbnailUrl = publicUrl;
            console.log('✅ Thumbnail uploaded');
        }
    }

    // Upload captions
    let captionsUrl: string | null = null;
    if (captionsPath && fs.existsSync(captionsPath)) {
        console.log('📤 Uploading captions...');
        const captionsFile = fs.readFileSync(captionsPath);
        const captionsStoragePath = `captions/${contentId}.vtt`;

        const { error: captionsError } = await supabase.storage
            .from('content')
            .upload(captionsStoragePath, captionsFile, {
                contentType: 'text/vtt',
                cacheControl: '31536000',
                upsert: false
            });

        if (!captionsError) {
            const { data: { publicUrl } } = supabase.storage
                .from('content')
                .getPublicUrl(captionsStoragePath);
            captionsUrl = publicUrl;
            console.log('✅ Captions uploaded');
        }
    }

    // Create database record
    console.log('💾 Creating database record...');

    const { error: dbError } = await supabase
        .from('content')
        .insert({
            id: contentId,
            type: 'video',
            title,
            description: description || null,
            category,
            difficulty,
            estimated_time_seconds: duration,
            author,
            metadata: {
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                duration_seconds: duration,
                captions_url: captionsUrl
            }
        });

    if (dbError) {
        console.error('❌ Database insert failed:', dbError.message);
        process.exit(1);
    }

    console.log('✅ Database record created\n');
    console.log('🎉 Upload complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Content ID: ${contentId}`);
    console.log(`   Video URL: ${videoUrl}`);
    if (thumbnailUrl) console.log(`   Thumbnail: ${thumbnailUrl}`);
    if (captionsUrl) console.log(`   Captions: ${captionsUrl}`);
    console.log(`\n✨ Your video is now live in the feed!`);
}

main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
