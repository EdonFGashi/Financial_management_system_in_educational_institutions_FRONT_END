import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "../../pages/komuna/Sidebar";
import axiosInstance from "../../api/axiosInstance";
import { urlListKomuna, urlListShkolla, urlNdalesat } from "../../endpoints";

// Heroicons
import {
  BanknotesIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  CurrencyEuroIcon
} from "@heroicons/react/24/outline";

// Define interfaces for API responses
interface KomunaResponse {
  komunaId: number;
  qyteti: string;
  nrPopullsis: number;
  buxhetiAktual: number;
  ditaNdarjesAuto: boolean;
  userId: string;
}

interface ShkollaResponse {
  id: number;
  emri: string;
  komunaId: number;
  // Other fields that might be in the response
}

interface NdalesatResponse {
  page: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  data: any[];
  succeeded: boolean;
  message: string;
  statusCode: number;
}

function KomunaDashboard() {
  const [buxheti, setBuxheti] = useState<number | null>(null);
  const [shkollatAktive, setShkollatAktive] = useState<number | null>(null);
  const [ndalesatAktive, setNdalesatAktive] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [komunaId, setKomunaId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch data when component mounts
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch budget data
        const komunaResponse = await axiosInstance.get<KomunaResponse[]>(`${urlListKomuna}`);
        if (komunaResponse.data && komunaResponse.data.length > 0) {
          // Assuming the first komuna is the one we're interested in
          const komuna = komunaResponse.data[0];
          setBuxheti(komuna.buxhetiAktual);
          setKomunaId(komuna.komunaId);
          
          // Fetch schools data
          try {
            const shkollaResponse = await axiosInstance.get(`${urlListShkolla}/get-all`);
            
            if (shkollaResponse.data) {
              let count = 0;
              
              if (Array.isArray(shkollaResponse.data)) {
                for (let i = 0; i < shkollaResponse.data.length; i++) {
                  const shkolla = shkollaResponse.data[i];
                  if (
                    (shkolla.komunaId && shkolla.komunaId === komuna.komunaId) ||
                    (shkolla.KomunaId && shkolla.KomunaId === komuna.komunaId) ||
                    (shkolla.komuneId && shkolla.komuneId === komuna.komunaId)
                  ) {
                    count++;
                  }
                }
              } 
              else if (shkollaResponse.data.data && Array.isArray(shkollaResponse.data.data)) {
                const schoolsArray = shkollaResponse.data.data;
                for (let i = 0; i < schoolsArray.length; i++) {
                  const shkolla = schoolsArray[i];
                  if (
                    (shkolla.komunaId && shkolla.komunaId === komuna.komunaId) ||
                    (shkolla.KomunaId && shkolla.KomunaId === komuna.komunaId) ||
                    (shkolla.komuneId && shkolla.komuneId === komuna.komunaId)
                  ) {
                    count++;
                  }
                }
              }
              
              // If we're still at 0, just display the total count as a fallback
              if (count === 0) {
                if (Array.isArray(shkollaResponse.data)) {
                  count = shkollaResponse.data.length;
                } else if (shkollaResponse.data.data && Array.isArray(shkollaResponse.data.data)) {
                  count = shkollaResponse.data.data.length;
                }
              }
              
              setShkollatAktive(count);
            } else {
              setShkollatAktive(0);
            }
          } catch (shkollErr) {
            setShkollatAktive(0);
          }
          
          // Fetch ndalesat data
          try {
            const ndalesatResponse = await axiosInstance.get<NdalesatResponse>(`${urlNdalesat}/paginated`);
            if (ndalesatResponse.data && ndalesatResponse.data.succeeded) {
              // Use totalRecords from the paginated response
              setNdalesatAktive(ndalesatResponse.data.totalRecords);
            } else {
              setNdalesatAktive(0);
            }
          } catch (ndalesatErr) {
            setNdalesatAktive(0);
          }
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <div className="hidden md:block fixed h-full w-64 bg-white shadow-sm z-30">
        <Sidebar />
      </div>
      
      {/* Added width control to the main container */}
      <main className="flex-1 min-h-screen w-full md:pl-64">
        {/* Hero Section - Centered content with padding adjustments */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white px-6 sm:px-8 py-12 sm:py-16 shadow-xl overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/30 to-blue-600/30 backdrop-blur-[1px]"></div>
          {/* Centered content with max-width */}
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-3"
            >
              Mirësevini në panelin e Komunës
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-indigo-100 mx-auto max-w-3xl"
            >
              Menaxhoni me lehtësi porositë, ndarjen e buxhetit dhe kontraktorët për institucionet arsimore.
            </motion.p>
          </div>
        </motion.div>
        
        {/* Status Cards - Centered layout */}
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Statistikat e Përgjithshme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Budget Card - Center aligned content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-center mb-3 relative z-10">
                  <div className="p-3 rounded-xl bg-indigo-100 mb-3">
                    <BanknotesIcon className="w-7 h-7 text-indigo-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Buxheti aktual</h3>
                </div>
                {loading ? (
                  <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-md mt-2 mx-auto"></div>
                ) : (
                  <div className="flex items-baseline justify-center relative z-10">
                    <span className="text-3xl font-bold text-gray-900">€ {buxheti?.toLocaleString() || '0'}</span>
                  </div>
                )}
              </motion.div>
              
              {/* Schools Card - Center aligned content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-center mb-3 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <BuildingLibraryIcon className="w-7 h-7 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Shkollat aktive</h3>
                </div>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md mt-2 mx-auto"></div>
                ) : (
                  <div className="flex items-baseline justify-center relative z-10">
                    <span className="text-3xl font-bold text-gray-900">{shkollatAktive || '0'}</span>
                  </div>
                )}
              </motion.div>
              
              {/* Penalties Card - Center aligned content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-center mb-3 relative z-10">
                  <div className="p-3 rounded-xl bg-amber-100 mb-3">
                    <ExclamationTriangleIcon className="w-7 h-7 text-amber-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Ndalesa aktive</h3>
                </div>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md mt-2 mx-auto"></div>
                ) : (
                  <div className="flex items-baseline justify-center relative z-10">
                    <span className="text-3xl font-bold text-gray-900">{ndalesatAktive || '0'}</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Services Section - Center aligned heading */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Shërbimet e Sistemit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link to="/komuna/porosite/lista">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-indigo-50 p-3 inline-flex rounded-xl mb-4">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Porositë</h3>
                  <p className="text-sm text-gray-500">
                    Shiko dhe menaxho kërkesat e porosive nga institucionet arsimore.
                  </p>
                </motion.div>
              </Link>

              <Link to="/komuna/buxheti">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-green-50 p-3 inline-flex rounded-xl mb-4">
                    <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Ndarja e Buxhetit</h3>
                  <p className="text-sm text-gray-500">
                    Bëni ndarjen automatike apo manuale të buxhetit për institucionet.
                  </p>
                </motion.div>
              </Link>

              <Link to="/komuna/kompanite">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-blue-50 p-3 inline-flex rounded-xl mb-4">
                    <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Kontraktorët</h3>
                  <p className="text-sm text-gray-500">
                    Menaxhoni tenderët dhe kontratat ekzistuese me ofruesit e shërbimeve.
                  </p>
                </motion.div>
              </Link>

              <Link to="/komuna/financat">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 transition-all duration-200 h-full flex flex-col items-center text-center"
                >
                  <div className="bg-purple-50 p-3 inline-flex rounded-xl mb-4">
                    <BanknotesIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Financat</h3>
                  <p className="text-sm text-gray-500">
                    Shikoni raporte të detajuara financiare dhe menaxhoni ndalesat.
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

export default KomunaDashboard;
