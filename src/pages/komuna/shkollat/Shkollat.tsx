import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BuildingLibraryIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from 'sweetalert2';
import { urlListShkolla, urlShkolla } from "../../../endpoints"; 
import axios from "axios";

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
      const response = await axios.get(`${urlListShkolla}/get-all`);
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

      const response = await axios.get(`${urlListShkolla}/get-all?${queryParams}`);
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
        const response = await axios.delete(`${urlListShkolla}/${id}`);
        
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
      const response = await axios.put(`${urlListShkolla}/${editingSchool.id}`, {
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

      <main className="flex-1 p-4 sm:p-6 md:p-10 relative">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BuildingLibraryIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" />
            Shkollat
          </h2>
          <Link
            to="/komuna/shto-shkolle"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            + Shto Shkollë
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emri i shkollës</label>
              <input
                type="text"
                value={filters.emri}
                onChange={(e) => setFilters({ ...filters, emri: e.target.value })}
                placeholder="Emri i shkollës..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nr. i nxënësve</label>
              <input
                type="number"
                value={filters.nrNxenesve}
                onChange={(e) => setFilters({ ...filters, nrNxenesve: e.target.value })}
                placeholder="Nr. i nxënësve..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <button
              onClick={handleFilter}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition h-[38px]"
            >
              Filtro
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Duke ngarkuar të dhënat...</div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-500">Emri i shkollës</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-500">Lokacioni</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-500">Nr. i nxënësve</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-500">Buxheti</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-500">Veprimet</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school, index) => (
                  <tr
                    key={school.id}
                    className={`
                      border-b border-gray-200 hover:bg-indigo-50 transition-colors
                      ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    `}
                  >
                    <td className="px-6 py-4">{school.emriShkolles}</td>
                    <td className="px-6 py-4">
                      {getLocationDisplay(school)}
                    </td>
                    <td className="px-6 py-4">{school.nrNxenesve}</td>
                    <td className="px-6 py-4">{school.buxhetiAktual} €</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(school)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Modifiko
                        </button>
                        <button
                          onClick={() => handleDelete(school.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Fshij
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Modal with animations */}
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

      </main>
    </div>
  );
}

export default Shkollat;