import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { videoPath } = await req.json()

    if (!videoPath) {
      return new Response('Video path is required', { status: 400, headers: corsHeaders })
    }

    console.log('Processing video for thumbnail:', videoPath)

    // Get the video file from storage
    const { data: videoFile, error: videoError } = await supabaseClient
      .storage
      .from('videos')
      .download(videoPath)

    if (videoError || !videoFile) {
      console.error('Error downloading video:', videoError)
      return new Response('Error accessing video file', { status: 400, headers: corsHeaders })
    }

    // Convert blob to array buffer for processing
    const videoBuffer = await videoFile.arrayBuffer()
    
    // For now, we'll use a placeholder approach since video processing requires FFmpeg
    // In a production environment, you'd want to use a service like Replicate or CloudFlare Images
    
    // Generate a simple placeholder thumbnail (you can replace this with actual video processing)
    const thumbnailBuffer = await generatePlaceholderThumbnail()
    
    // Upload thumbnail to storage
    const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '') + '_thumbnail.jpg'
    
    const { error: uploadError } = await supabaseClient
      .storage
      .from('thumbnails')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading thumbnail:', uploadError)
      return new Response('Error uploading thumbnail', { status: 500, headers: corsHeaders })
    }

    // Get the public URL for the thumbnail
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('thumbnails')
      .getPublicUrl(thumbnailPath)

    console.log('Thumbnail generated successfully:', publicUrl)

    return new Response(
      JSON.stringify({ thumbnailUrl: publicUrl, thumbnailPath }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in thumbnail generation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Generates a simple placeholder thumbnail
// In production, replace this with actual video frame extraction
async function generatePlaceholderThumbnail(): Promise<Uint8Array> {
  // This is a minimal JPEG placeholder - replace with actual video processing
  const canvas = new OffscreenCanvas(800, 600)
  const ctx = canvas.getContext('2d')!
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, '#1a1a1a')
  gradient.addColorStop(1, '#4a4a4a')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)
  
  // Add play button
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(350, 250)
  ctx.lineTo(350, 350)
  ctx.lineTo(450, 300)
  ctx.closePath()
  ctx.fill()
  
  // Convert to blob and return as Uint8Array
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 })
  return new Uint8Array(await blob.arrayBuffer())
}