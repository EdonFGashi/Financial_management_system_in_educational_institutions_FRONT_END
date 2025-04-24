import { useState } from "react";
import Sidebar from "../Sidebar";

interface Porosi {
    id: number;
    item: string;
    sasia: number;
    data: string;
    cmimiTotal: number;
    aprovuar: boolean;
    kompania: string;
}

const companyOptions = ["Albi Office", "TechKosova", "EduSupply", "PrintMaster", "OfficeMart"];

const mockData: Porosi[] = Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    item: ["Lapsa", "Laptop", "Tabela", "Printer", "Projektor", "Karrige", "Dritare", "Router", "Switch", "Klasor"][i % 10],
    sasia: (i + 2) % 20 + 1,
    data: `2025-04-${(i % 28) + 1}`.padStart(10, "0"),
    cmimiTotal: Math.floor(Math.random() * 500) + 50,
    aprovuar: i % 2 === 0,
    kompania: companyOptions[i % companyOptions.length],
}));

function Historiku() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredPorosite = mockData.filter((p) => {
        const matchStart = !startDate || new Date(p.data) >= new Date(startDate);
        const matchEnd = !endDate || new Date(p.data) <= new Date(endDate);
        const matchCompany = !selectedCompany || p.kompania === selectedCompany;
        const matchMin = !minPrice || p.cmimiTotal >= parseFloat(minPrice);
        const matchMax = !maxPrice || p.cmimiTotal <= parseFloat(maxPrice);
        return matchStart && matchEnd && matchCompany && matchMin && matchMax;
    });

    const totalPages = Math.ceil(filteredPorosite.length / itemsPerPage);
    const paginatedPorosite = filteredPorosite.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Historiku i Porosive</h1>
                    <p className="text-base sm:text-lg text-green-100">Filtro dhe shiko porositë</p>
                </div>

                {/* Filters */}
                <div className="px-4 sm:px-6 md:px-12 py-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Date filters */}
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />

                    {/* Dropdown for company */}
                    <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Zgjidh kompaninë</option>
                        {companyOptions.map((c, idx) => (
                            <option key={idx} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Min/Max price */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Çmimi min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Çmimi max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="px-4 sm:px-6 md:px-12 pb-10 overflow-x-auto">
                    <table className="w-full bg-white rounded-xl shadow-md text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                        <tr>
                            <th className="py-3 px-4 text-left">#</th>
                            <th className="py-3 px-4 text-left">Item</th>
                            <th className="py-3 px-4 text-left">Sasia</th>
                            <th className="py-3 px-4 text-left">Data</th>
                            <th className="py-3 px-4 text-left">Çmimi Total</th>
                            <th className="py-3 px-4 text-left">Aprovuar</th>
                            <th className="py-3 px-4 text-left">Kompania</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedPorosite.length > 0 ? (
                            paginatedPorosite.map((p) => (
                                <tr key={p.id} className="border-t border-gray-200">
                                    <td className="py-3 px-4">{p.id}</td>
                                    <td className="py-3 px-4">{p.item}</td>
                                    <td className="py-3 px-4">{p.sasia}</td>
                                    <td className="py-3 px-4">{p.data}</td>
                                    <td className="py-3 px-4">€{p.cmimiTotal.toFixed(2)}</td>
                                    <td className="py-3 px-4">{p.aprovuar ? "Po" : "Jo"}</td>
                                    <td className="py-3 px-4">{p.kompania}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-6 text-center text-gray-500">Nuk u gjet asnjë porosi.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    <div className="flex justify-center mt-6 space-x-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            ⬅️ Kthehu
                        </button>
                        <span className="px-4 py-2 font-medium">Faqja {currentPage} nga {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            Tjetra ➡️
                        </button>
                    </div>

                    {/* PDF Download Button - Now at the bottom */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => alert("Raporti do të shkarkohet (placeholder)")}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition -mt-[30px]"
                        >
                            Shkarko në PDF
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Historiku;
