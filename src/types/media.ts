
// Define Media and Like types
export type Media = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  user_id: string;
  created_at: string;
  date_uploaded: string;
  profile: {
    name: string;
    avatar_url: string | null;
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
