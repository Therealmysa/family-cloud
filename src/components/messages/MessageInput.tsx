
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

type MessageInputProps = {
  onSendMessage: (content: string) => void;
};

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setSubmitting(true);
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 border-t border-t-border/30">
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <Input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border-border/40 focus-visible:ring-primary/30 text-base"
          autoFocus
        />
        
        <Button
          type="submit"
          disabled={!message.trim() || submitting}
          className="bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-primary/30"
          size="icon"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
