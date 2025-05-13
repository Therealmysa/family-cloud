
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { X } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ position = "top-center", ...props }: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:relative",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded",
          closeButton:
            "group-[.toast]:absolute group-[.toast]:top-1/2 group-[.toast]:right-2 group-[.toast]:transform group-[.toast]:-translate-y-1/2 group-[.toast]:p-2 group-[.toast]:rounded-md group-[.toast]:bg-transparent group-[.toast]:text-foreground/70 group-[.toast]:opacity-100 group-[.toast]:hover:bg-muted/50 group-[.toast]:hover:text-foreground",
        },
      }}
      position={position}
      closeButton={true}
      {...props}
    />
  )
}

export { Toaster }
