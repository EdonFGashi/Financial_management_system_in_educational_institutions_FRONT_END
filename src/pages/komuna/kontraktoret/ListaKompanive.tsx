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
  XMarkIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import axiosInstance from "../../../api/axiosInstance";
import { urlKompania } from "../../../endpoints";

interface Kompania {
  id: number;
  emriKompanis: string;
  pronariId: number;
  sherbimi: string;
  nrXhirologaris: number;
  adresaId: number;
  userId: string;
  createdAt: string;
  lokacioni?: string;
  person: {
    emri: string,
    mbiemri: string,
    adresa: {
      rruga: string,
      qyteti: string,
      shteti: string,
      kodiPostal: number,
    },
  }
 
}

interface KompaniaForm {
  emriKompanis: string;
  pronariId: number;
  sherbimi: string;
  nrXhirologaris: number;
  adresaId: number;
  rruga?: string;
  emri: string,
  mbiemri: string,
}

function ListaKompanive() {
  const [kompanite, setKompanite] = useState<Kompania[]>([]);
  const [filters, setFilters] = useState({
    emri: "",
    nrXhirologaris: "",
    sherbimi: "",
    data: ""
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKompania, setSelectedKompania] = useState<Kompania | null>(null);
  const [formData, setFormData] = useState<KompaniaForm>({
    emriKompanis: "",
    pronariId: 0,
    sherbimi: "",
    nrXhirologaris: 0,
    adresaId: 0, 
    rruga: "",
    emri: "",
    mbiemri: ""
  });

  // Add state for dashboard metrics
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalCompanies: 0,
    serviceCategories: 0,
    mostRecentCompany: ''
  });

  useEffect(() => {
    fetchKompanite();
  }, []);

  // Add useEffect to calculate dashboard metrics when companies data changes
  useEffect(() => {
    calculateDashboardMetrics();
  }, [kompanite]);

  const calculateDashboardMetrics = () => {
    if (!kompanite || kompanite.length === 0) {
      setDashboardMetrics({
        totalCompanies: 0,
        serviceCategories: 0,
        mostRecentCompany: ''
      });
      return;
    }

    // Calculate total companies
    const totalCompanies = kompanite.length;

    // Calculate unique service categories
    const uniqueServices = new Set(kompanite.map(k => k.sherbimi));
    const serviceCategories = uniqueServices.size;

    // Find most recent company
    const sortedCompanies = [...kompanite].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecentCompany = sortedCompanies[0]?.emriKompanis || '';

    setDashboardMetrics({
      totalCompanies,
      serviceCategories,
      mostRecentCompany
    });
  };

  const fetchKompanite = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.emri) params.append("emri", filters.emri);
      if (filters.nrXhirologaris) params.append("nrXhirologaris", filters.nrXhirologaris);
      if (filters.sherbimi) params.append("sherbimi", filters.sherbimi);
      if (filters.data) params.append("data", filters.data);

      const response = await axiosInstance.get(`${urlKompania}?${params.toString()}`, {
        // headers: {
        //   'Accept-Charset': 'utf-8'
        // }
      });
      console.log("Response from API:", response.data);
      // Update to handle the new Response<List<KompaniaDto>> structure
      if (response.data && response.data.data) {
        setKompanite(response.data.data);
      } else {
        setKompanite([]);
        setToast({
          message: "Nuk u gjetën të dhëna",
          type: "error"
        });
      }
    } catch (error: any) {
      console.error("Error fetching kompanite:", error);
      setToast({
        message: error.response?.data?.message || "Ndodhi një gabim gjatë marrjes së të dhënave",
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
      [name]: name === 'nrXhirologaris' ? (value === '' ? '' : value) : value
    }));
  };

  const handleFilter = async () => {
    const cardsContainer = document.querySelector('#cardsContainer') as HTMLDivElement;
    if (cardsContainer) {
      // First fade out existing cards
      const existingCards = cardsContainer.querySelectorAll('.card-appear-cascade');
      existingCards.forEach((card, i) => {
        (card as HTMLElement).style.animation = `fadeOutSlide 0.3s ${i * 50}ms forwards`;
      });

      // Wait for fadeout
      await new Promise(resolve => setTimeout(resolve, existingCards.length * 50 + 300));
      
      // Fetch new data
      await fetchKompanite();
    }
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
        const response = await axiosInstance.delete(`${urlKompania}/${id}`);
        if (response.data.succeeded) {
          setToast({ message: "Kompania u fshi me sukses!", type: "success" });
          fetchKompanite();
        } else {
          throw new Error(response.data.message || "Gabim gjatë fshirjes");
        }
      } catch (error: any) {
        console.error("Error deleting kompania:", error);
        setToast({ 
          message: error.response?.data?.message || "Veprimi nuk u krye me sukses!", 
          type: "error" 
        });
      }
    }
  };

  const handleModifiko = (kompania: Kompania) => {
    setSelectedKompania(kompania);
    setFormData({
      emriKompanis: kompania.emriKompanis,
      pronariId: kompania.pronariId,
      sherbimi: kompania.sherbimi,
      nrXhirologaris: kompania.nrXhirologaris,
      adresaId: kompania.adresaId,
      rruga: kompania.person.adresa.rruga,
      emri: kompania.person.emri,
      mbiemri: kompania.person.mbiemri,
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
      [name]: ['pronariId', 'nrXhirologaris', 'rruga'].includes(name)
        ? value === '' ? 0 : Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKompania) return;
  
    const result = await Swal.fire({
      title: 'A jeni i sigurt?',
      text: 'Dëshironi të modifikoni të dhënat e kompanisë?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Po, Modifiko',
      cancelButtonText: 'Anulo'
    });
  
    if (result.isConfirmed) {
      try {
        const payload = {
          ...formData,
          nrXhirologaris: Number(formData.nrXhirologaris)
        };
  
        const response = await axiosInstance.put(`${urlKompania}/${selectedKompania.id}`, payload);
        if (response.data.succeeded) {
          setToast({ message: "Kompania u modifikua me sukses!", type: "success" });
          handleModalClose();
          fetchKompanite();
        } else {
          throw new Error(response.data.message || "Gabim gjatë modifikimit");
        }
      } catch (error: any) {
        console.error("Error updating kompania:", error);
        setToast({ 
          message: error.response?.data?.message || "Ndodhi një gabim gjatë modifikimit!", 
          type: "error" 
        });
      }
    }
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

        {/* Blue header with pattern - Removed "Shto Kompani" button */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Kontraktorët</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Menaxhoni kompanitë që ofrojnë shërbime për institucionet arsimore
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

        {/* Dashboard Metrics */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Companies Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Kompanitë Totale</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-700 relative z-10">{dashboardMetrics.totalCompanies}</p>
                )}
              </div>
              
              {/* Service Categories Card */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-indigo-100 mb-3">
                    <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Kategori Shërbimesh</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-indigo-700 relative z-10">{dashboardMetrics.serviceCategories}</p>
                )}
              </div>
              
              {/* Most Recent Company Card */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-purple-100 mb-3">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Kompania më e Re</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-xl font-bold text-purple-700 relative z-10 truncate">
                    {dashboardMetrics.mostRecentCompany || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-blue-600" />
                Filtro Kompanitë
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emri i Kompanisë</label>
                  <input
                    type="text"
                    name="emri"
                    value={filters.emri}
                    onChange={handleInputChange}
                    placeholder="Emri i kompanisë..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nr. Xhirologaris</label>
                  <input
                    type="number"
                    name="nrXhirologaris"
                    value={filters.nrXhirologaris}
                    onChange={handleInputChange}
                    placeholder="Nr. Xhirologaris..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shërbimi</label>
                  <input
                    type="text"
                    name="sherbimi"
                    value={filters.sherbimi}
                    onChange={handleInputChange}
                    placeholder="Shërbimi..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    name="data"
                    value={filters.data}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    id="filterButton"
                    onClick={handleFilter}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Filtro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Cards - Enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-blue-800 bg-blue-100">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Duke ngarkuar të dhënat...
                </div>
              </div>
            ) : (
              <div 
                id="cardsContainer" 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                {kompanite.length > 0 ? (
                  kompanite.map((kompania, index) => (
                    <div 
                      key={kompania.id} 
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200 card-appear-cascade border border-gray-100"
                      style={{ 
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="space-y-4">
                        {/* Header with title and creation date */}
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
                            {kompania.emriKompanis}
                          </h3>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                            <CalendarDaysIcon className="w-3 h-3 mr-1" />
                            {new Date(kompania.createdAt).toLocaleDateString('sq-AL')}
                          </span>
                        </div>
                        
                        {/* Company Info */}
                        <div className="border-t border-gray-100 pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <UserCircleIcon className="h-5 w-5 text-gray-500" />
                              <span className="text-sm font-medium">Pronari:</span>
                              <span className="text-sm text-gray-700">{kompania.person?.emri} {kompania.person?.mbiemri}</span>
                            </div>
                            
                            {kompania.person?.adresa?.qyteti && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPinIcon className="h-5 w-5 text-gray-500" />
                                <span className="text-sm font-medium">Lokacioni:</span>
                                <span className="text-sm text-gray-700">{kompania.person.adresa.rruga}, {kompania.person.adresa.qyteti}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <WrenchScrewdriverIcon className="h-5 w-5 text-gray-500" />
                              <span className="text-sm font-medium">Shërbimi:</span>
                              <span className="text-sm text-gray-700">{kompania.sherbimi}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <IdentificationIcon className="h-5 w-5 text-gray-500" />
                              <span className="text-sm font-medium">Nr. Xhirologaris:</span>
                              <span className="text-sm text-gray-700">{kompania.nrXhirologaris}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleModifiko(kompania)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Detajet
                          </button>
                          <button
                            onClick={() => handleFshij(kompania.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Fshij
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
                    <BuildingOffice2Icon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk u gjetën kompani</h3>
                    <p className="text-gray-500">Nuk u gjetën kompani që përputhen me kriteret e kërkimit.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal with improved styling */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            style={{
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative transform transition-all"
              style={{
                animation: "slideIn 0.3s ease-out"
              }}
            >
              <button
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <BuildingOffice2Icon className="w-6 h-6 text-blue-600" />
                Detajet e Kompanisë
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kompania
                  </label>
                  <input
                    type="text"
                    name="emriKompanis"
                    value={formData.emriKompanis}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emri i Pronarit
                  </label>
                  <input
                    type="text"
                    name="emri"
                    disabled
                    value={`${formData.emri} ${formData.mbiemri}`}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresa
                  </label>
                  <input
                    type="text"
                    name="rruga"
                    value={formData.rruga || ""}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Mbyll
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      
        {/* Pattern background style */}
        <style>
          {`
          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          
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
          @keyframes fadeOutSlide {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
          }
      
          @keyframes fadeInSlide {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes cardAppear {
            0% {
              opacity: 0;
              transform: scale(0.7) translateY(30px);
            }
            70% {
              transform: scale(1.05) translateY(-5px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
      
          .card-appear {
            animation: cardAppear 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          }
      
          .card-appear-cascade {
            opacity: 0;
            animation: cardAppear 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          }
          `}
        </style>
      </main>
    </div>
  );
}

export default ListaKompanive;