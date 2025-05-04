import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import { urlPorosite } from "../../../endpoints";
import { 
  ClipboardDocumentCheckIcon, 
  BuildingOffice2Icon, 
  ClipboardDocumentListIcon, 
  AcademicCapIcon, 
  ArchiveBoxIcon 
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast"; 
import Swal from "sweetalert2";

function ListaPorosive() {
  const [porosite, setPorosite] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    pershkrimi: "",
    kompania: "",
    shkolla: "",
    data: "",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchPorosite();
  }, []);

  const fetchPorosite = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.pershkrimi) params.append("pershkrimi", filters.pershkrimi);
      if (filters.kompania) params.append("kompania", filters.kompania);
      if (filters.shkolla) params.append("shkolla", filters.shkolla);
      if (filters.data) params.append("data", filters.data);

      const response = await axios.get(`${urlPorosite}?${params.toString()}`);
      setPorosite(response.data.data || []);
    } catch (error) {
      console.error("Gabim duke marrë porositë:", error);
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

  const handlePaguaj = async (id: number) => {
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
        const res = await axios.patch(`${urlPorosite}/paguaj/${id}`);
        setToast({ message: res.data.message || "Porosia u pagua me sukses!", type: "success" });
        fetchPorosite();
      } catch (error) {
        console.error("Gabim gjatë pagesës:", error);
        setToast({ message: "Veprimi nuk u krye me sukses!", type: "error" });
      }
    }
  };

  const handleFshij = async (id: number) => {
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
        const res = await axios.patch(`${urlPorosite}/fshij/${id}`);
        setToast({ message: res.data.message || "Porosia u fshi me sukses!", type: "success" });
        fetchPorosite();
      } catch (error) {
        console.error("Gabim gjatë fshirjes:", error);
        setToast({ message: "Veprimi nuk u krye me sukses!", type: "error" });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800 relative">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" /> Lista e Porosive
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input
              type="text"
              name="pershkrimi"
              value={filters.pershkrimi}
              onChange={handleInputChange}
              placeholder="Përshkrimi"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              name="kompania"
              value={filters.kompania}
              onChange={handleInputChange}
              placeholder="Kompania"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              name="shkolla"
              value={filters.shkolla}
              onChange={handleInputChange}
              placeholder="Shkolla"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              name="data"
              value={filters.data}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleFilter}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition col-span-1"
            >
              Filtro
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {porosite.length > 0 ? (
            porosite
              .filter(p => p.statusi === "Ne Pritje")
              .map((porosi) => (
                <div key={porosi.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 hover:shadow-2xl transition relative group">
                  {/* Date Badge */}
                  <div className="absolute top-3 right-3 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {new Date(porosi.dataPorosise).toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold border-b pb-2">{porosi.produktiEmri}</h3>

                  {/* Body with icons */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <ClipboardDocumentListIcon className="h-4 w-4" />
                    <span><strong>Pershkrimi:</strong> {porosi.produktiPershkrimi || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <BuildingOffice2Icon className="h-4 w-4" />
                    <span><strong>Kompania:</strong> {porosi.kompaniaEmri}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span><strong>Shkolla:</strong> {porosi.shkollaEmri}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <ArchiveBoxIcon className="h-4 w-4" />
                    <span><strong>Sasia:</strong> {porosi.sasia}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handlePaguaj(porosi.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Paguaj
                    </button>
                    <button
                      onClick={() => handleFshij(porosi.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Fshij
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500 col-span-full">Nuk ka të dhëna për t'u shfaqur.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ListaPorosive;
