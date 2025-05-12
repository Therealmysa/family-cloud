
// Define Message type
export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  sender?: {
    name: string;
    avatar_url: string | null;
  };
};
