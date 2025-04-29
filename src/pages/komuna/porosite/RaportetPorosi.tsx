import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import { urlRaporti } from "../../../endpoints";
import Toast from "../../../components/Toast";

function RaportetPorosi() {
  const [emriRaportit, setEmriRaportit] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [filters, setFilters] = useState({
    kompania: "",
    shkolla: "",
    ngaData: "",
    deriData: "",
    statuset: ["Ne Pritje"],
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

  const handleGenerateRaport = async () => {
    try {
      const selectedIds = records.filter((r) => r.selected).map((r) => r.id);

      if (selectedIds.length === 0) {
        setToast({ message: "Ju lutem përzgjidhni porositë që doni të përfshini.", type: "error" });
        return;
      }
      if (!emriRaportit.trim()) {
        setToast({ message: "Ju lutem vendosni emrin e raportit.", type: "error" });
        return;
      }

      setGenerating(true);

      const response = await axios.post(
        `${urlRaporti}/gjenero`,
        {
          selectedIds,
          emriRaportit,
          pathRaportit: "",
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${emriRaportit}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setToast({ message: "Raporti u gjenerua dhe u shkarkua me sukses!", type: "success" });
    } catch (error) {
      console.error("Gabim gjatë gjenerimit të raportit:", error);
      setToast({ message: "Gabim gjatë gjenerimit të raportit.", type: "error" });
    } finally {
      setGenerating(false);
    }
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

        {/* Filters and Inputs */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 mb-1">Emri i Raportit:</label>
              <input
                type="text"
                value={emriRaportit}
                onChange={(e) => setEmriRaportit(e.target.value)}
                placeholder="Shkruaj emrin e raportit, p.sh. Porositë Prill 2025"
                className="p-3 border border-gray-300 rounded-md w-full text-sm"
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <input
              type="date"
              value={filters.ngaData}
              onChange={(e) => setFilters({ ...filters, ngaData: e.target.value })}
              className="p-3 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              value={filters.deriData}
              onChange={(e) => setFilters({ ...filters, deriData: e.target.value })}
              className="p-3 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              value={filters.kompania}
              onChange={(e) => setFilters({ ...filters, kompania: e.target.value })}
              placeholder="Kompania..."
              className="p-3 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              value={filters.shkolla}
              onChange={(e) => setFilters({ ...filters, shkolla: e.target.value })}
              placeholder="Shkolla..."
              className="p-3 border border-gray-300 rounded-md text-sm"
            />
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

        {/* Table */}
        <h3 className="text-lg font-semibold mb-3">Lista e Porosive:</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Duke ngarkuar të dhënat...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 border-b">Porosia</th>
                  <th className="px-4 py-3 border-b">Sasia</th>
                  <th className="px-4 py-3 border-b">Kompania</th>
                  <th className="px-4 py-3 border-b">Shkolla</th>
                  <th className="px-4 py-3 border-b">Data</th>
                  <th className="px-4 py-3 border-b">Statusi</th>
                  <th
                    onClick={toggleSelectAll}
                    className="px-4 py-3 border-b cursor-pointer hover:underline"
                  >
                    {selectAll ? "Ç'zgjedh të gjitha" : "Zgjidh të gjitha"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{rec.porosia}</td>
                    <td className="px-4 py-3">{rec.sasia}</td>
                    <td className="px-4 py-3">{rec.kompania}</td>
                    <td className="px-4 py-3">{rec.shkolla}</td>
                    <td className="px-4 py-3">{new Date(rec.data).toLocaleDateString("sq-AL")}</td>
                    <td className="px-4 py-3">{rec.statusi}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={rec.selected}
                        onChange={() => toggleSingleRecord(rec.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleGenerateRaport}
            disabled={generating}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              generating
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-700 hover:bg-indigo-800 text-white"
            }`}
          >
            {generating ? "Duke gjeneruar..." : "Gjenero Raportin"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default RaportetPorosi;
