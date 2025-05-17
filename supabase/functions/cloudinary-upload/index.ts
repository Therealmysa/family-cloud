
// Secure Cloudinary upload function with proper validation and error handling

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

// Validate file type
const validateFileType = (fileType: string, resourceType: string): boolean => {
  if (resourceType === 'profile' || resourceType === 'family') {
    return /^image\/(jpeg|png|jpg|webp)$/.test(fileType);
  } else if (resourceType === 'media') {
    return /^(image\/(jpeg|png|jpg|webp)|video\/(mp4|webm|ogg))$/.test(fileType);
  }
  return false;
};

// Validate file size - 100MB max
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const validateFileSize = (fileSize: number): boolean => {
  return fileSize <= MAX_FILE_SIZE;
};

// Helper function for Blob handling
async function streamToArrayBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Concatenate chunks
  let totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
  let result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result.buffer;
}

serve(async (req) => {
  console.log("Cloudinary upload function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  // Security checks
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.log("Missing Authorization header");
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
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.log("Authentication error:", userError);
    return new Response(
      JSON.stringify({ error: 'Not authorized', details: userError?.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  try {
    // Parse the form data
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      console.log("Invalid content type:", contentType);
      return new Response(
        JSON.stringify({ error: 'Content type must be multipart/form-data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    try {
      console.log("Parsing form data");
      const formData = await req.formData();
      
      // Extract data from form
      const file = formData.get('file') as File;
      const resourceType = formData.get('resourceType') as string;
      const folder = formData.get('folder') as string;
      
      console.log("Form data parsed:", { 
        fileExists: !!file, 
        fileType: file?.type, 
        fileSize: file?.size,
        resourceType, 
        folder 
      });
      
      // Validate inputs
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'File is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      if (!resourceType || !['profile', 'family', 'media'].includes(resourceType)) {
        return new Response(
          JSON.stringify({ error: 'Valid resourceType is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate file type
      if (!validateFileType(file.type, resourceType)) {
        console.log("Invalid file type:", file.type);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid file type',
            details: `File type ${file.type} is not allowed for resource type ${resourceType}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate file size
      if (!validateFileSize(file.size)) {
        console.log("File too large:", file.size);
        return new Response(
          JSON.stringify({ 
            error: 'File too large',
            details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check permission based on resource type
      if (resourceType === 'family') {
        // Check if user is a family admin
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("family_id, is_admin")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.log("Error fetching profile:", profileError);
        }

        if (profileError || !profile || !profile.is_admin) {
          return new Response(
            JSON.stringify({ error: 'Not authorized to upload family assets' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
      } else if (resourceType === 'media') {
        // Check if user has a family
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("family_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.log("Error fetching profile:", profileError);
        }

        if (profileError || !profile || !profile.family_id) {
          return new Response(
            JSON.stringify({ error: 'Must be in a family to upload media' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }
      }

      console.log("Reading file content");
      
      try {
        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload to Cloudinary
        const uploadOptions = {
          folder,
          resource_type: file.type.startsWith('video/') ? 'video' : 'image',
        };

        console.log("Converting file to base64");
        
        try {
          // Convert Uint8Array to base64 string
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataURI = `data:${file.type};base64,${base64}`;
          
          console.log("Uploading to Cloudinary");
          
          try {
            const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

            if (!result || !result.secure_url) {
              throw new Error('Failed to upload to Cloudinary');
            }

            console.log("Upload successful:", result.secure_url);
            
            // Return success with the secure URL
            return new Response(
              JSON.stringify({ 
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (cloudinaryError: any) {
            console.error("Cloudinary upload error:", cloudinaryError);
            return new Response(
              JSON.stringify({ 
                error: 'Cloudinary upload failed',
                details: cloudinaryError.message || 'Unknown error during upload'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
        } catch (base64Error: any) {
          console.error("Base64 conversion error:", base64Error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to process image',
              details: base64Error.message
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      } catch (fileReadError: any) {
        console.error("File reading error:", fileReadError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to read file',
            details: fileReadError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } catch (formError: any) {
      console.error('Form data parsing error:', formError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse form data',
          details: formError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
