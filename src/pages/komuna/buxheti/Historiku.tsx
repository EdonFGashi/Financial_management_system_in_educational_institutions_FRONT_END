import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  BuildingLibraryIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import { urlNdarjetBuxhetit } from "../../../endpoints";
import axiosInstance from "../../../api/axiosInstance";
import { generateHistoryPDF } from "../../../components/PdfGenerator";

interface HistorikuEntry {
  id: number;
  shkollaId: number;
  emriShkolles: string;
  shuma: number;
  lloji: "Rritje" | "Zvogëlim";
  data: string;
  shenime: string;
  selected?: boolean;
  emriDrejtorit: string;
  mbiemriDrejtorit: string;
}

function Historiku() {
  const [entries, setEntries] = useState<HistorikuEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  const [filters, setFilters] = useState({
    shkolla: "",
    drejtori: "",
    ngaData: "",
    deriData: "",
  });

  useEffect(() => {
    loadNdarjet();
  }, []);

  const loadNdarjet = async () => {
    try {
      const params: any = {};

      if (filters.shkolla) params.shkolla = filters.shkolla;
      if (filters.ngaData) params.dataNga = filters.ngaData;
      if (filters.deriData) params.dataDeri = filters.deriData;
      if (filters.drejtori) params.drejtori = filters.drejtori;

      const response = await axiosInstance.get(urlNdarjetBuxhetit, { params });

      if (response.data && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((entry: any): HistorikuEntry => {
          const lloji = entry.shuma > 0 ? "Rritje" : "Zvogëlim";
          return {
            id: entry.id,
            shkollaId: entry.shkollaId,
            emriShkolles: entry.shkolla.emriShkolles,
            shuma: Math.abs(entry.shuma),
            lloji,
            data: entry.data,
            shenime: entry.shenime || "",
            selected: false,
            emriDrejtorit: entry.shkolla.person.emri,
            mbiemriDrejtorit: entry.shkolla.person.mbiemri,
          };
        });
        setEntries(mapped);
      } else {
        throw new Error("Invalid data structure received");
      }
    } catch (error: any) {
      console.error("Gabim gjatë marrjes së të dhënave:", error);
      setToast({ 
        message: error.response?.data?.message || "Gabim gjatë marrjes së të dhënave", 
        type: "error" 
      });
    }
  };
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Jeni të sigurt?",
      text: "Ky veprim nuk mund të kthehet mbrapa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Po, fshije!",
      cancelButtonText: "Anulo",
    });
  
    if (confirm.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`${urlNdarjetBuxhetit}/${id}`);
        if (response.data.succeeded) {
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setToast({ message: "Regjistrimi u fshi me sukses", type: "success" });
        } else {
          throw new Error(response.data.message || "Gabim gjatë fshirjes");
        }
      } catch (error: any) {
        setToast({ 
          message: error.response?.data?.message || "Gabim gjatë fshirjes", 
          type: "error" 
        });
      }
    }
  };
  

  const handleFilter = () => {
    loadNdarjet(); // Re-fetch with filters
    setToast({
      message: "Filtrat u aplikuan me sukses",
      type: "success",
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setEntries(
      entries.map((entry) => ({
        ...entry,
        selected: !selectAll,
      }))
    );
  };

  const toggleSingleEntry = (id: number) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, selected: !entry.selected } : entry
      )
    );
  };

  const handleGeneratePDF = async () => {
    const selectedEntries = entries.filter((entry) => entry.selected);

    if (selectedEntries.length === 0) {
      setToast({
        message: "Ju lutem selektoni së paku një regjistrim",
        type: "error",
      });
      return;
    }

    try {
      await generateHistoryPDF({
        entries: selectedEntries,
        filters,
        onSuccess: (message) => setToast({ message, type: "success" }),
        onError: (message) => setToast({ message, type: "error" })
      });
    } catch (error) {
      setToast({
        message: "Ndodhi një gabim gjatë gjenerimit të PDF-së",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 pb-16 overflow-y-auto">
        {/* Toast notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Historiku i Transaksioneve</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Shikoni të gjitha transaksionet e ndarjes së buxhetit për shkollat
                </p>
              </div>
              <Link
                to="/komuna/dashboard"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium self-start"
              >
                ← Kthehu te Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Section - Enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2 text-blue-600" />
                Filtro Transaksionet
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <UserIcon className="inline-block w-4 h-4 mr-1" />
                    Drejtori:
                  </label>
                  <input
                    type="text"
                    value={filters.drejtori || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, drejtori: e.target.value })
                    }
                    placeholder="Emri ose mbiemri..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <BuildingLibraryIcon className="inline-block w-4 h-4 mr-1" />
                    Shkolla:
                  </label>
                  <input
                    type="text"
                    value={filters.shkolla}
                    onChange={(e) =>
                      setFilters({ ...filters, shkolla: e.target.value })
                    }
                    placeholder="Shkolla..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                    Nga data:
                  </label>
                  <input
                    type="date"
                    value={filters.ngaData}
                    onChange={(e) =>
                      setFilters({ ...filters, ngaData: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                    Deri më:
                  </label>
                  <input
                    type="date"
                    value={filters.deriData}
                    onChange={(e) =>
                      setFilters({ ...filters, deriData: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleFilter}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition flex items-center justify-center"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" /> Filtro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section - Enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Transaksioneve
                </h3>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-gray-600">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-blue-800 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Duke ngarkuar të dhënat...
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Drejtori
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Shkolla
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Përshkrimi
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Shuma
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Lloji
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Veprime
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {entries.length > 0 ? (
                        entries.map((entry, index) => (
                          <tr key={entry.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={entry.selected || false}
                                onChange={() => toggleSingleEntry(entry.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.emriDrejtorit} {entry.mbiemriDrejtorit}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BuildingLibraryIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {entry.emriShkolles}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.shenime || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`text-sm font-medium ${
                                  entry.lloji === "Rritje"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {entry.lloji === "Rritje" ? "+" : "-"}
                                {entry.shuma}€
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex justify-center">
                                <span
                                  className={`
                                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${
                                    entry.lloji === "Rritje"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                `}
                                >
                                  {entry.lloji === "Rritje" ? (
                                    <ArrowUpIcon className="w-3 h-3 mr-1" />
                                  ) : (
                                    <ArrowDownIcon className="w-3 h-3 mr-1" />
                                  )}
                                  {entry.lloji}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                              {new Date(entry.data).toLocaleDateString("sq-AL")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Fshi
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                            <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk ka transaksione</h3>
                            <p className="text-gray-500">Nuk u gjetën transaksione që përputhen me kriteret e kërkimit</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PDF generation button */}
            {entries.length > 0 && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleGeneratePDF}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md flex items-center"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Gjenero PDF të Raportit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pattern background style */}
        <style>
          {`
          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          `}
        </style>
      </main>
    </div>
  );
}

export default Historiku;
