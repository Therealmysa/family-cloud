
// Define Profile type
export type Profile = {
  id: string;
  name: string;
  email?: string;
  avatar_url: string | null;
  family_id: string | null;
  is_admin?: boolean | null;
  bio?: string | null;
  theme?: string | null;
  created_at?: string;
  updated_at?: string;
};
