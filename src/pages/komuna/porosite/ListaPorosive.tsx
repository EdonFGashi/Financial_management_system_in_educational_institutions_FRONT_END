import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  urlListShkolla,
  urlPorosite,
  urlProdukt,
} from "../../../endpoints";
import {
  ClipboardDocumentCheckIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  XCircleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import {
  GlobeAltIcon,
  Squares2X2Icon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../api/axiosInstance";

function ListaPorosive() {
  interface Porosia {
    cmimi: number;
    dataPorosise: string;
    emri: string;
    id: number;
    pershkrimi: string;
    prodhuesi: string;
    sasia: number;
    shenime: string;
    statusi: string;
    kompania: string;
    shkolla: string;
    origjina: string;
    shkollaId: number;
    produktiId: number;
  }

  const [porosite, setPorosite] = useState<Porosia[]>([]);
  const [filters, setFilters] = useState({
    pershkrimi: "",
    kompania: "",
    shkolla: "",
    data: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Add new state for return statistics
  const [returnStats, setReturnStats] = useState({
    totalReturns: 0,
    returnValue: 0,
    returnRate: 0,
    lastMonthReturns: 0
  });
  
  // Add loading state for stats
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchPorosite();
  }, []);
  
  // Add useEffect to recalculate stats when porosite changes
  useEffect(() => {
    if (porosite.length > 0) {
      calculateReturnStats();
    }
  }, [porosite]);

  // Replace the fetchReturnStats with a function that calculates stats from actual data
  const calculateReturnStats = () => {
    setStatsLoading(true);
    
    try {
      // Calculate stats based on actual porosite data
      const returnedOrders = porosite.filter(p => p.statusi === "Fshire");
      const allOrders = porosite.length;
      
      // Calculate total returned orders
      const totalReturns = returnedOrders.length;
      
      // Calculate total value of returned orders and format to 2 decimal places
      const returnValue = parseFloat(returnedOrders.reduce((sum, order) => sum + order.cmimi, 0).toFixed(2));
      
      // Calculate return rate (percentage of all orders that were returned)
      const returnRate = allOrders > 0 ? ((totalReturns / allOrders) * 100).toFixed(1) : 0;
      
      // Calculate returns from the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const lastMonthReturns = returnedOrders.filter(order => {
        const orderDate = new Date(order.dataPorosise);
        return orderDate >= lastMonth;
      }).length;
      
      // Update the state with calculated values
      setReturnStats({
        totalReturns,
        returnValue,
        returnRate: parseFloat(returnRate as string),
        lastMonthReturns
      });
    } catch (error) {
      console.error("Error calculating return statistics", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPorosite = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.pershkrimi) params.append("pershkrimi", filters.pershkrimi);
      if (filters.kompania) params.append("kompania", filters.kompania);
      if (filters.shkolla) params.append("shkolla", filters.shkolla);
      if (filters.data) params.append("data", filters.data);

      const response = await axiosInstance.get(
        `${urlPorosite}?${params.toString()}`
      );

      if (response.data.succeeded) {
        setPorosite(response.data.data);
        console.log(response.data.data);
        // We'll calculate stats in the useEffect that depends on porosite
      } else {
        setToast({
          message: response.data.message || "Gabim gjatë marrjes së të dhënave",
          type: "error",
        });
        setPorosite([]);
      }
    } catch (error: any) {
      setToast({
        message:
          error.response?.data?.message ||
          "Ndodhi një gabim gjatë komunikimit me serverin",
        type: "error",
      });
      setPorosite([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilter = () => {
    fetchPorosite();
  };

  const handlePaguaj = async (id: number, cmimi: number, sasia: number) => {
    const result = await Swal.fire({
      title: "A jeni i sigurt?",
      text: "Dëshironi të paguani këtë porosi?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Po, Paguaj",
      cancelButtonText: "Anulo",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.patch(`${urlPorosite}/${id}`, {
          id: id,
          produktiCmimi: cmimi,  // Fixed typo: produkriCmimi -> produktiCmimi
          sasia: sasia,
          statusi: "Paguar", // Optional
        });

        if (response.data.succeeded) {
          setToast({
            message: response.data.message || "Porosia u pagua me sukses!",
            type: "success",
          });
          fetchPorosite();
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: any) {
        setToast({
          message:
            error.response?.data?.message || "Veprimi nuk u krye me sukses!",
          type: "error",
        });
      }
    }
  };

  const handleFshij = async (
    id: number,
    cmimi: number,
    shkollaId: number,
    sasia: number,
    produktiId: number
  ) => {
    const result = await Swal.fire({
      title: "A jeni i sigurt?",
      text: "Dëshironi të fshini këtë porosi?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Po, Fshij",
      cancelButtonText: "Anulo",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.patch(`${urlPorosite}/${id}`, {
          statusi: "Fshire", // Optional
        });

        await axiosInstance.put(`${urlListShkolla}/${shkollaId}`, {
          id: shkollaId,
          drejtori: null,
          adresaId: null,
          nrNxenesve: null,
          buxhetiAktual: cmimi,
          buxhetiShfrytezuar: -cmimi,
          autoNdarja: null,
        });

        await axiosInstance.put(`${urlProdukt}/${produktiId}`, {
          id: produktiId,
          emri: null,
          pershkrimi: null,
          cmimi: null,
          sasiaNeStok: sasia,
          origjina: null,
          prodhuesi: null,
          fotografia: null,
        });

        if (response.data.succeeded) {
          setToast({
            message: response.data.message || "Porosia u fshi me sukses!",
            type: "success",
          });
          fetchPorosite();
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: any) {
        setToast({
          message:
            error.response?.data?.message || "Veprimi nuk u krye me sukses!",
          type: "error",
        });
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      pershkrimi: "",
      kompania: "",
      shkolla: "",
      data: "",
    });
    fetchPorosite();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800 relative">
      <Sidebar />

      <main className="flex-1 pb-16 overflow-y-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* New Blue Header */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Lista e Porosive</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Menaxhoni porositë dhe pagesat nga institucionet arsimore
                </p>
              </div>
              <Link
                to="/komuna/dashboard"
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium self-start"
              >
                ← Kthehu te Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* New Dashboard Return Statistics - Removed negative margin and added proper spacing */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Returns Overview Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-6 overflow-hidden relative">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Përmbledhje e Kthimeve</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 rounded-lg bg-red-100">
                            <XCircleIcon className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="text-sm text-gray-500">Total Kthime</span>
                        </div>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{returnStats.totalReturns}</p>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <CurrencyEuroIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-500">Vlera e Kthimeve</span>
                        </div>
                        {statsLoading ? (
                          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">€ {returnStats.returnValue.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 2})}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-32 w-32 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center">
                    <ArrowPathIcon className="h-12 w-12 text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Return Metrics Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-6 overflow-hidden relative">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Metrikat e Kthimeve</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 rounded-lg bg-amber-100">
                            <ChartBarIcon className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="text-sm text-gray-500">Shkalla e Kthimit</span>
                        </div>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{returnStats.returnRate}%</p>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 rounded-lg bg-green-100">
                            <ShoppingCartIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-500">Kthimet e Muajit</span>
                        </div>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{returnStats.lastMonthReturns}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-32 w-32 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center">
                    <BanknotesIcon className="h-12 w-12 text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
                Filtro Porositë
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  name="pershkrimi"
                  value={filters.pershkrimi}
                  onChange={handleInputChange}
                  placeholder="Përshkrimi"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  name="kompania"
                  value={filters.kompania}
                  onChange={handleInputChange}
                  placeholder="Kompania"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  name="shkolla"
                  value={filters.shkolla}
                  onChange={handleInputChange}
                  placeholder="Shkolla"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  name="data"
                  value={filters.data}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleFilter}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition col-span-1 flex items-center justify-center gap-2"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  Filtro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {porosite.length > 0 ? (
                porosite
                  .filter((p) => p.statusi === "Ne Pritje")
                  .map((porosi) => (
                    <div
                      key={porosi.id}
                      className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 relative border border-gray-100"
                    >
                      {/* Date Badge */}
                      <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {new Date(porosi.dataPorosise).toLocaleDateString("sq-AL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold border-b pb-2 text-gray-800">
                        {porosi.emri}
                      </h3>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <ClipboardDocumentListIcon className="h-4 w-4" />
                          <span>
                            <strong>Përshkrimi:</strong>{" "}
                            {porosi.pershkrimi || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <GlobeAltIcon className="h-4 w-4" />
                          <span>
                            <strong>Origjina:</strong> {porosi.origjina}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <BuildingOffice2Icon className="h-4 w-4" />
                          <span>
                            <strong>Prodhuesi:</strong> {porosi.prodhuesi}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr className="border-gray-200" />

                      {/* Order Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <BuildingOffice2Icon className="h-4 w-4" />
                          <span>
                            <strong>Kompania:</strong> {porosi.kompania}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <AcademicCapIcon className="h-4 w-4" />
                          <span>
                            <strong>Shkolla:</strong> {porosi.shkolla}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Squares2X2Icon className="h-4 w-4" />
                          <span>
                            <strong>Sasia:</strong> {porosi.sasia}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <PencilIcon className="h-4 w-4" />
                          <span>
                            <strong>Shënime:</strong> {porosi.shenime}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        Çmimi total: {porosi.cmimi} €
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => handlePaguaj(porosi.id, porosi.cmimi, porosi.sasia)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Paguaj
                        </button>
                        <button
                          onClick={() =>
                            handleFshij(
                              porosi.id,
                              porosi.cmimi,
                              porosi.shkollaId,
                              porosi.produktiId,
                              porosi.sasia
                            )
                          }
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Fshij
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center text-gray-500 col-span-full bg-white rounded-xl shadow-sm p-12 border border-gray-100">
                  <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk ka porosi</h3>
                  <p className="text-gray-500">Nuk ka të dhëna për t'u shfaqur. Provoni të ndryshoni filtrat.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Pattern background style */}
      <style>
        {`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        `}
      </style>
    </div>
  );
}

export default ListaPorosive;
