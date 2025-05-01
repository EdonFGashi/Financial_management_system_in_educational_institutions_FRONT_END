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
  buxhetiAktual: number; // Add this
}

function NdarjaBuxhetit() {
  const [schools, setSchools] = useState<School[]>([]);
  const [totalBudget, setTotalBudget] = useState(10230);
  const [remainingBudget, setRemainingBudget] = useState(542);
  const [selectedMonth, setSelectedMonth] = useState("Qershor 2025");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [autoAllocate, setAutoAllocate] = useState(false);
  const [daysInterval, setDaysInterval] = useState("5");

  // Add state for allocation input
  const [allocations, setAllocations] = useState<{ [key: number]: { amount: string; isPercentage: boolean } }>({});

  // Mock data
  useEffect(() => {
    setSchools([
      {
        id: 1,
        emri: "Sami Frasheri",
        nrNxenesve: 850,
        shfrytezimiAktual: 32,
        buxhetiTotal: 500,
        buxhetiAktual: 160  // 32% of 500
      },
      {
        id: 2,
        emri: "Xhevdet Doda",
        nrNxenesve: 720,
        shfrytezimiAktual: 63,
        buxhetiTotal: 400,
        buxhetiAktual: 252  // 63% of 400
      }
    ]);
  }, []);

  // Add handler for allocation type toggle
  const handleAllocationTypeToggle = (schoolId: number) => {
    setAllocations(prev => ({
      ...prev,
      [schoolId]: {
        amount: prev[schoolId]?.amount || '',
        isPercentage: !prev[schoolId]?.isPercentage
      }
    }));
  };

  // Add handler for allocation input change
  const handleAllocationChange = (schoolId: number, value: string) => {
    setAllocations(prev => ({
      ...prev,
      [schoolId]: {
        ...prev[schoolId],
        amount: value
      }
    }));
  };

  const handleAllocation = async (schoolId: number) => {
    const school = schools.find(s => s.id === schoolId);
    const allocation = allocations[schoolId];
    
    if (!school || !allocation?.amount) {
      setToast({
        message: "Ju lutem vendosni shumën për ndarje",
        type: "error"
      });
      return;
    }

    let allocationAmount: number;
    if (allocation.isPercentage) {
      allocationAmount = (parseFloat(allocation.amount) / 100) * school.buxhetiTotal;
    } else {
      allocationAmount = parseFloat(allocation.amount);
    }

    if (isNaN(allocationAmount) || allocationAmount <= 0) {
      setToast({
        message: "Shuma e ndarjes duhet të jetë pozitive",
        type: "error"
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmo ndarjen e buxhetit',
      text: `A jeni të sigurt që dëshironi të ndani ${allocationAmount}€ për shkollën "${school.emri}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Po, ndaj',
      cancelButtonText: 'Anulo'
    });

    if (result.isConfirmed) {
      try {
        // Update the school's budget utilization
        const updatedSchools = schools.map(s => {
          if (s.id === schoolId) {
            const newBuxhetiAktual = s.buxhetiAktual + allocationAmount;
            const newShfrytezimiAktual = (newBuxhetiAktual / s.buxhetiTotal) * 100;
            return {
              ...s,
              buxhetiAktual: newBuxhetiAktual,
              shfrytezimiAktual: Math.min(Math.round(newShfrytezimiAktual), 100)
            };
          }
          return s;
        });

        setSchools(updatedSchools);
        setAllocations(prev => ({ ...prev, [schoolId]: { amount: '', isPercentage: false } }));
        
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
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Për muajin:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option>Qershor 2025</option>
                <option>Korrik 2025</option>
                <option>Gusht 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ndarja automatike:
              </label>
              <div className="flex h-10 items-center">
                <input
                  type="checkbox"
                  checked={autoAllocate}
                  onChange={(e) => setAutoAllocate(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Auto</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çdo (ditë):
              </label>
              <select
                value={daysInterval}
                onChange={(e) => setDaysInterval(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                // disabled={!autoAllocate}
                
              >
                <option value="1">1 ditë</option>
                <option value="2">2 ditë</option>
                <option value="3">3 ditë</option>
                <option value="5">5 ditë</option>
                <option value="7">7 ditë</option>
                <option value="10">10 ditë</option>
                <option value="14">14 ditë</option>
                <option value="30">30 ditë</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <button
                onClick={() => {
                  // Add your filter logic here
                  setToast({
                    message: "Filtrat u aplikuan me sukses",
                    type: "success"
                  });
                }}
                className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
              >
                Filtro
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">Shkolla</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">Shfrytëzimi i buxhetit</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Shuma e ndarjes</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Ndarja automatike</th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Ndarja e fundit</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingLibraryIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{school.emri}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              school.shfrytezimiAktual > 50 ? 'bg-red-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${school.shfrytezimiAktual}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                          <span>{school.buxhetiAktual}€</span>
                          <span>{school.shfrytezimiAktual}%</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <input
                          type="number"
                          value={allocations[school.id]?.amount || ''}
                          onChange={(e) => handleAllocationChange(school.id, e.target.value)}
                          className="w-16 sm:w-24 p-1 sm:p-2 border border-gray-300 rounded-md text-xs sm:text-sm text-center"
                          placeholder="Shuma"
                        />
                        <button
                          onClick={() => handleAllocationTypeToggle(school.id)}
                          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {allocations[school.id]?.isPercentage ? '%' : '€'}
                        </button>
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      25/05/2025
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleAllocation(school.id)}
                          className="bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-indigo-700 transition"
                        >
                          Ndaj
                        </button>
                      </div>
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

export default NdarjaBuxhetit;