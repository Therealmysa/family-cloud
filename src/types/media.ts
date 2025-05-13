
// Define Media and Like types
export type Media = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  user_id: string;
  created_at: string;
  date_uploaded: string;
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
    family_id: string | null;
  } | null;
  likes_count?: number;
  is_liked?: boolean;
};

export type Like = {
  id: string;
  user_id: string;
  media_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    id?: string;
    name: string;
    avatar_url: string | null;
    family_id?: string | null;
  };
};
