
import * as React from "react";
import { Toaster as Sonner } from "sonner";

const TOAST_LIMIT = 20;
export type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
};

type ToasterToast = ToastProps;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId));
          toastTimeouts.delete(toastId);
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout);
          toastTimeouts.delete(id);
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type ToastShowProps = (props: ToastProps) => {
  id: string;
  dismiss: () => void;
  update: (props: ToastProps) => void;
};

function useToast() {
  const [state, setState] = React.useState<State>({ toasts: [] });

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // Fixed toast function with proper type annotation
  const toast: ToastShowProps = (props) => {
    const id = props.id || genId();
    const variantMap = {
      default: undefined,
      destructive: "error",
      success: "success",
      warning: "warning",
    };
    
    // For external toast (sonner)
    if (props.title) {
      const sonnerVariant = props.variant ? variantMap[props.variant] : undefined;
      
      Sonner.toast(props.title, {
        description: props.description,
        className: props.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
        // @ts-ignore - sonner has its own variant types
        variant: sonnerVariant,
      });
    }
    
    // For internal toast
    const toast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          dispatch({ type: "DISMISS_TOAST", toastId: id });
        }
      },
    };

    dispatch({
      type: "ADD_TOAST",
      toast,
    });

    return {
      id,
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
      update: (props: ToastProps) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        }),
    };
  };

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
    remove: (toastId?: string) =>
      dispatch({ type: "REMOVE_TOAST", toastId }),
  };
}

// Helper function to easily call toast outside of components
export function toast(props: ToastProps) {
  const id = props.id || genId();
  const variantMap = {
    default: undefined,
    destructive: "error",
    success: "success",
    warning: "warning",
  };
  
  // For external toast (sonner)
  if (props.title) {
    const sonnerVariant = props.variant ? variantMap[props.variant] : undefined;
    
    Sonner.toast(props.title, {
      description: props.description,
      className: props.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
      // @ts-ignore - sonner has its own variant types
      variant: sonnerVariant,
    });
  }

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (props: ToastProps) =>
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      }),
  };
}

export { useToast };
