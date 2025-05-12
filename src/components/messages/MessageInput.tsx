
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal } from "lucide-react";

type MessageInputProps = {
  onSendMessage: (content: string) => void;
  placeholder?: string;
};

export const MessageInput = ({ onSendMessage, placeholder = "Type a message" }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border-t">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          placeholder={placeholder}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={isSending}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || isSending}
          className={isSending ? "opacity-70" : ""}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
