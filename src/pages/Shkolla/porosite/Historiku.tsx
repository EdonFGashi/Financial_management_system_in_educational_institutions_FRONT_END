import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import {ChevronLeftIcon} from "@heroicons/react/24/outline";
import {ChevronRightIcon} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {urlPorosite} from "../../../endpoints";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Porosia {
    id: number;
    dataPorosise: string;
    sasia: number;
    statusi: string;
    shenime?: string;
    produktiId: number;
    produktiCmimi: number;
    produktiEmri: string;
    kompaniaEmri: string;
    updatedAt?: string;
}

function Historiku() {
    const [porosite, setPorosite] = useState<Porosia[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const fetchPorosite = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${urlPorosite}/paginated`, {
                params: {
                    page: 1,
                    pageSize: 1000,
                },
            });
            setPorosite(response.data.data);
            console.log("Fetched:", response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            Swal.fire("Gabim", "Nuk u arrit të merret lista e porosive", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPorosite();
    }, []);      

    const filteredList = porosite.filter((item) => {
        const dateOk =
            (!startDate || item.dataPorosise >= startDate) &&
            (!endDate || item.dataPorosise <= endDate);

        const priceTotal = item.produktiCmimi * item.sasia;
        const priceOk =
            (!minPrice || priceTotal >= parseFloat(minPrice)) &&
            (!maxPrice || priceTotal <= parseFloat(maxPrice));

        return dateOk && priceOk;
    });

    const totalPages = Math.max(Math.ceil(filteredList.length / itemsPerPage), 1);
    const paginatedList = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const generatePDF = () => {
    const doc = new jsPDF();
        
        doc.setFontSize(16); // Optional: set font size
        doc.text("Raporti i Porosive", 14, 20); // (text, x, y)

        autoTable(doc, {
            startY: 30, 
            head: [[
                "ID", "Produkti", "Sasia", "Data", "Çmimi", "Statusi", "Kompania", "Modifikuar më"
            ]],
            body: paginatedList.map(p => [
                p.id,
                p.produktiEmri,
                p.sasia,
                new Date(p.dataPorosise).toLocaleDateString(),
                `€${(p.produktiCmimi * p.sasia).toFixed(2)}`,
                p.statusi,
                p.kompaniaEmri,
                p.updatedAt
                    ? new Date(p.updatedAt).toLocaleDateString("sq-AL", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })
                    : "—",
            ]),
        });

        doc.save("historiku_porosive.pdf");
    };

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

                    {/* Min/Max price */}
                 
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

                {/* Table */}
                <div className="px-4 sm:px-6 md:px-12 pb-10 overflow-x-auto">
                    <div className="px-4 sm:px-6 md:px-12 pb-10 overflow-x-auto">
                    <table className="w-full bg-white rounded-xl shadow-md text-sm table-auto">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                                <th className="py-3 px-4 text-left">ID e Porosisë</th>
                                <th className="py-3 px-4 text-left">Produkti</th>
                                <th className="py-3 px-4 text-right">Sasia</th>
                                <th className="py-3 px-4 text-left">Data e Porosisë</th>
                                <th className="py-3 px-4 text-right">Çmimi Total</th>
                                <th className="py-3 px-4 text-center">Statusi</th>
                                <th className="py-3 px-4 text-left">Kompania</th>
                                <th className="py-3 px-4 text-left min-w-[140px]">Modifikuar më</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedList.length > 0 ? (
                                paginatedList.map((p) => (
                                    <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4">{p.id}</td>
                                        <td className="py-3 px-4">{p.produktiEmri}</td>
                                        <td className="py-3 px-4 text-right">{p.sasia}</td>
                                        <td className="py-3 px-4">{new Date(p.dataPorosise).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            €{(p.produktiCmimi * p.sasia).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium 
                                                ${p.statusi === "Paguar" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                {p.statusi === "Paguar" ? "Paguar" : "Ne pritje"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{p.kompaniaEmri}</td>
                                        <td className="py-3 px-4">
                                            {p.updatedAt
                                                ? new Date(p.updatedAt).toLocaleDateString("sq-AL", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "—"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-6 text-center text-gray-500">
                                        {loading ? "Duke u ngarkuar..." : "Nuk u gjet asnjë porosi."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                    <div className="flex justify-center mt-6 space-x-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                        >
                            <ChevronLeftIcon className="w-5 h-5" /> Kthehu
                        </button>
                        <span className="px-4 py-2 font-medium">
                            Faqja {currentPage} nga {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                        >
                            Tjetra
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* PDF Download Button - Now at the bottom */}
                    <div className="flex justify-end">
                        <button
                            onClick={generatePDF}
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
