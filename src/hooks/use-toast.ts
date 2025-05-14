
// This file is now only used for backward compatibility
// We've switched to using Sonner for toasts
import { toast as sonnerToast, ToastT } from "sonner";

// Define the expected toast props
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

// Create a wrapper for toast to handle our app-specific props format
export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  // Map our variant to Sonner's style
  const style: Record<string, any> = {};
  
  if (variant === "destructive") {
    style.style = { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" };
  } else if (variant === "success") {
    style.style = { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" };
  }

  // Use description as the main toast message, with title as an optional heading
  if (title && description) {
    return sonnerToast(title, {
      description,
      ...style
    });
  }
  
  // If only title is provided, use it as the main message
  return sonnerToast(description || title || "", style);
};

// Export useToast for backward compatibility
export function useToast() {
  return {
    toast
  };
}
