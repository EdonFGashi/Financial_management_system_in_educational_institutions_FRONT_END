import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  ClipboardDocumentCheckIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

function ListaPorosive() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" /> Lista e Porosive
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Përshkrimi", "Kompania", "Shkolla", "Data", "Fshira/Paguara"].map((label, idx) => (
              <input
                key={idx} 
                type="text"
                placeholder={label}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            ))}
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition col-span-1">
              Filtro
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                {["Përshkrimi", "Sasia", "Kompania", "Shkolla", "Data", "Fshi/Pagesa"].map((col, i) => (
                  <th key={i} className="px-4 py-3 border-b whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Laptop Dell</td>
                <td className="px-4 py-3">10</td>
                <td className="px-4 py-3">TechShpk</td>
                <td className="px-4 py-3">Shkolla "Naim Frashëri"</td>
                <td className="px-4 py-3">2025-04-10</td>
                <td className="px-4 py-3 font-medium">
                  <span className="text-red-600">Fshirë</span>
                  {/* OR */}
                  {/* <span className="text-green-600">Paguar</span> */}
                </td>
              </tr>
              {/* Additional rows could go here */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default ListaPorosive;
