import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

function RaportetPorosi() {
  const [emriRaportit, setEmriRaportit] = useState("");
  const [pathRaportit, setPathRaportit] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [records, setRecords] = useState([
    { id: 1, porosia: "Projektor HD", sasia: 2, kompania: "AlbaTech", shkolla: "Shkolla 'Iliria'", data: "2025-04-11", selected: false },
    { id: 2, porosia: "Laptop Dell", sasia: 5, kompania: "TechShpk", shkolla: "Shkolla 'Naim Frashëri'", data: "2025-04-12", selected: false },
  ]);

  const handleChoosePath = () => {
    const fakePath = "/path/to/your/report.docx";
    setPathRaportit(fakePath);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setRecords(prev =>
      prev.map(r => ({ ...r, selected: newSelectAll }))
    );
  };

  const toggleSingleRecord = (id: number) => {
    setRecords(prev =>
      prev.map(r =>
        r.id === id ? { ...r, selected: !r.selected } : r
      )
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" />
            Raportet e Porosive
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Report Info Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 space-y-6">
          {/* Emri i raportit + Path input */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col w-full md:max-w-sm">
              <label className="text-sm text-gray-600 mb-1">Emri i Raportit:</label>
              <input
                type="text"
                value={emriRaportit}
                onChange={(e) => setEmriRaportit(e.target.value)}
                placeholder="Shkruaj emrin e raportit..."
                className="p-3 border border-gray-300 rounded-md text-sm w-full"
              />
            </div>

            <div className="flex flex-col w-full md:max-w-md">
              <label className="text-sm text-gray-600 mb-1">Path i Raportit:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pathRaportit}
                  onChange={(e) => setPathRaportit(e.target.value)}
                  placeholder="/folderi/raporti1.pdf"
                  className="flex-1 p-3 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={handleChoosePath}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Zgjidh
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            <div>
              <label className="text-sm text-gray-600 mb-1">Nga data:</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1">Deri më:</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1">Kompania:</label>
              <select className="w-full p-3 border border-gray-300 rounded-md text-sm">
                <option>Të gjitha</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1">Shkolla:</label>
              <select className="w-full p-3 border border-gray-300 rounded-md text-sm">
                <option>Të gjitha</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Të paguara
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked /> Në pritje
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Të fshira
            </label>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition">
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
                <th className="px-4 py-3 border-b whitespace-nowrap">Porosia</th>
                <th className="px-4 py-3 border-b whitespace-nowrap">Sasia</th>
                <th className="px-4 py-3 border-b whitespace-nowrap">Kompania</th>
                <th className="px-4 py-3 border-b whitespace-nowrap">Shkolla</th>
                <th className="px-4 py-3 border-b whitespace-nowrap">Data</th>
                <th
                  onClick={toggleSelectAll}
                  className="px-4 py-3 border-b whitespace-nowrap cursor-pointer hover:underline"
                >
                  Përfshi {selectAll ? "(Ç'zgjedh të gjitha)" : "(Zgjidh të gjitha)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{rec.porosia}</td>
                  <td className="px-4 py-3">{rec.sasia}</td>
                  <td className="px-4 py-3">{rec.kompania}</td>
                  <td className="px-4 py-3">{rec.shkolla}</td>
                  <td className="px-4 py-3">{rec.data}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={rec.selected}
                      onChange={() => toggleSingleRecord(rec.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Generate Report Button */}
        <div className="mt-6">
          <button className="bg-indigo-700 text-white px-6 py-2 rounded-md hover:bg-indigo-800 transition">
            Gjenero Raportin
          </button>
        </div>
      </main>
    </div>
  );
}

export default RaportetPorosi;
