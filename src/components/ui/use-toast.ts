
import { toast as sonnerToast, ToastT } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

// Create a wrapper for the toast function that accepts our app-specific props
const toast = ({ title, description, variant = "default" }: ToastProps) => {
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

// Re-export from sonner
export { toast, sonnerToast as useToast };
