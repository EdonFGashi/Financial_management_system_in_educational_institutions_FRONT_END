import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ToastContainer, { ToastData } from "../../components/ToastContainer";
import Sidebar from "../../pages/komuna/Sidebar";

// Heroicons
import {
  BanknotesIcon,
  ChartPieIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function KomunaDashboard() {
  const [buxheti] = useState(320000);
  const [buxhetiNdare] = useState(150000);
  const [shkollatAktive] = useState(8);

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
          className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white px-4 sm:px-6 md:px-12 py-12 md:py-14 mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Mirësevini në panelin e Komunës</h1>
          <p className="text-base sm:text-lg text-indigo-100">
            Menaxhoni me lehtësi porositë, ndarjen e buxhetit dhe kontraktorët.
          </p>
        </motion.div>

        {/* Navigation Cards Section */}
        <div className="bg-gray-100 rounded-xl shadow-sm mx-4 sm:mx-6 md:mx-12 px-4 sm:px-6 py-8 sm:py-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/komuna/porosite/lista">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Porositë</h3>
                <p className="text-sm text-gray-500">
                  Shiko dhe menaxho kërkesat e porosive.
                </p>
              </div>
            </Link>

            <Link to="/komuna/buxheti">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Ndarja e Buxhetit</h3>
                <p className="text-sm text-gray-500">
                  Bëni ndarjen automatike apo manuale të buxhetit.
                </p>
              </div>
            </Link>

            <Link to="/komuna/kontraktoret">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Kontraktorët</h3>
                <p className="text-sm text-gray-500">
                  Menaxhoni tenderët dhe kontratat ekzistuese.
                </p>
              </div>
            </Link>

            <Link to="/komuna/financat">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Financat</h3>
                <p className="text-sm text-gray-500">
                  Raporte të detajuara financiare dhe ndalesa.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Status Overview Section */}
        <div className="bg-white rounded-xl shadow-md mx-4 sm:mx-6 md:mx-12 px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <BanknotesIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Buxheti aktual</p>
                <p className="text-xl font-semibold text-gray-800">
                  € {buxheti.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <ChartPieIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Buxheti i ndarë</p>
                <p className="text-xl font-semibold text-gray-800">
                  € {buxhetiNdare.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <UsersIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Shkollat aktive</p>
                <p className="text-xl font-semibold text-gray-800">{shkollatAktive}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default KomunaDashboard;
