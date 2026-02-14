import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  }[type];

  const icon = {
    success: "check_circle",
    error: "error",
    info: "info",
  }[type];

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
      >
        <span className="material-icons-outlined text-xl">{icon}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <span className="material-icons-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};
