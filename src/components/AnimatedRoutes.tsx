import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageLoader from "./PageLoader";

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

const slideVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
};

// Define loading times for different route types
const getLoadingTime = (pathname: string): number => {
  // Dashboard pages might need more time to load charts and data
  if (pathname.includes('dashboard')) {
    return 1500;
  }
  // Complex pages with tables, forms, or heavy data
  if (
    pathname.includes('porosite') ||
    pathname.includes('stafi/menaxhimi') ||
    pathname.includes('buxheti') ||
    pathname.includes('regjistri')
  ) {
    return 1000;
  }
  // Simple pages with static content or minimal data
  if (
    pathname === '/' ||
    pathname.includes('signin') ||
    pathname.includes('register')
  ) {
    return 500;
  }
  // Default loading time for other pages
  return 800;
};

function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const loadingTime = getLoadingTime(location.pathname);
    const timer = setTimeout(() => {
      setLoading(false);
    }, loadingTime);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
          >
            <PageLoader />
          </motion.div>
        ) : (
          <motion.div
            key={location.pathname}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: [0.45, 0, 0.55, 1]
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedRoutes;
