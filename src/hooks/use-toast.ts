
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
};

export const useToast = () => {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    // Map variants to sonner variants
    const variantMap = {
      default: undefined,
      destructive: "error",
      success: "success",
      warning: "warning",
    };
    
    const sonnerVariant = variantMap[variant] as "success" | "error" | "warning" | undefined;
    
    sonnerToast(title, {
      description,
      className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
      variant: sonnerVariant,
    });
  };

  return { toast };
};

// Export direct toast function for use in non-component contexts
export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  const { toast: showToast } = useToast();
  showToast({ title, description, variant });
};
