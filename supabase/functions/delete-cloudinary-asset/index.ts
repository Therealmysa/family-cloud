
// Follow this setup guide to integrate the Deno runtime into your application:
// https://docs.cloudinary.com/documentation/cloudinary_references

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"
import { v2 as cloudinary } from "https://esm.sh/cloudinary@1.41.0";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: Deno.env.get("CLOUDINARY_CLOUD_NAME"),
  api_key: Deno.env.get("CLOUDINARY_API_KEY"),
  api_secret: Deno.env.get("CLOUDINARY_API_SECRET"),
});

// Helper function to extract Cloudinary public_id from URL
const extractCloudinaryPublicId = (url: string): string | null => {
  // Extract the public ID from the Cloudinary URL
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
  const matches = url.match(regex);
  return matches ? matches[1] : null;
};

serve(async (req) => {
  // Security checks first
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { headers: { 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  // Create Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { 
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    }
  );

  // Get user from request
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { headers: { 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  try {
    // Get request body
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract public ID from URL
    const publicId = extractCloudinaryPublicId(url);
    if (!publicId) {
      return new Response(
        JSON.stringify({ error: 'Could not extract public ID from URL' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return new Response(
        JSON.stringify({ error: 'Failed to delete from Cloudinary', details: result }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
