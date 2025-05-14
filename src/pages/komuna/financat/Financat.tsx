import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Toast from '../../../components/Toast';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

interface Ndalesa {
  id: number;
  emri: string;
  ndalesa: number;
  arsyeja: string;
  shkolla: string;
  data: string;
}

// Mock data
const mockNdalesat: Ndalesa[] = [
  {
    id: 1,
    emri: "Filan Fisteku",
    ndalesa: 50,
    arsyeja: "Mungese",
    shkolla: "Sami Frasheri",
    data: "2025-05-13"
  },
  {
    id: 2,
    emri: "John Doe",
    ndalesa: 75,
    arsyeja: "Vonese",
    shkolla: "Hasan Prishtina",
    data: "2025-05-12"
  }
];

function Financat() {
  const [ndalesat, setNdalesat] = useState<Ndalesa[]>(mockNdalesat);
  const [filters, setFilters] = useState({
    emri: "",
    shkolla: "",
    data: ""
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    const filtered = mockNdalesat.filter(ndalesa => {
      const matchEmri = ndalesa.emri.toLowerCase().includes(filters.emri.toLowerCase());
      const matchShkolla = ndalesa.shkolla.toLowerCase().includes(filters.shkolla.toLowerCase());
      const matchData = !filters.data || ndalesa.data === filters.data;
      return matchEmri && matchShkolla && matchData;
    });
    setNdalesat(filtered);
  };

  const handleNdalo = async (id: number) => {
    const result = await Swal.fire({
      title: "A jeni i sigurt?",
      text: "Dëshironi të ndaloni këtë pagesë?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Po, Ndalo",
      cancelButtonText: "Anulo",
    });

    if (result.isConfirmed) {
      // Mock successful action
      setToast({ message: "Pagesa u ndal me sukses!", type: "success" });
    }
  };

  const handleFshij = async (id: number) => {
    const result = await Swal.fire({
      title: "A jeni i sigurt?",
      text: "Dëshironi të fshini këtë ndalese?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Po, Fshij",
      cancelButtonText: "Anulo",
    });

    if (result.isConfirmed) {
      const updatedNdalesat = ndalesat.filter(n => n.id !== id);
      setNdalesat(updatedNdalesat);
      setToast({ message: "Ndalesa u fshi me sukses!", type: "success" });
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
            <BanknotesIcon className="w-7 h-7 text-indigo-600" />
            Lista e ndalesave
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm"
            >
              Filtro
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ndalesa €
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arsyeja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shkolla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veprimet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ndalesat.map((ndalesa) => (
                  <tr key={ndalesa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ndalesa.emri}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ndalesa.ndalesa} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ndalesa.arsyeja}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ndalesa.shkolla}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(ndalesa.data).toLocaleDateString('sq-AL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleNdalo(ndalesa.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ndalo
                      </button>
                      <button
                        onClick={() => handleFshij(ndalesa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Fshij
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Financat;
