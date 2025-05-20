import { useState, useEffect } from "react";
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
  ArchiveBoxIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

function KompaniaDashboard() {
  const [statistics, setStatistics] = useState({
    numriPorosive: 5,
    produktiMeiShitur: "Shkumës",
    fitimi: 24000,
  });
  const [loading, setLoading] = useState(false);
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
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <div className="hidden md:block fixed h-full w-64 bg-white shadow-sm z-30">
        <Sidebar />
      </div>
      
      <main className="flex-1 min-h-screen w-full md:pl-64">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-r from-red-700 via-red-600 to-rose-500 text-white px-6 sm:px-8 py-12 sm:py-16 shadow-xl overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-600 opacity-50"></div>
          
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-3 text-white"
            >
              Mirësevini në panelin e Kompanisë
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white mx-auto max-w-3xl"
            >
              Shikoni kërkesat e shkollave dhe menaxhoni produktet e juaja.
            </motion.p>
          </div>
        </motion.div>
        
        {/* Status Cards */}
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Statistikat e Përgjithshme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {/* Orders Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-center mb-3 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <TruckIcon className="w-7 h-7 text-red-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Numri i porosive</h3>
                </div>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md mt-2 mx-auto"></div>
                ) : (
                  <div className="flex items-baseline justify-center relative z-10">
                    <span className="text-3xl font-bold text-gray-900">{statistics.numriPorosive}</span>
                  </div>
                )}
              </motion.div>
              
              {/* Products Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-center mb-3 relative z-10">
                  <div className="p-3 rounded-xl bg-rose-100 mb-3">
                    <TagIcon className="w-7 h-7 text-rose-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Produkti më i shitur</h3>
                </div>
                {loading ? (
                  <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-md mt-2 mx-auto"></div>
                ) : (
                  <div className="flex items-baseline justify-center relative z-10">
                    <span className="text-3xl font-bold text-gray-900">{statistics.produktiMeiShitur}</span>
                  </div>
                )}
              </motion.div>
              
              {/* Profit Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-center mb-3 relative z-10">
                  <div className="p-3 rounded-xl bg-pink-100 mb-3">
                    <BanknotesIcon className="w-7 h-7 text-pink-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Fitimi</h3>
                </div>
                {loading ? (
                  <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-md mt-2 mx-auto"></div>
                ) : (
                  <div className="flex items-baseline justify-center relative z-10">
                    <span className="text-3xl font-bold text-gray-900">€ {statistics.fitimi.toLocaleString()}</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Services Section */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Shërbimet e Sistemit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link to="/kompania/porosite/lista">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-red-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-red-50 p-3 inline-flex rounded-xl mb-4">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Porositë</h3>
                  <p className="text-sm text-gray-500">
                    Shiko dhe menaxho kërkesat e porosive.
                  </p>
                </motion.div>
              </Link>

              <Link to="/kompania/produktet">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-red-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-rose-50 p-3 inline-flex rounded-xl mb-4">
                    <ArchiveBoxIcon className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Produktet</h3>
                  <p className="text-sm text-gray-500">
                    Menaxhoni dhe shtoni produktet.
                  </p>
                </motion.div>
              </Link>

              <Link to="/kompania/porosite/raporti">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-red-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-pink-50 p-3 inline-flex rounded-xl mb-4">
                    <DocumentTextIcon className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Raportet</h3>
                  <p className="text-sm text-gray-500">
                    Gjenero raporte dhe analizo të dhënat e shitjeve.
                  </p>
                </motion.div>
              </Link>

              <Link to="/kompania/financat">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-red-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-red-50 p-3 inline-flex rounded-xl mb-4">
                    <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Financat</h3>
                  <p className="text-sm text-gray-500">
                    Raporte të detajuara financiare për produktet tuaja.
                  </p>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default KompaniaDashboard;
