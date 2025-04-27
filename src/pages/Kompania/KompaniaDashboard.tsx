import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ToastContainer, { ToastData } from "../../components/ToastContainer";
import Sidebar from "../Kompania/Sidebar";

// Heroicons
import {
  BanknotesIcon,
  ChartPieIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function KompaniaDashboard() {
  const [porosi] = useState(5);
  const [produktiMeiShitur] = useState("Shkumës");
  const [fitimi] = useState(24000);

  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (type: "success" | "error", message: string) => {
    const newToast: ToastData = {
      id: Date.now(),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 pb-16">
        {/* Toast System */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-4 sm:px-6 md:px-12 py-12 md:py-14 mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Mirësevini në panelin e Kompanisë</h1>
          <p className="text-base sm:text-lg text-indigo-100">
            Shikoni kërkesat e shkollave dhe menaxhoni produktet e juaja.
          </p>
        </motion.div>

        {/* Navigation Cards Section */}
        <div className="bg-gray-100 rounded-xl shadow-sm mx-5 sm:mx-6 md:mx-12 px-4 sm:px-6 py-8 sm:py-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/kompania/porosite/lista">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Porositë</h3>
                <p className="text-sm text-gray-500">
                  Shiko dhe menaxho kërkesat e porosive.
                </p>
              </div>
            </Link>

            <Link to="/kompania/produktet">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Produktet</h3>
                <p className="text-sm text-gray-500">
                  Menaxhoni dhe shtoni produktet.
                </p>
              </div>
            </Link>

            <Link to="/kompania/financat">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Financat</h3>
                <p className="text-sm text-gray-500">
                  Raporte të detajuara financiare për produktet tuaja.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Status Overview Section */}
        <div className="bg-white rounded-xl shadow-md mx-4 sm:mx-6 md:mx-12 px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <TruckIcon className="w-8 h-8 text-rose-600" />
              <div>
                <p className="text-sm text-gray-500">Numri i porosive</p>
                <p className="text-xl font-semibold text-gray-800">
                  {porosi.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <TagIcon className="w-8 h-8 text-rose-600" />
              <div>
                <p className="text-sm text-gray-500">Produkti më i shitur</p>
                <p className="text-xl font-semibold text-gray-800">
                  {produktiMeiShitur.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <BanknotesIcon className="w-8 h-8 text-rose-600" />
              <div>
                <p className="text-sm text-gray-500">Fitimi</p>
                <p className="text-xl font-semibold text-gray-800">€ {fitimi}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default KompaniaDashboard;
