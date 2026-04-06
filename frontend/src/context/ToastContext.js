import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  const success = useCallback(
    (message, duration) => {
      showToast(message, "success", duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message, duration) => {
      showToast(message, "error", duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message, duration) => {
      showToast(message, "info", duration);
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      success,
      error,
      info,
      removeToast,
    }),
    [toasts, showToast, success, error, info, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast mora da se koristi unutar ToastProvider.");
  }

  return context;
};
