
import { Toast as ToastPrimitive, ToastActionElement, ToastProps } from "@/components/ui/toast"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = {
  id: string
  title?: ReactNode
  description?: ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success" | "warning"
  dismissed?: boolean
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

interface ToastContextType {
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  updateToast: (toastId: string, data: Partial<ToasterToast>) => void
  dismissToast: (toastId: string) => void
  removeToast: (toastId: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

function useToastProvider({
  initialData = [],
}: {
  initialData?: Partial<ToasterToast>[]
} = {}): ToastContextType {
  const [toasts, setToasts] = useState<ToasterToast[]>(() => {
    return initialData.map((initialToast) => ({
      id: genId(),
      title: undefined,
      description: undefined,
      action: undefined,
      ...initialToast,
    }))
  })

  const addToast = useCallback(
    function({ ...props }: Omit<ToasterToast, "id">) {
      setToasts((state) => {
        if (state.length >= TOAST_LIMIT) {
          state.shift() // Remove the oldest toast
        }
        return [
          ...state,
          { id: genId(), ...props },
        ]
      })
    },
    []
  )

  const updateToast = useCallback(
    function(toastId: string, data: Partial<ToasterToast>) {
      setToasts((state) => {
        const targetIndex = state.findIndex((t) => t.id === toastId)
        if (targetIndex !== -1) {
          state[targetIndex] = { ...state[targetIndex], ...data }
        }
        return [...state]
      })
    },
    []
  )

  const dismissToast = useCallback(
    function(toastId: string) {
      setToasts((state) => {
        const targetIndex = state.findIndex((t) => t.id === toastId)
        if (targetIndex !== -1) {
          state[targetIndex] = { ...state[targetIndex], dismissed: true }
        }
        return [...state]
      })
    },
    []
  )

  const removeToast = useCallback(
    function(toastId: string) {
      setToasts((state) => {
        return state.filter(({ id }) => id !== toastId)
      })
    },
    []
  )

  return {
    toasts,
    addToast,
    updateToast,
    dismissToast,
    removeToast,
  }
}

interface ToastProviderProps {
  children: ReactNode;
  initialData?: Partial<ToasterToast>[];
}

function ToastProvider({
  children,
  ...props
}: ToastProviderProps) {
  const value = useToastProvider(props)

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

function useToastContext() {
  const context = useContext(ToastContext)
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function useToast() {
  const { toasts, addToast, updateToast, dismissToast, removeToast } = useToastContext()

  return {
    toasts,
    toast: (props: Omit<ToasterToast, "id">) => {
      addToast(props)
    },
    update: (toastId: string, props: Partial<ToasterToast>) => {
      updateToast(toastId, props)
    },
    dismiss: (toastId: string) => {
      dismissToast(toastId)
    },
    remove: (toastId: string) => {
      removeToast(toastId)
    },
  }
}

// Simplified toast function for direct use
function toast(props: Omit<ToasterToast, "id">) {
  const context = useContext(ToastContext)
  if (context) {
    context.addToast(props)
  }
}

export { 
  ToastProvider, 
  useToast, 
  toast,
  type ToasterToast
}
