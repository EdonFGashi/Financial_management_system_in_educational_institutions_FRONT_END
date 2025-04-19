import { motion } from "framer-motion";

function PageLoader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="relative flex flex-col justify-center items-center h-screen w-full bg-gray-50 text-center"
    >
      {/* Animated Dots */}
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-5 h-5 rounded-full bg-indigo-600 shadow-lg"
            animate={{ y: [0, -12, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Footer Text at Bottom of Page */}
      <p className="absolute bottom-6 text-xs text-gray-400">
        All credits go to FIEK students
      </p>
    </motion.div>
  );
}

export default PageLoader;