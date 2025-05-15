
import { Database } from '@/integrations/supabase/types';

// Define table types based on the Database type
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Helper functions for type safety with Supabase
export function asProfileUpdate(data: Partial<Tables<'profiles'>>): UpdateTables<'profiles'> {
  return data as UpdateTables<'profiles'>;
}

export function asFamilyUpdate(data: Partial<Tables<'families'>>): UpdateTables<'families'> {
  return data as UpdateTables<'families'>;
}

export function asMediaInsert(data: Partial<Tables<'media'>>): InsertTables<'media'> {
  return data as InsertTables<'media'>;
}

// Function to get the file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || '';
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// Check if file is a video
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

// Check if URL is a video
export function isVideoUrl(url: string): boolean {
  return url.match(/\.(mp4|webm|ogg)$/i) !== null;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
