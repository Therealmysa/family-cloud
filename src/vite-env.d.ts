
/// <reference types="vite/client" />

interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

// Define return types for Supabase RPC functions
interface CreateFamilyResponse {
  family_id: string;
  invite_code: string;
}

interface JoinFamilyResponse {
  success: boolean;
  message: string;
  family_id?: string;
}
