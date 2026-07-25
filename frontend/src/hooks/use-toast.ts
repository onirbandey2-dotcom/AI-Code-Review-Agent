import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastState: ToastState = { toasts: [] };

function notifyListeners() {
  toastListeners.forEach((listener) => listener(toastState.toasts));
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 5000,
}: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(7);
  const newToast: Toast = { id, title, description, variant, duration };
  toastState = { toasts: [...toastState.toasts, newToast] };
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toastState = {
        toasts: toastState.toasts.filter((t) => t.id !== id),
      };
      notifyListeners();
    }, duration);
  }

  return id;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastState.toasts);

  useState(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  });

  const dismiss = useCallback((id: string) => {
    toastState = { toasts: toastState.toasts.filter((t) => t.id !== id) };
    notifyListeners();
  }, []);

  return { toasts, toast, dismiss };
}
