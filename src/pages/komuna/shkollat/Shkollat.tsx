import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  BuildingLibraryIcon, 
  XMarkIcon, 
  AcademicCapIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from 'sweetalert2';
import { urlListShkolla, urlShkolla } from "../../../endpoints"; 
import axiosInstance from "../../../api/axiosInstance";

interface School {
  id: number;
  emriShkolles: string;
  adresaId: number;
  adresa: {
    id: number;
    rruga: string;
    qyteti: string;
    shteti: string;
    kodiPostal: string;
  } | null;
  nrNxenesve: number;
  drejtori: number;
  person: {
    emri: string;
    mbiemri: string;
    adresa: {
      rruga: string;
      qyteti: string;
      shteti: string;
    } | null;
  };
  buxhetiAktual: number;
  buxhetiShfrytezuar: number;
  user: {
    email: string;
    id: string;  // Added this field
  };
  userId: string; // You might also need this field
}

function Shkollat() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [filters, setFilters] = useState({
    emri: "",
    nrNxenesve: "",
    buxheti: "",
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${urlListShkolla}/get-all`);
      if (response.data.succeeded) {
        setSchools(response.data.data);
      } else {
        setToast({ message: response.data.message || 'Gabim gjatë marrjes së të dhënave', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Ndodhi një gabim gjatë komunikimit me serverin', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.emri) queryParams.append('emri', filters.emri);
      if (filters.nrNxenesve) queryParams.append('nrNxenesve', filters.nrNxenesve);
      if (filters.buxheti) queryParams.append('buxheti', filters.buxheti);

      const response = await axiosInstance.get(`${urlListShkolla}/get-all?${queryParams}`);
      if (response.data.succeeded) {
        setSchools(response.data.data);
      } else {
        setToast({ message: response.data.message || 'Gabim gjatë filtrimit', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Ndodhi një gabim gjatë komunikimit me serverin', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'A jeni të sigurt?',
      text: "Nuk mund ta ktheni këtë veprim!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Po, fshije!',
      cancelButtonText: 'Anulo'
    });

    if (result.isConfirmed) {
      try {
        console.log("IDJ e shkolles: ",id);
        const response = await axiosInstance.delete(`${urlListShkolla}/${id}`);
        
        if (response.data.succeeded) {
          setSchools(prevSchools => prevSchools.filter(school => school.id !== id));
          Swal.fire({
            title: 'E fshirë!',
            text: response.data.message,
            icon: 'success',
            confirmButtonColor: '#4F46E5'
          });
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        Swal.fire({
          title: 'Gabim!',
          text: error instanceof Error ? error.message : 'Ndodhi një gabim gjatë fshirjes së shkollës',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSchool) return;

    try {
      const response = await axiosInstance.put(`${urlListShkolla}/${editingSchool.id}`, {
        id: editingSchool.id,
        emriShkolles: editingSchool.emriShkolles,
        nrNxenesve: editingSchool.nrNxenesve,
        drejtori: editingSchool.drejtori,
        adresaId: editingSchool.adresaId,
        userId: editingSchool.userId
      });
      
      if (response.data.succeeded) {
        // Preserve the existing school data and merge with update response
        setSchools(prevSchools =>
          prevSchools.map(school =>
            school.id === editingSchool.id 
              ? { 
                  ...school, 
                  ...response.data.data,
                  // Preserve nested objects if they're not in the response
                  person: response.data.data.person || school.person,
                  adresa: response.data.data.adresa || school.adresa
                } 
              : school
          )
        );
        setToast({ message: "Shkolla u përditësua me sukses!", type: "success" });
        setIsEditModalOpen(false);
        setEditingSchool(null);
        // Refresh the schools data to ensure we have the latest state
        fetchSchools();
      } else {
        throw new Error(response.data.message || "Ndodhi një gabim gjatë përditësimit");
      }
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Ndodhi një gabim gjatë përditësimit', 
        type: "error" 
      });
    }
  };

  // Calculate school statistics
  const calculateSchoolStats = () => {
    if (!schools || schools.length === 0) {
      return {
        totalSchools: 0,
        totalStudents: 0,
        totalBudget: 0,
        averageBudget: 0
      };
    }

    const totalSchools = schools.length;
    const totalStudents = schools.reduce((sum, school) => sum + (school.nrNxenesve || 0), 0);
    const totalBudget = schools.reduce((sum, school) => sum + (school.buxhetiAktual || 0), 0);
    const averageBudget = totalSchools > 0 ? totalBudget / totalSchools : 0;

    return {
      totalSchools,
      totalStudents,
      totalBudget,
      averageBudget
    };
  };

  const stats = calculateSchoolStats();

  // Update the location display in the table to handle null values safely
  const getLocationDisplay = (school: School) => {
    if (school.person?.adresa?.qyteti) {
      return school.person.adresa.qyteti;
    }
    if (school.adresa?.qyteti) {
      return school.adresa.qyteti;
    }
    return 'N/A';
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
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Menaxhimi i Shkollave</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Shikoni, shtoni dhe menaxhoni të dhënat e shkollave në komunën tuaj
                </p>
              </div>
              <Link
                to="/komuna/shto-shkolle"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium self-start"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Shto Shkollë
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Schools Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Totali i Shkollave</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-700 relative z-10">{stats.totalSchools}</p>
                )}
              </div>
              
              {/* Total Students Card */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-indigo-100 mb-3">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Totali i Nxënësve</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-indigo-700 relative z-10">{stats.totalStudents.toLocaleString()}</p>
                )}
              </div>
              
              {/* Total Budget Card */}
              <div className="bg-gradient-to-br from-white to-sky-50 rounded-xl shadow-sm border border-sky-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-100 to-sky-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-sky-100 mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-sky-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Buxheti Total</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-sky-700 relative z-10">
                    €{stats.totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                )}
              </div>
              
              {/* Average Budget Card */}
              <div className="bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-sm border border-cyan-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-cyan-100 mb-3">
                    <PresentationChartLineIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Buxheti Mesatar</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-cyan-700 relative z-10">
                    €{stats.averageBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section - Enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-blue-600" />
                Filtro Shkollat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emri i shkollës</label>
                  <input
                    type="text"
                    value={filters.emri}
                    onChange={(e) => setFilters({ ...filters, emri: e.target.value })}
                    placeholder="Emri i shkollës..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nr. i nxënësve</label>
                  <input
                    type="number"
                    value={filters.nrNxenesve}
                    onChange={(e) => setFilters({ ...filters, nrNxenesve: e.target.value })}
                    placeholder="Nr. i nxënësve..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buxheti (€)</label>
                  <input
                    type="number"
                    step="any"
                    min="-999999999"
                    value={filters.buxheti}
                    onChange={(e) => setFilters({ ...filters, buxheti: e.target.value })}
                    placeholder="Buxheti..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleFilter}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Filtro
                  </button>
                  <button
                    onClick={() => {
                      setFilters({
                        emri: "",
                        nrNxenesve: "",
                        buxheti: "",
                      });
                      fetchSchools();
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Pastro
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
                  <BuildingLibraryIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Shkollave
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Emri i shkollës</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Lokacioni</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Nr. i nxënësve</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Buxheti</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Veprimet</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools.length > 0 ? (
                        schools.map((school, index) => (
                          <tr
                            key={school.id}
                            className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.emriShkolles}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {getLocationDisplay(school)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{school.nrNxenesve}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              €{school.buxhetiAktual.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(school)}
                                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                  Modifiko
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleDelete(school.id)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  Fshij
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                            <BuildingLibraryIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk ka shkolla</h3>
                            <p className="text-gray-500">Nuk u gjetën shkolla që përputhen me kriteret e kërkimit.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit modal - Keep existing modal code */}
        {isEditModalOpen && editingSchool && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div 
              className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => setIsEditModalOpen(false)}
            ></div>

            <div className="flex min-h-screen items-center justify-center p-4">
              <div 
                className="bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out
                          scale-95 opacity-0 translate-y-4 animate-modal w-full max-w-2xl mx-auto"
                style={{
                  animation: 'modal-pop 0.3s ease-out forwards'
                }}
              >
                <style>
                  {`
                    @keyframes modal-pop {
                      0% {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                      }
                      100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                      }
                    }
                  `}
                </style>

                <div className="p-8 relative">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Modifiko Shkollën
                    </h3>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500 transition-colors duration-150 ease-in-out
                               hover:bg-gray-100 rounded-full p-2"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emri i shkollës</label>
                      <input
                        type="text"
                        value={editingSchool.emriShkolles}
                        onChange={(e) => setEditingSchool({ ...editingSchool, emriShkolles: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-150 ease-in-out shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numri i nxënësve</label>
                      <input
                        type="number"
                        value={editingSchool.nrNxenesve}
                        onChange={(e) => setEditingSchool({ ...editingSchool, nrNxenesve: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-150 ease-in-out shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Buxheti (€)</label>
                      <input
                        type="number"
                        value={editingSchool.buxhetiAktual}
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editingSchool.user.email}
                        onChange={(e) => setEditingSchool({ ...editingSchool, user: { ...editingSchool.user, email: e.target.value } })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-150 ease-in-out shadow-sm"
                      />
                    </div>

                    {/* Footer */}
                    <div className="col-span-2 flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 
                                 transition-colors duration-150 ease-in-out"
                      >
                        Anulo
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                                 transform active:scale-95 transition-all duration-150 ease-in-out shadow-sm"
                      >
                        Ruaj ndryshimet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default Shkollat;