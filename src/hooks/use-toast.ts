
// This file is now only used for backward compatibility
// We've switched to using Sonner for toasts
import { toast as sonnerToast } from "sonner";

export const toast = sonnerToast;

export function useToast() {
  return {
    toast: sonnerToast,
  };
}
