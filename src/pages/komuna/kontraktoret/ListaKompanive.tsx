import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  BuildingOffice2Icon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";

interface Kompania {
  id: number;
  emri: string;
  lokacioni: string;
  sherbimi: string;
  dataKrijimit: string;
}

function ListaKompanive() {
  const [kompanite, setKompanite] = useState<Kompania[]>([]);
  const [filters, setFilters] = useState({
    emri: "",
    lokacioni: "",
    sherbimi: "",
    data: "",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    // Add mock data
    const mockKompanite = [
      {
        id: 1,
        emri: "Construction LLC",
        lokacioni: "Prishtinë",
        sherbimi: "Materiale shkollore",
        dataKrijimit: "2025-01-15"
      },
      {
        id: 2,
        emri: "Tech Solutions",
        lokacioni: "Prizren",
        sherbimi: "Dru",
        dataKrijimit: "2025-02-20"
      },
      {
        id: 3,
        emri: "School Supplies Co",
        lokacioni: "Pejë",
        sherbimi: "Materiale shkollore",
        dataKrijimit: "2025-03-10"
      }
    ];
    setKompanite(mockKompanite);
  }, []);

  const fetchKompanite = () => {
    const filteredKompanite = kompanite.filter(kompania => {
      return (
        (!filters.emri || kompania.emri.toLowerCase().includes(filters.emri.toLowerCase())) &&
        (!filters.lokacioni || kompania.lokacioni.toLowerCase().includes(filters.lokacioni.toLowerCase())) &&
        (!filters.sherbimi || kompania.sherbimi.toLowerCase().includes(filters.sherbimi.toLowerCase())) &&
        (!filters.data || kompania.dataKrijimit.includes(filters.data))
      );
    });
    setKompanite(filteredKompanite);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilter = () => {
    fetchKompanite();
  };

  const handleFshij = async (id: number) => {
    const result = await Swal.fire({
      title: "A jeni i sigurt?",
      text: "Dëshironi të fshini këtë kompani?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Po, Fshij",
      cancelButtonText: "Anulo",
    });

    if (result.isConfirmed) {
      try {
        // simulim i api
        setKompanite(prevKompanite => prevKompanite.filter(k => k.id !== id));
        setToast({ message: "Kompania u fshi me sukses!", type: "success" });
      } catch (error) {
        setToast({ message: "Veprimi nuk u krye me sukses!", type: "error" });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BuildingOffice2Icon className="w-7 h-7 text-indigo-600" />
            Lista e Kompanive
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              name="emri"
              value={filters.emri}
              onChange={handleInputChange}
              placeholder="Emri"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              name="lokacioni"
              value={filters.lokacioni}
              onChange={handleInputChange}
              placeholder="Lokacioni"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              name="sherbimi"
              value={filters.sherbimi}
              onChange={handleInputChange}
              placeholder="Shërbimi"
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Filtro
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kompanite.length > 0 ? (
            kompanite.map((kompania) => (
              <div key={kompania.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-200">
                <div className="space-y-4">
                  {/* Header with title and date */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800">{kompania.emri}</h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {new Date(kompania.dataKrijimit).toLocaleDateString('sq-AL')}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPinIcon className="h-5 w-5" />
                        <span>{kompania.lokacioni}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                        <span>{kompania.sherbimi}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDaysIcon className="h-5 w-5" />
                        <span>{new Date(kompania.dataKrijimit).toLocaleDateString('sq-AL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Link
                      to={`/komuna/kompanite/modifiko/${kompania.id}`}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Modifiko
                    </Link>
                    <button
                      onClick={() => handleFshij(kompania.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Fshij
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              Nuk ka të dhëna për t'u shfaqur.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ListaKompanive;