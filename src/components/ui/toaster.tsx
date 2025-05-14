
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  // We're using Sonner exclusively now, so just render the Sonner toaster
  return <SonnerToaster position="top-center" closeButton />;

  /* Original implementation - disabled to prevent duplicates
  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
  */
}
