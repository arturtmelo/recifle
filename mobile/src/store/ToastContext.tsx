import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Toast, ToastVariant } from "../components/Toast";

type ToastState = { id: number; message: string; variant: ToastVariant } | null;

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    idRef.current += 1;
    setToast({ id: idRef.current, message, variant });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast toast={toast} onHide={() => setToast(null)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
