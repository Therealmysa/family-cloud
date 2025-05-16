
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
    // Parse the request body
    const body = await req.formData();
    
    // Get the file from the request
    const file = body.get('file');
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get the resource type from the request
    const resourceType = body.get('resourceType');
    if (!resourceType || typeof resourceType !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Resource type is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate resource type
    if (!['profile', 'family', 'media'].includes(resourceType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid resource type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Security validation for file size
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return new Response(
        JSON.stringify({ error: 'File size should be less than 50MB' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Security validation for file type
    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validTypes = [...validImageTypes, ...validVideoTypes];
    
    if (!validTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Additional security checks based on resource type
    if (resourceType === 'profile') {
      // For profile, only images are allowed
      if (!validImageTypes.includes(fileType)) {
        return new Response(
          JSON.stringify({ error: 'Only image files are allowed for profile avatars' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Check file size specifically for profile (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'Profile image size should be less than 5MB' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    } else if (resourceType === 'family') {
      // For family, only images are allowed
      if (!validImageTypes.includes(fileType)) {
        return new Response(
          JSON.stringify({ error: 'Only image files are allowed for family avatars' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Check file size specifically for family (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'Family image size should be less than 5MB' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Check if user has admin rights for this family
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
        
      if (profileError || !profile.is_admin) {
        return new Response(
          JSON.stringify({ error: 'Only family admins can change family avatar' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    // Get the folder from the request or set a default
    let folder = body.get('folder') || '';
    if (typeof folder !== 'string') folder = '';
    
    // Make sure folder paths are sanitized and appropriate for the resource type
    if (resourceType === 'profile') {
      folder = `profiles/${user.id}`;
    } else if (resourceType === 'family') {
      folder = 'family-avatars';
    } else if (resourceType === 'media') {
      // Get user's family_id
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();
        
      if (profileError || !profile.family_id) {
        return new Response(
          JSON.stringify({ error: 'User is not part of a family' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      folder = `families/${profile.family_id}`;
    }

    // Read file data as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert Uint8Array to base64 string
    const base64Data = btoa(String.fromCharCode(...uint8Array));
    const dataURI = `data:${file.type};base64,${base64Data}`;
    
    // Upload to Cloudinary with secure configuration
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: fileType.startsWith('image/') ? ['jpg', 'png', 'webp'] : ['mp4', 'webm', 'ogg'],
      overwrite: true,
      unique_filename: true,
      invalidate: true, // Invalidates CDN cached copies if the same file name is uploaded
      discard_original_filename: true, // Use Cloudinary generated names for security
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in cloudinary upload:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error uploading file to Cloudinary' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
