// frontend/components/ui/use-toast.tsx
import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
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

type ActionType = typeof actionTypes

type State = {
  toasts: ToasterToast[]
}

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToaster = ({ toastId, timeout }: { toastId: string; timeout: number }) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timer = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, timeout)

  toastTimeouts.set(toastId, timer)
}

const dispatch = (action: Action) => {
  setState(action)
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        addToaster({ toastId, timeout: TOAST_REMOVE_DELAY })
      } else {
        state.toasts.forEach((toast) => {
          addToaster({ toastId: toast.id, timeout: TOAST_REMOVE_DELAY })
        })
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
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: ((state: State) => void)[] = []

let state = {
  toasts: [],
} as State

function setState(action: Action) {
  state = reducer(state, action)
  listeners.forEach((listener) => listener(state))
}

const toaster = {
  get toasts() {
    return state.toasts
  },
  subscribe(listener: (state: State) => void) {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  },
  pause: () => {
    toastTimeouts.forEach((timeout) => clearTimeout(timeout))
  },
  resume: () => {
    toastTimeouts.forEach((timeout, toastId) => {
      addToaster({ toastId, timeout: TOAST_REMOVE_DELAY })
    })
  },
  dismiss: (toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  },
  remove: (toastId?: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId })
  },
}

export function useToast() {
  const [state, setState] = React.useState<State>(toaster)

  React.useEffect(() => {
    const unsubscribe = toaster.subscribe(setState)
    return () => unsubscribe()
  }, [])

  return {
    ...state,
    toast: React.useCallback(
      (props: Omit<ToasterToast, "id">) => {
        const id = genId()

        const update = (props: ToasterToast) =>
          dispatch({
            type: "UPDATE_TOAST",
            toast: { ...props, id },
          })

        const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

        dispatch({
          type: "ADD_TOAST",
          toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
              if (!open) {
                dismiss()
              }
            },
          },
        })

        return {
          id: id,
          dismiss,
          update,
        }
      },
      [dispatch]
    ),
  }
}