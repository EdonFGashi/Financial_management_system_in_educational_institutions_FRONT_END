import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000); // Increased duration to 5s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`min-w-[320px] flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg 
        ${type === "success" 
          ? "bg-green-50 text-green-800 border border-green-200" 
          : "bg-red-50 text-red-800 border border-red-200"
        }`}
    >
      {/* Icon */}
      {type === "success" ? (
        <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
      ) : (
        <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
      )}

      {/* Message */}
      <p className="text-sm font-medium flex-grow">{message}</p>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-opacity-20 transition-colors
          ${type === "success" 
            ? "hover:bg-green-600" 
            : "hover:bg-red-600"
          }`}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
