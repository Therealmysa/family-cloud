
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
    <div className="p-4 sm:p-5 md:p-6 bg-white dark:bg-gray-800 border-t border-t-border/30">
      <form className="flex gap-3 max-w-6xl mx-auto">
        <Input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border-border/40 focus-visible:ring-primary/30 text-base md:text-lg py-6 px-4"
          autoFocus
        />
        
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!message.trim() || submitting}
          className="bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-primary/30 h-auto px-5"
          size="lg"
        >
          <SendHorizontal className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </form>
    </div>
  );
};
