import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
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

      const response = await axios.get(`${urlRaporti}?${params.toString()}`);
      // Access the data array directly from response.data.data
      setRecords((response.data.data || []).map((r: any) => ({ ...r, selected: false })));
    } catch (error) {
      console.error("Gabim gjatë marrjes së raporteve:", error);
      setToast({ message: "Gabim gjatë marrjes së të dhënave.", type: "error" });
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
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10 relative">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" />
            Raportet e Porosive
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label htmlFor="ngaData" className="font-medium text-gray-700">Nga:</label>
              <input
                id="ngaData"
                type="date"
                value={filters.ngaData}
                onChange={(e) => setFilters({ ...filters, ngaData: e.target.value })}
                className="p-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="deriData" className="font-medium text-gray-700">Deri:</label>
              <input
                id="deriData"
                type="date"
                value={filters.deriData}
                onChange={(e) => setFilters({ ...filters, deriData: e.target.value })}
                className="p-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex flex-col">
            <label htmlFor="kompania" className="font-medium text-gray-700">Kompania:</label>

            <input
              type="text"
              value={filters.kompania}
              onChange={(e) => setFilters({ ...filters, kompania: e.target.value })}
              placeholder="Kompania..."
              className="p-3 border border-gray-300 rounded-md text-sm"
            />
            </div>
            <div className="flex flex-col">
            <label htmlFor="shkolla" className="font-medium text-gray-700">Shkolla:</label>

            <input
              type="text"
              value={filters.shkolla}
              onChange={(e) => setFilters({ ...filters, shkolla: e.target.value })}
              placeholder="Shkolla..."
              className="p-3 border border-gray-300 rounded-md text-sm"
            />
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <label className="font-medium text-gray-700">Statusi</label>
              <div className="flex gap-3 flex-wrap">
                {["Ne Pritje", "Paguar", "Fshire"].map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.statuset.includes(status)}
                      onChange={() => handleStatusChange(status)}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleFilter}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition"
            >
              Filtro
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-3">Lista e Porosive:</h3>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Duke ngarkuar të dhënat...</div>
          ) : (
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
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleGenerateRaportPDF}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Gjenero PDF
          </button>
        </div>
      </main>
    </div>
  );
}

export default RaportetPorosi;
