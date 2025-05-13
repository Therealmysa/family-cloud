
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts && toasts.map(function ({ id, title, description, action, variant = "default", ...props }) {
        // Convert success/warning variants to default since toast component only supports default/destructive
        const toastVariant = variant === "success" || variant === "warning" ? "default" : variant
        
        return (
          <Toast key={id} {...props} variant={toastVariant}>
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
}
