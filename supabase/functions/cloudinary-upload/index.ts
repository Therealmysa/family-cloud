
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "";
const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY") || "";
const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET") || "";

// 100MB in bytes
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/ogg",
];

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting cloudinary upload function");

    // Check authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check CloudinaryConfig
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.error("Missing Cloudinary configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse form data
    const formData = await req.formData().catch((error) => {
      console.error("Error parsing form data:", error);
      throw new Error("Error parsing form data");
    });

    // Get file and validate
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      console.error("No file provided or invalid file");
      return new Response(
        JSON.stringify({ error: "No file provided or invalid file" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File too large: ${file.size} bytes (max: ${MAX_FILE_SIZE})`);
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      return new Response(
        JSON.stringify({ error: "Invalid file type", allowedTypes: ALLOWED_TYPES }),
        {
          status: 415,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Get resource_type based on file MIME type
    const resourceType = file.type.startsWith("image/") ? "image" : "video";

    // Create resource name (use a better naming strategy in production)
    const resourceName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    
    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer().catch((error) => {
      console.error("Error reading file:", error);
      throw new Error("Error reading file");
    });

    // Convert ArrayBuffer to base64
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Parameters for Cloudinary upload
    const folder = formData.get("folder") || "uploads";
    const parameters = {
      file: `data:${file.type};base64,${fileBase64}`,
      api_key: CLOUDINARY_API_KEY,
      timestamp: Math.floor(Date.now() / 1000),
      folder,
    };

    // Create signature
    const paramToSign = Object.entries(parameters)
      .filter(([key]) => key !== "file" && key !== "api_key")
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    
    const signature = await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(paramToSign + CLOUDINARY_API_SECRET)
    );
    
    // Convert signature to hex
    const signatureHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create form data for Cloudinary API
    const uploadFormData = new FormData();
    uploadFormData.append("file", `data:${file.type};base64,${fileBase64}`);
    uploadFormData.append("api_key", CLOUDINARY_API_KEY);
    uploadFormData.append("timestamp", parameters.timestamp.toString());
    uploadFormData.append("signature", signatureHex);
    uploadFormData.append("folder", folder);
    
    // Upload to Cloudinary
    console.log("Sending request to Cloudinary");
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    ).catch((error) => {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Error uploading to Cloudinary");
    });

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error(`Cloudinary error: ${cloudinaryResponse.status} ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${cloudinaryResponse.status}` }),
        {
          status: cloudinaryResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await cloudinaryResponse.json();
    console.log("Upload successful:", result.secure_url);

    // Return success response
    return new Response(
      JSON.stringify({
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in cloudinary-upload function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
