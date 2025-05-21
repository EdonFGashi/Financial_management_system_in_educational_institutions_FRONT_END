import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  BuildingOffice2Icon,
  DocumentTextIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import { urlMarreveshja, urlKompania } from "../../../endpoints";
import axiosInstance from "../../../api/axiosInstance";
import Swal from "sweetalert2";

interface Kompania {
  id: number;
  emriKompanis: string;
  sherbimi: string;
  pronariId: number;
  person: {
    emri: string;
    mbiemri: string;
    adresa: {
      qyteti: string;
      rruga: string;
    }
  };
  createdAt: string;
}

interface Marreveshje {
  id: number;
  komunaId: number;
  kompaniaId: number;
  statusi: string;
  ngaData: string;
  deriMeData: string;
  createdAt: string;
  updatedAt: string;
  komuna: any;
  kompania: Kompania | null;
}

interface PaginationInfo {
  page: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
}

function MarreveshjetKontraktoreve() {
  const [marreveshjet, setMarreveshjet] = useState<Marreveshje[]>([]);
  const [kompanite, setKompanite] = useState<Map<number, Kompania>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingKompani, setLoadingKompani] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    recordsPerPage: 10,
    totalRecords: 0,
    totalPages: 0
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMarreveshje, setSelectedMarreveshje] = useState<Marreveshje | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add state for the create modal and form
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    kompaniaId: 0,
    ngaData: "",
    deriMeData: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchKompanite().then(() => {
      fetchMarreveshjet(pagination.page, pagination.recordsPerPage);
    });
  }, []);

  const fetchKompanite = async () => {
    try {
      setLoadingKompani(true);
      const response = await axiosInstance.get(`${urlKompania}`);
      
      if (response.data && response.data.succeeded) {
        const kompaniMap = new Map<number, Kompania>();
        
        // Map the company data from the response
        response.data.data.forEach((kompani: any) => {
          console.log("Adding company to map:", kompani.id, kompani.emriKompanis);
          kompaniMap.set(kompani.id, {
            id: kompani.id,
            emriKompanis: kompani.emriKompanis,
            sherbimi: kompani.sherbimi,
            pronariId: kompani.pronariId,
            person: kompani.person,
            createdAt: kompani.createdAt
          });
        });
        
        setKompanite(kompaniMap);
        console.log("Companies map created with size:", kompaniMap.size);
        return kompaniMap; // Return the map for chaining
      } else {
        console.error("Failed to fetch companies:", response.data?.message);
        return new Map<number, Kompania>(); // Return empty map
      }
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      setToast({
        message: error.response?.data?.message || "Ndodhi një gabim gjatë marrjes së kompanive",
        type: "error"
      });
      return new Map<number, Kompania>(); // Return empty map
    } finally {
      setLoadingKompani(false);
    }
  };

  const fetchMarreveshjet = async (page: number, recordsPerPage: number) => {
    try {
      setLoading(true);
      
      // Build query parameters - simplified without filters
      const params = new URLSearchParams();
      params.append('Page', page.toString());
      params.append('RecordsPerPage', recordsPerPage.toString());
      
      const response = await axiosInstance.get(`${urlMarreveshja}/paginated?${params.toString()}`);
      
      if (response.data && response.data.succeeded) {
        console.log("Fetched agreements:", response.data.data);
        
        const marreveshjetWithCompanies = response.data.data.map((marreveshje: Marreveshje) => {
          const kompaniData = kompanite.get(marreveshje.kompaniaId);
          
          // If kompania is not populated in the response, find it from our kompanite map
          if (!marreveshje.kompania && kompaniData) {
            return {
              ...marreveshje,
              kompania: kompaniData
            };
          }
          return marreveshje;
        });
        
        setMarreveshjet(marreveshjetWithCompanies);
        setPagination({
          page: response.data.page,
          recordsPerPage: response.data.recordsPerPage,
          totalRecords: response.data.totalRecords,
          totalPages: response.data.totalPages
        });
      } else {
        setToast({
          message: response.data?.message || "Nuk u gjetën të dhëna",
          type: "error"
        });
      }
    } catch (error: any) {
      console.error("Error fetching agreements:", error);
      setToast({
        message: error.response?.data?.message || "Ndodhi një gabim gjatë marrjes së të dhënave",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchMarreveshjet(newPage, pagination.recordsPerPage);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aktive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Aktive
          </span>
        );
      case 'përfunduar':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Përfunduar
          </span>
        );
      case 'në pritje':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            Në Pritje
          </span>
        );
      case 'joaktive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Joaktive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle search filter client-side - Improved version
  const filteredMarreveshje = searchTerm
    ? marreveshjet.filter(m => {
        // Check company name in the joined kompania object
        if (m.kompania?.emriKompanis?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // If kompania is null or doesn't contain the search term, check the companies map
        const kompaniFromMap = kompanite.get(m.kompaniaId);
        if (kompaniFromMap?.emriKompanis?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // If we still haven't found a match, check other fields that might be relevant
        if (kompaniFromMap?.sherbimi?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // Optionally check owner name
        if (m.kompania?.person && 
            (`${m.kompania.person.emri} ${m.kompania.person.mbiemri}`)
              .toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        if (kompaniFromMap?.person && 
            (`${kompaniFromMap.person.emri} ${kompaniFromMap.person.mbiemri}`)
              .toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        return false;
      })
    : marreveshjet;

  // Helper functions for company data display
  const getCompanyName = (marreveshje: Marreveshje) => {
    // First try the kompania property from the marreveshje object
    if (marreveshje.kompania?.emriKompanis) {
      return marreveshje.kompania.emriKompanis;
    }
    
    // Then try to find it in our local kompanite map
    const kompaniData = kompanite.get(marreveshje.kompaniaId);
    if (kompaniData?.emriKompanis) {
      return kompaniData.emriKompanis;
    }
    
    // Fallback to ID
    return `Kompania ID: ${marreveshje.kompaniaId}`;
  };

  const getCompanyService = (marreveshje: Marreveshje) => {
    // First try the kompania property from the marreveshje object
    if (marreveshje.kompania?.sherbimi) {
      return marreveshje.kompania.sherbimi;
    }
    
    // Then try to find it in our local kompanite map
    const kompaniData = kompanite.get(marreveshje.kompaniaId);
    if (kompaniData?.sherbimi) {
      return kompaniData.sherbimi;
    }
    
    // Fallback
    return "N/A";
  };

  const getCompanyOwner = (marreveshje: Marreveshje) => {
    // First try from the marreveshje
    if (marreveshje.kompania?.person) {
      return `${marreveshje.kompania.person.emri} ${marreveshje.kompania.person.mbiemri}`;
    }
    
    // Then from our map
    const kompaniData = kompanite.get(marreveshje.kompaniaId);
    if (kompaniData?.person) {
      return `${kompaniData.person.emri} ${kompaniData.person.mbiemri}`;
    }
    
    return null;
  };

  // Calculate dashboard metrics
  const getTotalActiveAgreements = () => {
    return marreveshjet.filter(m => 
      m.statusi.toLowerCase() === 'aktive'
    ).length;
  };

  const getTotalCompletedAgreements = () => {
    return marreveshjet.filter(m => 
      m.statusi.toLowerCase() === 'përfunduar'
    ).length;
  };
  
  const getAgreementsEndingSoon = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return marreveshjet.filter(m => {
      if (m.statusi.toLowerCase() !== 'aktive') return false;
      const endDate = new Date(m.deriMeData);
      return endDate > today && endDate <= thirtyDaysFromNow;
    }).length;
  };

  // Function to get details of a specific agreement (view only)
  const viewMarreveshjeDetails = async (id: number) => {
    await fetchMarreveshjeDetails(id);
    setEditMode(false);
  };

  // Function to get details of a specific agreement (edit mode)
  const editMarreveshjeDetails = async (id: number) => {
    await fetchMarreveshjeDetails(id);
    setEditMode(true);
  };

  // Function to get details of a specific agreement
  const fetchMarreveshjeDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${urlMarreveshja}/${id}`);
      
      if (response.data && response.data.succeeded) {
        const marreveshje = response.data.data;
        
        // If kompania is not populated, try to get it from our map
        if (!marreveshje.kompania && kompanite.has(marreveshje.kompaniaId)) {
          marreveshje.kompania = kompanite.get(marreveshje.kompaniaId);
        }
        
        setSelectedMarreveshje(marreveshje);
        setNewEndDate(marreveshje.deriMeData.split('T')[0]); // Format date for input
        setDetailsModalOpen(true);
      } else {
        setToast({
          message: response.data?.message || "Nuk u gjet marrëveshja",
          type: "error"
        });
      }
    } catch (error: any) {
      console.error("Error fetching agreement details:", error);
      setToast({
        message: error.response?.data?.message || "Ndodhi një gabim gjatë marrjes së detajeve",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to update the end date of an agreement
  const handleUpdateEndDate = async () => {
    if (!selectedMarreveshje || !newEndDate) return;
    
    try {
      setUpdating(true);
      
      // Format the date according to what the backend expects
      const formattedDate = new Date(newEndDate).toISOString();
      console.log("Sending update with date:", formattedDate);
      
      const response = await axiosInstance.put(`${urlMarreveshja}/${selectedMarreveshje.id}`, formattedDate, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.succeeded) {
        setToast({
          message: "Afati i marrëveshjes u përditësua me sukses",
          type: "success"
        });
        setDetailsModalOpen(false);
        setSelectedMarreveshje(null);
        fetchMarreveshjet(pagination.page, pagination.recordsPerPage);
      } else {
        setToast({
          message: response.data?.message || "Ndodhi një gabim gjatë përditësimit",
          type: "error"
        });
      }
    } catch (error: any) {
      console.error("Error updating agreement:", error);
      setToast({
        message: error.response?.data?.message || "Ndodhi një gabim gjatë përditësimit",
        type: "error"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Function to delete an agreement
  const handleDeleteMarreveshje = async (id: number) => {
    const result = await Swal.fire({
      title: 'A jeni i sigurt?',
      text: "Ky veprim nuk mund të kthehet!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Po, fshije!',
      cancelButtonText: 'Anulo'
    });
    
    if (result.isConfirmed) {
      try {
        setDeleting(true);
        const response = await axiosInstance.delete(`${urlMarreveshja}/${id}`);
        
        if (response.data && response.data.succeeded) {
          setToast({
            message: "Marrëveshja u fshi me sukses",
            type: "success"
          });
          fetchMarreveshjet(pagination.page, pagination.recordsPerPage);
        } else {
          setToast({
            message: response.data?.message || "Ndodhi një gabim gjatë fshirjes",
            type: "error"
          });
        }
      } catch (error: any) {
        console.error("Error deleting agreement:", error);
        setToast({
          message: error.response?.data?.message || "Ndodhi një gabim gjatë fshirjes",
          type: "error"
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  // Update the action buttons in the table row
  const renderActionButtons = (marreveshje: Marreveshje) => (
    <div className="flex justify-end gap-2">
      <button 
        onClick={() => viewMarreveshjeDetails(marreveshje.id)}
        className="bg-blue-50 text-blue-700 p-1.5 rounded-md hover:bg-blue-100"
        title="Shiko detajet"
      >
        <DocumentTextIcon className="h-5 w-5" />
      </button>
      <button 
        onClick={() => editMarreveshjeDetails(marreveshje.id)}
        className="bg-indigo-50 text-indigo-700 p-1.5 rounded-md hover:bg-indigo-100"
        title="Ndrysho afatin"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>
      <button 
        onClick={() => handleDeleteMarreveshje(marreveshje.id)}
        disabled={deleting} 
        className={`${deleting ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-700 hover:bg-red-100'} p-1.5 rounded-md transition-colors`}
        title="Fshi marrëveshjen"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  // Function to handle form changes for create modal
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: name === 'kompaniaId' ? parseInt(value) : value
    }));
  };

  // Function to create a new agreement
  const handleCreateMarreveshje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.kompaniaId || !createForm.ngaData || !createForm.deriMeData) {
      setToast({
        message: "Ju lutem plotësoni të gjitha fushat",
        type: "error"
      });
      return;
    }

    try {
      setCreating(true);
      
      const payload = {
        kompaniaId: createForm.kompaniaId,
        ngaData: new Date(createForm.ngaData).toISOString(),
        deriMeData: new Date(createForm.deriMeData).toISOString()
      };
      
      const response = await axiosInstance.post(urlMarreveshja, payload);
      
      if (response.data && response.data.succeeded) {
        setToast({
          message: "Marrëveshja u krijua me sukses",
          type: "success"
        });
        setCreateModalOpen(false);
        setCreateForm({
          kompaniaId: 0,
          ngaData: "",
          deriMeData: ""
        });
        fetchMarreveshjet(pagination.page, pagination.recordsPerPage);
      } else {
        setToast({
          message: response.data?.message || "Ndodhi një gabim gjatë krijimit të marrëveshjes",
          type: "error"
        });
      }
    } catch (error: any) {
      console.error("Error creating agreement:", error);
      setToast({
        message: error.response?.data?.message || "Ndodhi një gabim gjatë krijimit të marrëveshjes",
        type: "error"
      });
    } finally {
      setCreating(false);
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

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Marrëveshjet e Kontraktorëve</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Menaxhoni marrëveshjet dhe kontratat me kompanitë që ofrojnë shërbime për institucionet arsimore
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/komuna/dashboard"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  ← Kthehu te Dashboard
                </Link>
                <button 
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  <PlusIcon className="w-5 h-5" />
                  Shto Marrëveshje
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section - Smaller and more compact */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Total Agreements Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[80px] -z-0"></div>
                <div className="flex flex-col items-start mb-1 relative z-10">
                  <div className="p-2 rounded-lg bg-blue-100 mb-2">
                    <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Totali i Marrëveshjeve</h3>
                </div>
                {loading ? (
                  <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-blue-700 relative z-10">{marreveshjet.length}</p>
                )}
              </div>
              
              {/* Active Agreements Card */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-bl-[80px] -z-0"></div>
                <div className="flex flex-col items-start mb-1 relative z-10">
                  <div className="p-2 rounded-lg bg-green-100 mb-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Marrëveshje Aktive</h3>
                </div>
                {loading ? (
                  <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-green-600 relative z-10">{getTotalActiveAgreements()}</p>
                )}
              </div>
              
              {/* Completed Agreements Card */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-[80px] -z-0"></div>
                <div className="flex flex-col items-start mb-1 relative z-10">
                  <div className="p-2 rounded-lg bg-indigo-100 mb-2">
                    <ClockIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Marrëveshje të Përfunduara</h3>
                </div>
                {loading ? (
                  <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-indigo-600 relative z-10">{getTotalCompletedAgreements()}</p>
                )}
              </div>
              
              {/* Ending Soon Card */}
              <div className="bg-gradient-to-br from-white to-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-bl-[80px] -z-0"></div>
                <div className="flex flex-col items-start mb-1 relative z-10">
                  <div className="p-2 rounded-lg bg-yellow-100 mb-2">
                    <ExclamationCircleIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Përfundojnë së Shpejti</h3>
                </div>
                {loading ? (
                  <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-yellow-600 relative z-10">{getAgreementsEndingSoon()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Lista e marrëveshjeve</h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Kërko sipas emrit të kompanisë..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agreements Table */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-blue-800 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Duke ngarkuar të dhatat...
                  </div>
                </div>
              ) : filteredMarreveshje.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kompania
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shërbimi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statusi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nga Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deri Më
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Veprime
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMarreveshje.map((marreveshje) => (
                        <tr key={marreveshje.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-700">
                                <BuildingOffice2Icon className="h-6 w-6" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {getCompanyName(marreveshje)}
                                </div>
                                {getCompanyOwner(marreveshje) && (
                                  <div className="text-xs text-gray-500">
                                    {getCompanyOwner(marreveshje)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getCompanyService(marreveshje)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(marreveshje.statusi)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(marreveshje.ngaData)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(marreveshje.deriMeData)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {renderActionButtons(marreveshje)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Duke shfaqur <span className="font-medium">{(pagination.page - 1) * pagination.recordsPerPage + 1}</span> deri në{' '}
                            <span className="font-medium">
                              {Math.min(pagination.page * pagination.recordsPerPage, pagination.totalRecords)}
                            </span>{' '}
                            nga <span className="font-medium">{pagination.totalRecords}</span> rezultate
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handleChangePage(pagination.page - 1)}
                              disabled={pagination.page === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              &larr;
                            </button>
                            
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handleChangePage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === pagination.page
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => handleChangePage(pagination.page + 1)}
                              disabled={pagination.page === pagination.totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              &rarr;
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <DocumentTextIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nuk u gjetën marrëveshje</h3>
                  <p className="text-gray-500 mt-1 max-w-md text-center">
                    Nuk u gjetën marrëveshje që përputhen me kriteret e kërkimit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {detailsModalOpen && selectedMarreveshje && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative animate-scale-in">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedMarreveshje(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
              
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                {editMode ? "Ndrysho Marrëveshjen" : "Detajet e Marrëveshjes"}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-1">Kompania</h4>
                  <p className="text-gray-800 text-lg font-semibold">
                    {getCompanyName(selectedMarreveshje)}
                  </p>
                  {getCompanyOwner(selectedMarreveshje) && (
                    <p className="text-gray-600 text-sm">{getCompanyOwner(selectedMarreveshje)}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Shërbimi</h4>
                    <p className="text-gray-800">{getCompanyService(selectedMarreveshje)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Statusi</h4>
                    <div>{getStatusBadge(selectedMarreveshje.statusi)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Nga Data</h4>
                    <p className="text-gray-800">{formatDate(selectedMarreveshje.ngaData)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Deri Më</h4>
                    <p className="text-gray-800">{formatDate(selectedMarreveshje.deriMeData)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Krijuar më</h4>
                  <p className="text-gray-800">{formatDate(selectedMarreveshje.createdAt)}</p>
                </div>
                
                {editMode && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ndrysho afatin e marrëveshjes</h4>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <button
                        onClick={handleUpdateEndDate}
                        disabled={updating || !newEndDate}
                        className={`${
                          updating || !newEndDate
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white px-4 py-2 rounded-lg transition`}
                      >
                        {updating ? 'Duke u ruajtur...' : 'Ruaj ndryshimet'}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-6 pt-4 border-t">
                  {editMode ? (
                    <button
                      onClick={() => handleDeleteMarreveshje(selectedMarreveshje.id)}
                      className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                    >
                      <TrashIcon className="h-4 w-4" /> Fshi marrëveshjen
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <PencilSquareIcon className="h-4 w-4" /> Ndrysho afatin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      setSelectedMarreveshje(null);
                      setEditMode(false);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Mbyll
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Agreement Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-0 relative animate-scale-in overflow-hidden">
              {/* Modal Header with gradient background */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <PlusIcon className="h-6 w-6" />
                  Shto Marrëveshje të Re
                </h3>
                <p className="text-green-100 text-sm mt-1">Krijoni një marrëveshje të re me një kontraktor</p>
              </div>
              
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-green-100"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
              
              <div className="p-6">
                <form onSubmit={handleCreateMarreveshje} className="space-y-5">
                  {/* Company Selection */}
                  <div>
                    <label htmlFor="kompaniaId" className="block text-sm font-medium text-gray-700 mb-1">
                      Zgjidhni Kompaninë
                    </label>
                    <div className="relative">
                      <select
                        id="kompaniaId"
                        name="kompaniaId"
                        value={createForm.kompaniaId}
                        onChange={handleCreateFormChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                        required
                      >
                        <option value="">-- Zgjidhni një kompani --</option>
                        {Array.from(kompanite.values()).map(kompania => (
                          <option key={kompania.id} value={kompania.id}>
                            {kompania.emriKompanis} - {kompania.sherbimi}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <BuildingOffice2Icon className="h-5 w-5" />
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {createForm.kompaniaId > 0 && kompanite.get(createForm.kompaniaId) && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
                        <p className="font-medium">{kompanite.get(createForm.kompaniaId)?.emriKompanis}</p>
                        <p className="text-green-600 text-xs mt-0.5">
                          {kompanite.get(createForm.kompaniaId)?.person && 
                            `${kompanite.get(createForm.kompaniaId)?.person.emri} ${kompanite.get(createForm.kompaniaId)?.person.mbiemri}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Date Range Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Periudha e Vlefshmërisë
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ngaData" className="block text-xs font-medium text-gray-500 mb-1">
                          Nga Data
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            id="ngaData"
                            name="ngaData"
                            value={createForm.ngaData}
                            onChange={handleCreateFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="deriMeData" className="block text-xs font-medium text-gray-500 mb-1">
                          Deri Më
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            id="deriMeData"
                            name="deriMeData"
                            value={createForm.deriMeData}
                            onChange={handleCreateFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                            required
                            min={createForm.ngaData} // Prevent end date before start date
                          />
                        </div>
                      </div>
                    </div>
                    
                    {createForm.ngaData && createForm.deriMeData && (
                      <div className="mt-3 text-xs text-gray-500">
                        Marrëveshja do të jetë e vlefshme nga <span className="font-medium text-gray-700">{formatDate(createForm.ngaData)}</span> deri më <span className="font-medium text-gray-700">{formatDate(createForm.deriMeData)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Anulo
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !createForm.kompaniaId || !createForm.ngaData || !createForm.deriMeData}
                      className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                        creating || !createForm.kompaniaId || !createForm.ngaData || !createForm.deriMeData
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                      }`}
                    >
                      {creating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Duke ruajtur...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          Ruaj Marrëveshjen
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Pattern background style */}
        <style>
          {`
          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 4V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          
          @keyframes scale-in {
            0% {
              transform: scale(0.95);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}
        </style>
      </main>
    </div>
  );
}

export default MarreveshjetKontraktoreve;
