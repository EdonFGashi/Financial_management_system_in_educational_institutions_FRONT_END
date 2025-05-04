import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ClockIcon,
  BuildingLibraryIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";
import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";

interface HistorikuEntry {
  id: number;
  shkollaId: number;
  shkollaEmri: string;
  shuma: number;
  lloji: "Ndarje" | "Shpenzim";
  dataTransaksionit: string;
  pershkrimi: string;
  selected?: boolean;
}

function Historiku() {
  const [entries, setEntries] = useState<HistorikuEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  const [filters, setFilters] = useState({
    shkolla: "",
    ngaData: "",
    deriData: "",
    lloji: "all"
  });

  // Mock data
  useEffect(() => {
    setEntries([
      {
        id: 1,
        shkollaId: 1,
        shkollaEmri: "Sami Frasheri",
        shuma: 500,
        lloji: "Ndarje",
        dataTransaksionit: "2025-05-25",
        pershkrimi: "Ndarja e rregullt mujore"
      },
      {
        id: 2,
        shkollaId: 2,
        shkollaEmri: "Xhevdet Doda",
        shuma: 250,
        lloji: "Shpenzim",
        dataTransaksionit: "2025-05-24",
        pershkrimi: "Pagesat e faturave"
      }
    ]);
  }, []);

  const handleFilter = () => {
    // Add filter logic here
    setToast({
      message: "Filtrat u aplikuan me sukses",
      type: "success"
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setEntries(entries.map(entry => ({
      ...entry,
      selected: !selectAll
    })));
  };

  const toggleSingleEntry = (id: number) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, selected: !entry.selected }
        : entry
    ));
  };

  const handleGeneratePDF = async () => {
    const selectedEntries = entries.filter(entry => entry.selected);
    
    if (selectedEntries.length === 0) {
      setToast({
        message: "Ju lutem selektoni së paku një regjistrim",
        type: "error"
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Gjenero PDF',
      text: `Dëshironi të gjeneroni PDF për ${selectedEntries.length} regjistrime?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Gjenero',
      cancelButtonText: 'Anulo'
    });

    if (result.isConfirmed) {
      try {
        // Logic here
        setToast({
          message: "PDF u gjenerua me sukses!",
          type: "success"
        });
      } catch (error) {
        setToast({
          message: "Ndodhi një gabim gjatë gjenerimit të PDF-së",
          type: "error"
        });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClockIcon className="w-7 h-7 text-indigo-600" />
            Historiku i Transaksioneve
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nga data:
              </label>
              <input
                type="date"
                value={filters.ngaData}
                onChange={(e) => setFilters({ ...filters, ngaData: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deri më:
              </label>
              <input
                type="date"
                value={filters.deriData}
                onChange={(e) => setFilters({ ...filters, deriData: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shkolla:
              </label>
              <input
                type="text"
                value={filters.shkolla}
                onChange={(e) => setFilters({ ...filters, shkolla: e.target.value })}
                placeholder="Shkolla..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <button
                onClick={handleFilter}
                className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
              >
                Filtro
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">Shkolla</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">Përshkrimi</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Shuma</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Lloji</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <input
                        type="checkbox"
                        checked={entry.selected}
                        onChange={() => toggleSingleEntry(entry.id)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingLibraryIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{entry.shkollaEmri}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-500">
                      {entry.pershkrimi}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`text-sm font-medium ${
                        entry.lloji === "Ndarje" ? "text-green-600" : "text-red-600"
                      }`}>
                        {entry.lloji === "Ndarje" ? "+" : "-"}{entry.shuma}€
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex justify-center">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${entry.lloji === "Ndarje" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        `}>
                          {entry.lloji === "Ndarje" ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                          {entry.lloji}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm text-gray-500">
                      {new Date(entry.dataTransaksionit).toLocaleDateString("sq-AL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add PDF button after the table */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGeneratePDF}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm font-medium"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Gjenero PDF
          </button>
        </div>
      </main>
    </div>
  );
}

export default Historiku;