#!/usr/bin/env node

/**
 * Video Upload Utility for LearnScroll
 * 
 * This script uploads curated video content to Supabase Storage and creates
 * corresponding content records in the database.
 * 
 * Usage:
 *   node scripts/upload-video.js --video path/to/video.mp4 --title "Video Title" --category stem
 * 
 * Required arguments:
 *   --video: Path to video file (mp4 or webm)
 *   --title: Video title
 *   --category: Content category (stem, science, technology, etc.)
 * 
 * Optional arguments:
 *   --description: Video description
 *   --thumbnail: Path to thumbnail image (auto-generated if not provided)
 *   --captions: Path to VTT captions file
 *   --difficulty: beginner|intermediate|advanced (default: beginner)
 *   --author: Author name (default: LearnScroll)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {};

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        parsed[key] = value;
    }

    return parsed;
}

// Validate required arguments
function validateArgs(args) {
    const required = ['video', 'title', 'category'];
    const missing = required.filter(key => !args[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required arguments: ${missing.join(', ')}`);
        console.log('\nUsage:');
        console.log('  node scripts/upload-video.js --video path/to/video.mp4 --title "Video Title" --category stem');
        process.exit(1);
    }

    // Validate video file exists
    if (!fs.existsSync(args.video)) {
        console.error(`❌ Video file not found: ${args.video}`);
        process.exit(1);
    }

    // Validate category
    const validCategories = ['stem', 'news', 'history', 'technology', 'science', 'philosophy', 'psychology', 'art', 'economics', 'coding', 'space', 'literature'];
    if (!validCategories.includes(args.category)) {
        console.error(`❌ Invalid category. Must be one of: ${validCategories.join(', ')}`);
        process.exit(1);
    }
}

// Get video duration using ffprobe (requires ffmpeg installed)
async function getVideoDuration(videoPath) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);

    try {
        const { stdout } = await execPromise(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
        );
        return Math.round(parseFloat(stdout.trim()));
    } catch (error) {
        console.warn('⚠️  Could not determine video duration (ffprobe not found). Using estimated duration.');
        // Estimate based on file size (rough approximation)
        const stats = fs.statSync(videoPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        return Math.round(fileSizeMB * 2); // Rough estimate: 2 seconds per MB
    }
}

// Generate thumbnail from video (requires ffmpeg installed)
async function generateThumbnail(videoPath, outputPath) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execPromise = promisify(exec);

    try {
        await execPromise(
            `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=720:-1" "${outputPath}"`
        );
        return true;
    } catch (error) {
        console.warn('⚠️  Could not generate thumbnail (ffmpeg not found). Please provide a thumbnail manually.');
        return false;
    }
}

async function main() {
    const args = parseArgs();
    validateArgs(args);

    console.log('🚀 LearnScroll Video Upload Utility\n');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique ID for this content
    const contentId = crypto.randomUUID();

    console.log(`📦 Content ID: ${contentId}`);
    console.log(`📹 Video: ${args.video}`);
    console.log(`📝 Title: ${args.title}`);
    console.log(`🏷️  Category: ${args.category}\n`);

    // Get video duration
    console.log('⏱️  Analyzing video...');
    const duration = await getVideoDuration(args.video);
    console.log(`   Duration: ${duration} seconds`);

    // Handle thumbnail
    let thumbnailPath = args.thumbnail;
    if (!thumbnailPath) {
        console.log('🖼️  Generating thumbnail...');
        thumbnailPath = path.join(__dirname, `temp-thumbnail-${contentId}.jpg`);
        const generated = await generateThumbnail(args.video, thumbnailPath);
        if (!generated) {
            thumbnailPath = null;
        }
    }

    // Upload video
    console.log('\n📤 Uploading video to Supabase Storage...');
    const videoFile = fs.readFileSync(args.video);
    const videoExt = path.extname(args.video);
    const videoPath = `videos/${contentId}${videoExt}`;

    const { data: videoData, error: videoError } = await supabase.storage
        .from('content')
        .upload(videoPath, videoFile, {
            contentType: videoExt === '.webm' ? 'video/webm' : 'video/mp4',
            cacheControl: '31536000', // 1 year
            upsert: false
        });

    if (videoError) {
        console.error('❌ Video upload failed:', videoError.message);
        process.exit(1);
    }

    console.log('✅ Video uploaded successfully');

    // Get public URL for video
    const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(videoPath);

    console.log(`   URL: ${videoUrl}`);

    // Upload thumbnail
    let thumbnailUrl = null;
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
        console.log('\n📤 Uploading thumbnail...');
        const thumbnailFile = fs.readFileSync(thumbnailPath);
        const thumbnailStoragePath = `thumbnails/${contentId}.jpg`;

        const { error: thumbError } = await supabase.storage
            .from('content')
            .upload(thumbnailStoragePath, thumbnailFile, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: false
            });

        if (thumbError) {
            console.warn('⚠️  Thumbnail upload failed:', thumbError.message);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('content')
                .getPublicUrl(thumbnailStoragePath);
            thumbnailUrl = publicUrl;
            console.log('✅ Thumbnail uploaded successfully');

            // Clean up temp thumbnail
            if (!args.thumbnail && fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }
    }

    // Upload captions if provided
    let captionsUrl = null;
    if (args.captions && fs.existsSync(args.captions)) {
        console.log('\n📤 Uploading captions...');
        const captionsFile = fs.readFileSync(args.captions);
        const captionsPath = `captions/${contentId}.vtt`;

        const { error: captionsError } = await supabase.storage
            .from('content')
            .upload(captionsPath, captionsFile, {
                contentType: 'text/vtt',
                cacheControl: '31536000',
                upsert: false
            });

        if (captionsError) {
            console.warn('⚠️  Captions upload failed:', captionsError.message);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('content')
                .getPublicUrl(captionsPath);
            captionsUrl = publicUrl;
            console.log('✅ Captions uploaded successfully');
        }
    }

    // Create content record in database
    console.log('\n💾 Creating content record in database...');

    const contentRecord = {
        id: contentId,
        type: 'video',
        title: args.title,
        description: args.description || null,
        category: args.category,
        difficulty: args.difficulty || 'beginner',
        estimated_time_seconds: duration,
        author: args.author || 'LearnScroll',
        metadata: {
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            duration_seconds: duration,
            captions_url: captionsUrl
        }
    };

    const { error: dbError } = await supabase
        .from('content')
        .insert(contentRecord);

    if (dbError) {
        console.error('❌ Database insert failed:', dbError.message);
        console.log('\n⚠️  Video files were uploaded but database record creation failed.');
        console.log('   You may need to manually create the record or clean up the uploaded files.');
        process.exit(1);
    }

    console.log('✅ Content record created successfully');
    console.log('\n🎉 Upload complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Content ID: ${contentId}`);
    console.log(`   Video URL: ${videoUrl}`);
    if (thumbnailUrl) console.log(`   Thumbnail URL: ${thumbnailUrl}`);
    if (captionsUrl) console.log(`   Captions URL: ${captionsUrl}`);
    console.log(`\n✨ Your video is now live in the feed!`);
}

main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
