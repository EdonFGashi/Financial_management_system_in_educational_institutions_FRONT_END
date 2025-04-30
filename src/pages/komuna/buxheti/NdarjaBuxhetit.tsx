import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";

interface School {
  id: number;
  emri: string;
  nrNxenesve: number;
  shfrytezimiAktual: number;
  buxhetiTotal: number;
}

function NdarjaBuxhetit() {
  const [schools, setSchools] = useState<School[]>([]);
  const [totalBudget, setTotalBudget] = useState(10230);
  const [remainingBudget, setRemainingBudget] = useState(542);
  const [selectedMonth, setSelectedMonth] = useState("Qershor 2025");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [autoAllocate, setAutoAllocate] = useState(false);
  const [daysInterval, setDaysInterval] = useState("5");

  // Mock data
  useEffect(() => {
    setSchools([
      {
        id: 1,
        emri: "Sami Frasheri",
        nrNxenesve: 850,
        shfrytezimiAktual: 32,
        buxhetiTotal: 250
      },
      {
        id: 2,
        emri: "Xhevdet Doda",
        nrNxenesve: 720,
        shfrytezimiAktual: 63,
        buxhetiTotal: 120
      }
    ]);
  }, []);

  const handleAllocation = async (schoolId: number) => {
    const result = await Swal.fire({
      title: 'Konfirmo ndarjen e buxhetit',
      text: "A jeni të sigurt që dëshironi të ndani buxhetin?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Po, ndaj',
      cancelButtonText: 'Anulo'
    });

    if (result.isConfirmed) {
      try {
        // API call would go here
        setToast({
          message: "Buxheti u nda me sukses!",
          type: "success"
        });
      } catch (error) {
        setToast({
          message: "Ndodhi një gabim gjatë ndarjes së buxhetit",
          type: "error"
        });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-indigo-600" />
            Ndarja e Buxhetit
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-green-700 font-semibold mb-2">Buxheti në dispozicion:</h3>
            <p className="text-3xl font-bold text-green-600">{totalBudget} €</p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h3 className="text-red-700 font-semibold mb-2">Buxheti i ndarë:</h3>
            <p className="text-3xl font-bold text-red-600">{remainingBudget} €</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Për muajin:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option>Qershor 2025</option>
                <option>Korrik 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ndarja automatike:</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoAllocate}
                  onChange={(e) => setAutoAllocate(e.target.checked)}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm">Auto</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çdo (ditë):</label>
              <select
                value={daysInterval}
                onChange={(e) => setDaysInterval(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={!autoAllocate}
              >
                <option>5</option>
                <option>10</option>
                <option>15</option>
                <option>30</option>
              </select>
            </div>

            <button
              onClick={() => {}}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              Filtro
            </button>
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shkolla</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shfrytëzimi i buxhetit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shuma e ndarjes</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ndarja automatike</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ndarja e fundit</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schools.map((school) => (
                <tr key={school.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <BuildingLibraryIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">{school.emri}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          school.shfrytezimiAktual > 50 ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${school.shfrytezimiAktual}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      {school.shfrytezimiAktual}% / 100%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{school.buxhetiTotal} € / %</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600" />
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    25/05/2025
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleAllocation(school.id)}
                      className="bg-indigo-600 text-white px-4 py-1 rounded-md text-sm hover:bg-indigo-700 transition"
                    >
                      Ndaj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default NdarjaBuxhetit;