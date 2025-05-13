
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useToastPrimitive } from "@radix-ui/react-toast"
import { 
  Dispatch, 
  SetStateAction,
  useCallback,
  useEffect,
} from "react"
import { createContext, useContext, useState } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = Toast & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
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

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: string
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: string
    }

interface ToastContextType {
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  updateToast: (
    toastId: string,
    data: Partial<ToasterToast>
  ) => void
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
    [toasts]
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
    [toasts]
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
    [toasts]
  )

  const removeToast = useCallback(
    function(toastId: string) {
      setToasts((state) => {
        return state.filter(({ id }) => id !== toastId)
      })
    },
    [toasts]
  )

  return {
    toasts,
    addToast,
    updateToast,
    dismissToast,
    removeToast,
  }
}

function ToastProvider({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
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
  const { addToast, updateToast, dismissToast, removeToast } = useToastContext()

  return {
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

// Simplified toast function for ease of use
const toast = (props: Omit<ToasterToast, "id">) => {
  const context = useContext(ToastContext)
  if (context) {
    context.addToast(props)
  }
}

export { 
  ToastProvider, 
  useToast, 
  toast 
}
