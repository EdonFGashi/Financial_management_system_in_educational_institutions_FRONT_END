import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  BuildingOffice2Icon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  IdentificationIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import axios from "axios";
import { urlKompania } from "../../../endpoints";

interface Kompania {
  id: number;
  emri: string;
  pronariId: number;
  sherbimi: string;
  nrXhirologaris: number;
  adresaId: number;
  userId: string;
  createdAt: string;
  lokacioni?: string;
}

interface KompaniaForm {
  emri: string;
  pronariId: number;
  sherbimi: string;
  nrXhirologaris: number;
  adresaId: number;
}

function ListaKompanive() {
  const [kompanite, setKompanite] = useState<Kompania[]>([]);
  const [filters, setFilters] = useState({
    emri: "",
    nrXhirologaris: "",
    sherbimi: "",
    data: "",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKompania, setSelectedKompania] = useState<Kompania | null>(null);
  const [formData, setFormData] = useState<KompaniaForm>({
    emri: "",
    pronariId: 0,
    sherbimi: "",
    nrXhirologaris: 0,
    adresaId: 0
  });

  useEffect(() => {
    fetchKompanite();
  }, []);

  const fetchKompanite = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.emri) params.append("emri", filters.emri);
      if (filters.nrXhirologaris) params.append("nrXhirologaris", filters.nrXhirologaris);
      if (filters.sherbimi) params.append("sherbimi", filters.sherbimi);
      if (filters.data) params.append("data", filters.data);

      const response = await axios.get(`${urlKompania}?${params.toString()}`);
      const data = Array.isArray(response.data) ? response.data : response.data.data;
      setKompanite(data);
    } catch (error) {
      console.error("Error fetching kompanite:", error);
      setToast({
        message: "Ndodhi një gabim gjatë marrjes së të dhënave",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
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
        await axios.delete(`${urlKompania}/${id}`);
        setToast({ message: "Kompania u fshi me sukses!", type: "success" });
        fetchKompanite(); // Refresh the list
      } catch (error) {
        console.error("Error deleting kompania:", error);
        setToast({ message: "Veprimi nuk u krye me sukses!", type: "error" });
      }
    }
  };

  const handleModifiko = (kompania: Kompania) => {
    setSelectedKompania(kompania);
    setFormData({
      emri: kompania.emri,
      pronariId: kompania.pronariId,
      sherbimi: kompania.sherbimi,
      nrXhirologaris: kompania.nrXhirologaris,
      adresaId: kompania.adresaId
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedKompania(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['pronariId', 'nrXhirologaris', 'adresaId'].includes(name)
        ? value === '' ? 0 : Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKompania) return;
  
    try {
      const payload = {
        ...formData,
        nrXhirologaris: Number(formData.nrXhirologaris)
      };
  
      const response = await axios.put(`${urlKompania}/${selectedKompania.id}`, payload);
      setToast({ message: "Kompania u modifikua me sukses!", type: "success" });
      handleModalClose();
      fetchKompanite();
    } catch (error) {
      console.error("Error updating kompania:", error);
      setToast({ message: "Ndodhi një gabim gjatë modifikimit!", type: "error" });
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
              type="number"
              name="nrXhirologaris"
              value={filters.nrXhirologaris}
              onChange={handleInputChange}
              placeholder="Nr. Xhirologaris"
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kompanite.length > 0 ? (
              kompanite.map((kompania) => (
                <div key={kompania.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-200">
                  <div className="space-y-4">
                    {/* Header with title and status */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800">{kompania.emri}</h3>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {new Date(kompania.createdAt).toLocaleDateString('sq-AL')}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 gap-3">
                        {kompania.pronariId && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <UserCircleIcon className="h-5 w-5" />
                            <span className="text-sm">Pronari ID: {kompania.pronariId}</span>
                          </div>
                        )}

                        {kompania.lokacioni && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPinIcon className="h-5 w-5" />
                            <span className="text-sm">{kompania.lokacioni}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <WrenchScrewdriverIcon className="h-5 w-5" />
                          <span className="text-sm">{kompania.sherbimi}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <IdentificationIcon className="h-5 w-5" />
                          <span className="text-sm">Nr. Xhirologaris: {kompania.nrXhirologaris}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleModifiko(kompania)}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Modifiko
                      </button>
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
        )}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            style={{
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative transform transition-all"
              style={{
                animation: "slideIn 0.3s ease-out"
              }}
            >
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes slideIn {
                    from { 
                      opacity: 0;
                      transform: scale(0.95) translateY(-20px);
                    }
                    to { 
                      opacity: 1;
                      transform: scale(1) translateY(0);
                    }
                  }
                `}
              </style>
      
              <button
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <h3 className="text-xl font-bold mb-6 text-gray-900">Modifiko Kompaninë</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emri
                  </label>
                  <input
                    type="text"
                    name="emri"
                    value={formData.emri}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pronari ID
                  </label>
                  <input
                    type="number"
                    name="pronariId"
                    value={formData.pronariId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shërbimi
                  </label>
                  <input
                    type="text"
                    name="sherbimi"
                    value={formData.sherbimi}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nr. Xhirologaris
                  </label>
                  <input
                    type="number"
                    name="nrXhirologaris"
                    value={formData.nrXhirologaris}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresa ID
                  </label>
                  <input
                    type="number"
                    name="adresaId"
                    value={formData.adresaId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Anulo
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transform hover:scale-105 transition-all"
                  >
                    Ruaj Ndryshimet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListaKompanive;