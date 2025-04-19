import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

function RaportetPorosi() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" /> Raportet e Porosive
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Filter Form */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Emri..."
              className="p-2 border border-gray-300 rounded w-full text-sm"
            />
            <input
              type="text"
              placeholder="Path"
              className="p-2 border border-gray-300 rounded w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nga data:</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Deri më:</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Kompania:</label>
              <select className="w-full p-2 border border-gray-300 rounded text-sm">
                <option>Të gjitha</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Shkolla:</label>
              <select className="w-full p-2 border border-gray-300 rounded text-sm">
                <option>Të gjitha</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Të paguara
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked /> Në pritje
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Të fshira
            </label>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
              Filtro
            </button>
          </div>
        </div>

        {/* Report Table */}
        <h3 className="text-lg font-semibold mb-3">Lista që gjenerohet:</h3>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                {[
                  "Porosia",
                  "Sasia",
                  "Kompania",
                  "Shkolla",
                  "Data",
                  "Përfshi",
                ].map((col, i) => (
                  <th key={i} className="px-4 py-3 border-b whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Projektor HD</td>
                <td className="px-4 py-3">2</td>
                <td className="px-4 py-3">AlbaTech</td>
                <td className="px-4 py-3">Shkolla "Iliria"</td>
                <td className="px-4 py-3">2025-04-11</td>
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button className="bg-indigo-700 text-white px-6 py-2 rounded-md hover:bg-indigo-800 transition">
            Gjenero raportin
          </button>
        </div>
      </main>
    </div>
  );
}

export default RaportetPorosi;
