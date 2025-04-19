import { useEffect, useState } from "react";
import { Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageLoader from "./PageLoader";

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setLoading(true);
    setShowContent(false);

    const timeout = setTimeout(() => {
      setLoading(false);
      setShowContent(true);
    }, 1000); // 1 second loader

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <PageLoader key="loader" />
      ) : (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showContent && children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
