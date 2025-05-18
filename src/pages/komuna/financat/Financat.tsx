import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import axios from "axios";
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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [ndRes, staffRes, shkollaRes] = await Promise.all([
        axios.get(`${urlNdalesat}/paginated`, {
          params: { page: 1, recordsPerPage: 100 },
        }),
        axios.get(`${urlStafi}/paginated`, {
          params: { page: 1, recordsPerPage: 100 },
        }),
        axios.get(`${urlListShkolla}/get-all`),
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
      
      // Send the updated data to the backend
      await axios.put(`${urlNdalesat}/${selectedRecord.id}`, updatedRecord);

      await axios.delete(`${urlNdalesat}/${selectedRecord.id}`);

      // Close the modal and refresh data
      setModalOpen(false);
      fetchAllData();

      setToast({ message: "Ndalesa u aprovua dhe shuma u ndryshua!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Gabim gjatë përditësimit të të dhënave", type: "error" });
    }
  };

  // Delete Record
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${urlNdalesat}/${id}`);
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

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Emri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ndalesa €
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Arsyeja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Shkolla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Veprimet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${r.emri} ${r.mbiemri}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {r.ndalesa} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {r.arsyeja}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {r.shkolla}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(r.data).toLocaleDateString("sq-AL")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleNdalo(r)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ndalo
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
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

      {/* Modal for Ndalo */}
      {modalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Ndalo Pagesën</h3>
            <div className="mb-4">
              <label htmlFor="shuma" className="block text-sm text-gray-700">
                Shuma (€)
              </label>
              <input
                type="number"
                id="shuma"
                value={shuma}
                onChange={(e) => setShuma(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-sm text-gray-800 rounded-md hover:bg-gray-400"
              >
                Anulo
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-sm text-white rounded-md hover:bg-indigo-700"
              >
                Submito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financat;
