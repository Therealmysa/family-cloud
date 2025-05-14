
// Re-export from the correct location according to the shadcn docs
import { useToast as useToastOriginal } from "@/components/ui/use-toast";
import { toast as toastOriginal } from "@/components/ui/toast";

export const useToast = useToastOriginal;
export const toast = toastOriginal;
