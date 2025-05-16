
// Follow this setup guide to integrate the Deno runtime into your application:
// https://docs.cloudinary.com/documentation/cloudinary_references

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"
import { v2 as cloudinary } from "https://esm.sh/cloudinary@1.41.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Cloudinary
cloudinary.config({
  cloud_name: Deno.env.get("CLOUDINARY_CLOUD_NAME"),
  api_key: Deno.env.get("CLOUDINARY_API_KEY"),
  api_secret: Deno.env.get("CLOUDINARY_API_SECRET"),
});

// Helper function to extract Cloudinary public_id from URL
const extractCloudinaryPublicId = (url: string): string | null => {
  if (!url) return null;
  
  // Extract the public ID from the Cloudinary URL
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
  const matches = url.match(regex);
  return matches ? matches[1] : null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  // Security checks first
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  try {
    // Get request body
    const { url, resourceType } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract public ID from URL
    const publicId = extractCloudinaryPublicId(url);
    if (!publicId) {
      return new Response(
        JSON.stringify({ error: 'Could not extract public ID from URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Add security verification for resourceType
    // Verify if the user has permission to delete this resource
    if (resourceType === 'profile') {
      // For profile avatars, check if the URL belongs to the user
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError || profile.avatar_url !== url) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to delete this resource' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    } else if (resourceType === 'family') {
      // For family avatars, check if user is an admin of the family
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("family_id, is_admin")
        .eq("id", user.id)
        .single();

      if (profileError || !profile.is_admin) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to delete this resource' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      // Check if the URL belongs to this family
      const { data: family, error: familyError } = await supabaseClient
        .from("families")
        .select("avatar_url")
        .eq("id", profile.family_id)
        .single();

      if (familyError || family.avatar_url !== url) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to delete this resource' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    } else if (resourceType === 'media') {
      // For media, check if the user owns the media or is a family admin
      const { data: media, error: mediaError } = await supabaseClient
        .from("media")
        .select("user_id, family_id, url")
        .or(`url.eq.${url},thumbnail_url.eq.${url}`)
        .single();

      if (mediaError || (!media)) {
        return new Response(
          JSON.stringify({ error: 'Media not found or not authorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      // Check if user is owner or admin
      if (media.user_id !== user.id) {
        // Check if user is family admin
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .eq("family_id", media.family_id)
          .single();

        if (profileError || !profile.is_admin) {
          return new Response(
            JSON.stringify({ error: 'Not authorized to delete this media' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
      }
    } else {
      // Unknown resource type
      return new Response(
        JSON.stringify({ error: 'Invalid resource type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return new Response(
        JSON.stringify({ error: 'Failed to delete from Cloudinary', details: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
