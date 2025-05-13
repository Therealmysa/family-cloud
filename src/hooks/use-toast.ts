
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

export type ToastActionElement = React.ReactElement;

export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning";
};

type ToasterToast = ToastProps & {
  onOpenChange?: (open: boolean) => void;
};

type ToasterState = {
  toasts: ToasterToast[];
};

export const reducer = (state: ToasterState, action: any): ToasterState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.toast].slice(-TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: ToasterState) => void> = [];

let memoryState: ToasterState = { toasts: [] };

function dispatch(action: any) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast({
  title,
  description,
  action,
  variant = "default",
  ...props
}: Partial<ToasterToast> & { id?: string }) {
  const id = props?.id || String(Date.now());

  // Always use sonner toast regardless of device
  // This ensures a single notification system
  if (variant === "success") {
    sonnerToast.success(title as string, { description });
  } else if (variant === "warning") {
    sonnerToast.warning(title as string, { description });
  } else if (variant === "destructive") {
    sonnerToast.error(title as string, { description });
  } else {
    sonnerToast(title as string, { description });
  }

  // We're only going to add toasts to the shadcn system on desktop
  // This prevents duplication on mobile
  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      title,
      description,
      action,
      variant,
      ...props,
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (props: ToasterToast) =>
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      }),
  };
}

export function useToast() {
  const [state, setState] = React.useState<ToasterState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
