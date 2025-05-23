import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import { 
  BanknotesIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UsersIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import axiosInstance from "../../../api/axiosInstance";
import {
  urlListShkolla,
  urlNdalesat,
  urlShkolla,
  urlStafi,
} from "../../../endpoints";

interface Ndalesa {
  id: number;
  stafiShkollesId: number;
  arsyeja: string;
  shumaNdaleses: number;
  data: string;
  aprovuari: boolean;
}

interface Staff {
  id: number;
  emri: string;
  mbiemri: string;
  shkollaId: number;
}

interface Shkolla {
  id: number;
  emriShkolles: string;
}

interface Record {
  id: number;
  emri: string;
  mbiemri: string;
  ndalesa: number;
  arsyeja: string;
  shkolla: string;
  data: string;
}

function Financat() {
  const [ndalesat, setNdalesat] = useState<Ndalesa[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shkollat, setShkollat] = useState<Shkolla[]>([]);
  const [records, setRecords] = useState<Record[]>([]); // filtered records
  const [allRecords, setAllRecords] = useState<Record[]>([]); // all records (unfiltered)
  const [filters, setFilters] = useState({
    emri: "",
    shkolla: "",
    data: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal States for "Ndalo"
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null); // Selected record to edit
  const [shuma, setShuma] = useState<number>(0); // Editable "shuma" field

  // Add state for metrics
  const [financialMetrics, setFinancialMetrics] = useState({
    totalDeductions: 0,
    averageDeduction: 0,
    numberOfStaff: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update fetchAllData to calculate metrics
  const fetchAllData = async () => {
    try {
      const [ndRes, staffRes, shkollaRes] = await Promise.all([
        axiosInstance.get(`${urlNdalesat}/paginated`, {
          params: { page: 1, recordsPerPage: 100 },
        }),
        axiosInstance.get(`${urlStafi}/paginated`, {
          params: { page: 1, recordsPerPage: 100 },
        }),
        axiosInstance.get(`${urlListShkolla}/get-all`),
      ]);

      setNdalesat(ndRes.data.data);

      const shkollaData = Array.isArray(shkollaRes.data.data)
        ? shkollaRes.data.data
        : [];
      setShkollat(shkollaData); // Set the schools data

      const staffWithShkolla = staffRes.data?.data?.map((staff: Staff) => {
        const shkolla = shkollaData.find(
          (shkolla: Shkolla) => shkolla.id === staff.shkollaId
        );
        return {
          ...staff,
          shkolla: shkolla ? shkolla.emriShkolles : "—",
        };
      });

      const combined: Record[] = ndRes.data.data.map((n: Ndalesa) => {
        const staff = staffWithShkolla?.find(
          (x: Staff) => x.id === n.stafiShkollesId
        );

        return {
          id: n.id,
          emri: staff?.emri || "—",
          mbiemri: staff?.mbiemri || "",
          ndalesa: n.shumaNdaleses,
          arsyeja: n.arsyeja,
          shkolla: staff?.shkolla || "—",
          data: n.data,
        };
      });

      setRecords(combined);
      setAllRecords(combined); // Save unfiltered records as well

      // Calculate metrics
      const totalDeductions = combined.reduce((sum, item) => sum + item.ndalesa, 0);
      const averageDeduction = combined.length > 0 ? totalDeductions / combined.length : 0;
      const numberOfStaff = staffWithShkolla?.length || 0;

      setFinancialMetrics({
        totalDeductions,
        averageDeduction,
        numberOfStaff
      });
      
    } catch (err) {
      console.error(err);
      setToast({
        message: "Gabim gjatë ngarkimit të të dhënave",
        type: "error",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    const filtered = allRecords.filter((r) => {
      const matchEmri = `${r.emri} ${r.mbiemri}`
        .toLowerCase()
        .includes(filters.emri.toLowerCase());
      const matchShkolla = r.shkolla
        .toLowerCase()
        .includes(filters.shkolla.toLowerCase());
      const matchData = !filters.data || r.data.startsWith(filters.data);
      return matchEmri && matchShkolla && matchData;
    });
    setRecords(filtered);
  };

  const handleNdalo = (record: Record) => {
    setSelectedRecord(record);
    setShuma(record.ndalesa); // Set the "shuma" field to the current amount
    setModalOpen(true); // Open the modal for editing
  };

  const handleSubmit = async () => {
    if (!selectedRecord) return;

    try {
      const updatedRecord = { ...selectedRecord, shumaNdaleses: shuma, aprovuari: true };
      
      // Send the updated data to the backend using axiosInstance
      // await axiosInstance.put(`${urlNdalesat}/${selectedRecord.id}`, updatedRecord);

      await axiosInstance.delete(`${urlNdalesat}/${selectedRecord.id}`);

      // Close the modal and refresh data
      setModalOpen(false);
      fetchAllData();

      setToast({ message: "Ndalesa u aprovua dhe shuma u ndryshua!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Gabim gjatë përditësimit të të dhënave", type: "error" });
    }
  };

  // Delete Record - Updated to use axiosInstance
  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`${urlNdalesat}/${id}`);
      fetchAllData(); // Re-fetch data after deletion
      setToast({
        message: "Ndalesa u fshi",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: "Gabim gjatë fshirjes së të dhënave",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 pb-16 overflow-y-auto">
        {/* Toast notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Financat</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Menaxhoni ndalesat dhe financat e institucioneve arsimore
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

        {/* Financial Metrics Dashboard */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Deductions Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <BanknotesIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Shuma Totale e Ndalesave</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700 relative z-10">
                  €{financialMetrics.totalDeductions.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
              
              {/* Average Deduction Card */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-indigo-100 mb-3">
                    <ArrowTrendingDownIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Ndalesa Mesatare</h3>
                </div>
                <p className="text-3xl font-bold text-indigo-700 relative z-10">
                  €{financialMetrics.averageDeduction.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
              
              {/* Staff Count Card */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-purple-100 mb-3">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Numri i Stafit</h3>
                </div>
                <p className="text-3xl font-bold text-purple-700 relative z-10">{financialMetrics.numberOfStaff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Enhanced styling */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-blue-600" />
                Filtro Ndalesat
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emri</label>
                  <input
                    type="text"
                    name="emri"
                    value={filters.emri}
                    onChange={handleInputChange}
                    placeholder="Emri dhe Mbiemri..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shkolla</label>
                  <input
                    type="text"
                    name="shkolla"
                    value={filters.shkolla}
                    onChange={handleInputChange}
                    placeholder="Emri i shkollës..."
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
                    onClick={handleFilter}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" /> Filtro
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
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Ndalesave
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Emri
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Ndalesa €
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Arsyeja
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Shkolla
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Veprimet
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.length > 0 ? (
                      records.map((r, index) => (
                        <tr key={r.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {`${r.emri} ${r.mbiemri}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                            {r.ndalesa} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                            {r.arsyeja}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {r.shkolla}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(r.data).toLocaleDateString("sq-AL")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => handleNdalo(r)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                Ndalo
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                              >
                                Fshij
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                          <BanknotesIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk ka ndalesa</h3>
                          <p className="text-gray-500">Nuk u gjetën ndalesa që përputhen me kriteret e kërkimit.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Ndalo - Enhanced styling */}
        {modalOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                Ndalo Pagesën
              </h3>
              
              <div className="mb-6">
                <div className="mb-1 flex justify-between">
                  <label htmlFor="shuma" className="block text-sm font-medium text-gray-700">
                    Shuma (€)
                  </label>
                  <span className="text-sm text-gray-500">Për: {selectedRecord.emri} {selectedRecord.mbiemri}</span>
                </div>
                <input
                  type="number"
                  id="shuma"
                  value={shuma}
                  onChange={(e) => setShuma(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Anulo
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Konfirmo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pattern background style */}
        <style>
          {`
          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0V4h-2V0h-4v2h4v4h2V2h4V0h-4zM0 34v-4H2v4h4v2H2v4H0v-4H2v-2H0zM0 0V4h2V0h4v2H2v4H0V2h4V0H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          `}
        </style>
      </main>
    </div>
  );
}

export default Financat;
