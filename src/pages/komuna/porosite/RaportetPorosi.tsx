import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { 
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentMagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import { urlRaporti } from "../../../endpoints";
import Toast from "../../../components/Toast";
import { generateOrdersPDF } from "../../../components/PdfGenerator";

function RaportetPorosi() {
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
    selected?: boolean;
  }

  const [records, setRecords] = useState<Porosia[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [filters, setFilters] = useState({
    kompania: "",
    shkolla: "",
    ngaData: "",
    deriData: "",
    statuset: ["Ne Pritje", "Paguar", "Fshire"], // All statuses selected by default
  });

  // Add report metrics state
  const [reportMetrics, setReportMetrics] = useState({
    totalReports: 0,
    completedOrders: 0,
    pendingOrders: 0,
    canceledOrders: 0
  });

  useEffect(() => {
    fetchRaportet();
    calculateReportMetrics();
  }, []);

  // Calculate metrics when records change or on initial load
  useEffect(() => {
    calculateReportMetrics();
  }, [records]);

  const calculateReportMetrics = () => {
    if (!records || records.length === 0) {
      setReportMetrics({
        totalReports: 0,
        completedOrders: 0,
        pendingOrders: 0,
        canceledOrders: 0
      });
      return;
    }

    const totalReports = records.length;
    const completedOrders = records.filter(r => r.statusi === 'Paguar').length;
    const pendingOrders = records.filter(r => r.statusi === 'Ne Pritje').length;
    const canceledOrders = records.filter(r => r.statusi === 'Fshire').length;

    setReportMetrics({
      totalReports,
      completedOrders,
      pendingOrders,
      canceledOrders
    });
  };

  useEffect(() => {
    fetchRaportet();
  }, []);

  const fetchRaportet = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.kompania) params.append("kompania", filters.kompania);
      if (filters.shkolla) params.append("shkolla", filters.shkolla);
      if (filters.ngaData) params.append("ngaData", filters.ngaData);
      if (filters.deriData) params.append("deriData", filters.deriData);
      filters.statuset.forEach((status) => params.append("statuset", status));

      const response = await axiosInstance.get(`${urlRaporti}?${params.toString()}`);
      
      if (response.data.succeeded) {
        setRecords((response.data.data || []).map((r: any) => ({ ...r, selected: false })));
      } else {
        setToast({ message: response.data.message || "Gabim gjatë marrjes së të dhënave", type: "error" });
        setRecords([]);
      }
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.message || "Gabim gjatë marrjes së të dhënave", 
        type: "error" 
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchRaportet();
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuset: prev.statuset.includes(status)
        ? prev.statuset.filter((s) => s !== status)
        : [...prev.statuset, status],
    }));
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setRecords((prev) => prev.map((r) => ({ ...r, selected: newSelectAll })));
  };

  const toggleSingleRecord = (id: number) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  };

  const handleGenerateRaportPDF = () => {
    generateOrdersPDF({
      records,
      filters,
      onSuccess: (message) => setToast({ message, type: "success" }),
      onError: (message) => setToast({ message, type: "error" })
    });
  };

  const renderTable = () => {
    if (loading) {
      return <div className="p-6 text-center text-gray-600">Duke ngarkuar të dhënat...</div>;
    }

    if (!records || records.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <ClipboardDocumentListIcon className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">Nuk ka të dhëna</p>
          <p className="text-sm">Nuk u gjetën porosi që përputhen me kriteret e kërkimit</p>
        </div>
      );
    }

    return (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <tr>
            <th className="px-6 py-4 font-semibold border-b border-indigo-500">Porosia</th>
            <th className="px-6 py-4 font-semibold border-b border-indigo-500">Sasia</th>
            <th className="px-6 py-4 font-semibold border-b border-indigo-500">Kompania</th>
            <th className="px-6 py-4 font-semibold border-b border-indigo-500">Shkolla</th>
            <th className="px-6 py-4 font-semibold border-b border-indigo-500">Data</th>
            <th className="px-6 py-4 font-semibold border-b border-indigo-500">Statusi</th>
            <th
              onClick={toggleSelectAll}
              className="px-6 py-4 font-semibold border-b border-indigo-500 cursor-pointer hover:bg-indigo-600 transition-colors"
            >
              {selectAll ? "Ç'zgjedh të gjitha" : "Zgjidh të gjitha"}
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, index) => (
            <tr 
              key={rec.id} 
              className={`
                border-b border-gray-200 hover:bg-indigo-50 transition-colors
                ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              `}
            >
              <td className="px-6 py-4">{rec.emri}</td>
              <td className="px-6 py-4">{rec.sasia}</td>
              <td className="px-6 py-4">{rec.kompania}</td>
              <td className="px-6 py-4">{rec.shkolla}</td>
              <td className="px-6 py-4">{new Date(rec.dataPorosise).toLocaleDateString("sq-AL")}</td>
              <td className="px-6 py-4">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${rec.statusi === 'Ne Pritje' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${rec.statusi === 'Paguar' ? 'bg-green-100 text-green-800' : ''}
                  ${rec.statusi === 'Fshire' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {rec.statusi}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  checked={rec.selected}
                  onChange={() => toggleSingleRecord(rec.id)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 pb-16 overflow-y-auto">
        {/* Toast notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Raportet e Porosive</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Analizoni dhe gjeneroni raporte për porositë dhe shpenzimet
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

        {/* Report metrics dashboard */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Reports Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Totali i Raporteve</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-700 relative z-10">{reportMetrics.totalReports}</p>
                )}
              </div>
              
              {/* Completed Orders Card */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-green-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-green-100 mb-3">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Porosi të Përfunduara</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-700 relative z-10">{reportMetrics.completedOrders}</p>
                )}
              </div>
              
              {/* Pending Orders Card */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-sm border border-amber-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-amber-100 mb-3">
                    <PresentationChartLineIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Porosi në Pritje</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-amber-700 relative z-10">{reportMetrics.pendingOrders}</p>
                )}
              </div>
              
              {/* Canceled Orders Card */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <DocumentMagnifyingGlassIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Porosi të Anuluara</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-700 relative z-10">{reportMetrics.canceledOrders}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters - enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Filtro Raportet</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="ngaData" className="font-medium text-gray-700 mb-1 text-sm">Nga Data:</label>
                  <input
                    id="ngaData"
                    type="date"
                    value={filters.ngaData}
                    onChange={(e) => setFilters({ ...filters, ngaData: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="deriData" className="font-medium text-gray-700 mb-1 text-sm">Deri në Datën:</label>
                  <input
                    id="deriData"
                    type="date"
                    value={filters.deriData}
                    onChange={(e) => setFilters({ ...filters, deriData: e.target.value })}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="kompania" className="font-medium text-gray-700 mb-1 text-sm">Kompania:</label>
                  <input
                    id="kompania"
                    type="text"
                    value={filters.kompania}
                    onChange={(e) => setFilters({ ...filters, kompania: e.target.value })}
                    placeholder="Emri i kompanisë..."
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="shkolla" className="font-medium text-gray-700 mb-1 text-sm">Shkolla:</label>
                  <input
                    id="shkolla"
                    type="text"
                    value={filters.shkolla}
                    onChange={(e) => setFilters({ ...filters, shkolla: e.target.value })}
                    placeholder="Emri i shkollës..."
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1 text-sm">Statusi:</label>
                  <div className="space-y-1">
                    {["Ne Pritje", "Paguar", "Fshire"].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.statuset.includes(status)}
                          onChange={() => handleStatusChange(status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleFilter}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Apliko Filtrat
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      kompania: "",
                      shkolla: "",
                      ngaData: "",
                      deriData: "",
                      statuset: ["Ne Pritje", "Paguar", "Fshire"],
                    });
                    fetchRaportet();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition font-medium text-sm"
                >
                  Pastro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Porosive
                </h3>
              </div>
              <div className="overflow-x-auto">
                {renderTable()}
              </div>
            </div>

            {/* PDF generation button */}
            {records.length > 0 && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleGenerateRaportPDF}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md flex items-center"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Gjenero Raportin PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Pattern background style */}
      <style>
        {`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0V4h-2V0h-4v2h4v4h2V2h4V0h-4zM0 34v-4H2v4h4v2H2v4H0v-4H2v-2H0zM0 0V4h2V0h4v2H2v4H0V2h4V0H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        `}
      </style>
    </div>
  );
}

export default RaportetPorosi;
