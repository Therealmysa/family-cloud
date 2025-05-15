
// File extension should remain as .ts since it doesn't contain JSX

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatar_url?: string | null;
  family_id?: string | null;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  avatar_url?: string | null;
  owner_id?: string | null;
}
