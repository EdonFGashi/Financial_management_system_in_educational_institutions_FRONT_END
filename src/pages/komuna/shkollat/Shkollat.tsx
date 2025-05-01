import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from 'sweetalert2';

// Mock data
const mockSchools = [
  {
    id: 1,
    emri: "Shkolla Fillore 'Hasan Prishtina'",
    lokacioni: "Prishtinë",
    nrNxenesve: 850,
    nrPersonalDrejtorit: "1234567890",
    email: "hasan.prishtina@shkolla.com",
    buxheti: 50000
  },
  {
    id: 2,
    emri: "Shkolla Fillore 'Gjergj Fishta'",
    lokacioni: "Prishtinë",
    nrNxenesve: 720,
    nrPersonalDrejtorit: "0987654321",
    email: "gjergj.fishta@shkolla.com",
    buxheti: 45000
  },
  {
    id: 3,
    emri: "Shkolla Fillore 'Naim Frashëri'",
    lokacioni: "Fushë Kosovë",
    nrNxenesve: 650,
    nrPersonalDrejtorit: "5678901234",
    email: "naim.frasheri@shkolla.com",
    buxheti: 40000
  }
];

function Shkollat() {
  const [schools, setSchools] = useState(mockSchools);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filters, setFilters] = useState({
    emri: "",
    nrPersonalDrejtorit: "",
    nrNxenesve: "",
    buxheti: "",
  });

  const handleFilter = () => {
    let filteredSchools = [...mockSchools];

    if (filters.emri) {
      filteredSchools = filteredSchools.filter(school => 
        school.emri.toLowerCase().includes(filters.emri.toLowerCase())
      );
    }

    if (filters.nrPersonalDrejtorit) {
      filteredSchools = filteredSchools.filter(school => 
        school.nrPersonalDrejtorit.includes(filters.nrPersonalDrejtorit)
      );
    }

    if (filters.nrNxenesve) {
      filteredSchools = filteredSchools.filter(school => 
        school.nrNxenesve >= parseInt(filters.nrNxenesve)
      );
    }

    if (filters.buxheti) {
      filteredSchools = filteredSchools.filter(school => 
        school.buxheti >= parseInt(filters.buxheti)
      );
    }

    setSchools(filteredSchools);
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
        // Add your API call here
        // For now, we'll just remove from state
        setSchools(prevSchools => prevSchools.filter(school => school.id !== id));
        
        Swal.fire({
          title: 'E fshirë!',
          text: 'Shkolla u fshi me sukses.',
          icon: 'success',
          confirmButtonColor: '#4F46E5'
        });
      } catch (error) {
        Swal.fire({
          title: 'Gabim!',
          text: 'Ndodhi një gabim gjatë fshirjes së shkollës',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  const handleEdit = (id: number) => {
    // For now just show a toast message
    setToast({ message: "Funksioni i modifikimit do të implementohet së shpejti!", type: "error" });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nr. personal i drejtorit</label>
              <input
                type="text"
                value={filters.nrPersonalDrejtorit}
                onChange={(e) => setFilters({ ...filters, nrPersonalDrejtorit: e.target.value })}
                placeholder="Nr. personal i drejtorit..."
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Buxheti ($)</label>
              <input
                type="number"
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
                    <td className="px-6 py-4">{school.emri}</td>
                    <td className="px-6 py-4">{school.lokacioni}</td>
                    <td className="px-6 py-4">{school.nrNxenesve}</td>
                    <td className="px-6 py-4">{school.buxheti} €</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(school.id)}
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
      </main>
    </div>
  );
}

export default Shkollat;