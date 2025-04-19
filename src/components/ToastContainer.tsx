import { AnimatePresence } from "framer-motion";
import Toast from "./Toast";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContainerProps {
  toasts: ToastData[];
  removeToast: (id: number) => void;
}

const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <div className="fixed top-6 right-6 space-y-3 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
