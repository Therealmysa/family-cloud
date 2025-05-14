
import { Profile } from "@/types/profile";

// Define Message type
export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  sender?: Profile | {
    name: string;
    avatar_url: string | null;
    id?: string;
  };
};
