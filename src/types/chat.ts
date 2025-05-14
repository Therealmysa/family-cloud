
// Define Chat type
export type Chat = {
  id: string;
  type: 'group' | 'private';
  family_id: string;
  members: string[];
  created_at?: string;
  otherMember?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
};
