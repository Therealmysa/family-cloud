
import { Database } from "@/integrations/supabase/types";

/**
 * Type helper for Supabase tables
 */
export type Tables = Database['public']['Tables']

/**
 * Helper to cast values to their expected database types
 * Use this when TypeScript complains about UUID compatibility or object shape
 */
export const asDbValue = <T>(value: unknown): T => value as T;

/**
 * Cast a UUID string to the database UUID type
 */
export const asUUID = (id: string) => id as unknown as any;

/**
 * Cast an object to match the database Insert type for a table
 */
export const asInsertType = <T extends keyof Tables>(
  tableName: T, 
  data: Record<string, unknown>
): Tables[T]['Insert'] => data as unknown as Tables[T]['Insert'];

/**
 * Cast an object to match the database Update type for a table
 */
export const asUpdateType = <T extends keyof Tables>(
  tableName: T, 
  data: Record<string, unknown>
): Tables[T]['Update'] => data as unknown as Tables[T]['Update'];

/**
 * Helper for safely handling potential database errors
 */
export const handlePotentialError = <T>(data: any, fallback: T): T => {
  if (data && !('error' in data)) {
    return data as T;
  }
  return fallback;
};
