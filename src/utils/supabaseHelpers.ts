
import { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Helper functions for type safety with Supabase
export function asProfileUpdate(data: Partial<Tables['profiles']>): UpdateTables['profiles'] {
  return data as UpdateTables['profiles'];
}

export function asFamilyUpdate(data: Partial<Tables['families']>): UpdateTables['families'] {
  return data as UpdateTables['families'];
}

export function asMediaInsert(data: Partial<Tables['media']>): InsertTables['media'] {
  return data as InsertTables['media'];
}

// Function to get the file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Function to check if a file is an image
export function isImageFile(file: File): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return imageTypes.includes(file.type);
}

// Function to check if a file is a video
export function isVideoFile(file: File): boolean {
  const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  return videoTypes.includes(file.type);
}
