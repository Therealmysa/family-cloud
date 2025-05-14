
import { Database } from "@/integrations/supabase/types";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Type helper for Supabase tables
 */
export type Tables = Database['public']['Tables']

/**
 * Type for Supabase PostgresError responses
 */
export type SelectQueryError<T = string> = { error: PostgrestError | { message: T } }

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
 * @param tableName The name of the table
 * @param data The data to insert
 */
export const asInsertType = <T extends keyof Tables>(
  tableName: T, 
  data: Record<string, unknown>
): Tables[T]['Insert'] => data as Tables[T]['Insert'];

/**
 * Cast an object to match the database Update type for a table
 * @param tableName The name of the table
 * @param data The data to update
 */
export const asUpdateType = <T extends keyof Tables>(
  tableName: T, 
  data: Record<string, unknown>
): Tables[T]['Update'] => data as Tables[T]['Update'];

/**
 * Helper for safely handling potential database errors
 */
export const handlePotentialError = <T>(data: any, fallback: T): T => {
  if (data && !('error' in data)) {
    return data as T;
  }
  return fallback;
};

/**
 * Check if a value is an error object
 */
export const isError = (value: any): boolean => {
  return value && typeof value === 'object' && 'error' in value;
};

/**
 * Safely access a property from a potentially error-containing object
 */
export const safeAccess = <T, K extends keyof T>(obj: T | { error: any }, key: K, fallback: T[K]): T[K] => {
  if (obj && typeof obj === 'object' && !('error' in obj)) {
    return (obj as T)[key] ?? fallback;
  }
  return fallback;
};

/**
 * Safely extract data from a Supabase response
 * @param response The Supabase response object
 * @param fallback Default value to return if the response contains an error
 */
export function safeExtractData<T>(response: { data: T; error: any } | null, fallback: T): T {
  if (response && !response.error) {
    return response.data ?? fallback;
  }
  return fallback;
}

/**
 * Creates a safe resolver for handling data from potentially error-containing responses
 */
export function createSafeResolver<T, R>(resolver: (data: T) => R, fallback: R) {
  return (obj: T | { error: any }): R => {
    if (obj && typeof obj === 'object' && !('error' in obj)) {
      return resolver(obj as T);
    }
    return fallback;
  };
}
