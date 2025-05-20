import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    CurrencyEuroIcon,
    XMarkIcon,
    ClockIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {urlPorosite} from "../../../endpoints";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Porosia } from "../../../models/porosia.model";

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

    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setMinPrice("");
        setMaxPrice("");
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm z-20">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header - Updated with less fading */}
                <div className="bg-green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pattern opacity-20"></div>
                    <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Historiku i Porosive</h1>
                                <p className="text-white text-lg max-w-2xl">
                                    Shiko dhe filtro historikun e të gjitha porosive të kryera
                                </p>
                            </div>
                            <button
                                onClick={generatePDF}
                                className="flex items-center gap-2 bg-white text-green-700 px-5 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-200 transform hover:scale-105 font-medium self-start md:self-auto"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                <span>Shkarko Raportin</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters section - Enhanced */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Filtro Rezultatet
                            </h2>
                            {(startDate || endDate || minPrice || maxPrice) && (
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Pastro filtrat
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    Data e fillimit
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    Data e mbarimit
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <CurrencyEuroIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    Çmimi minimal
                                </label>
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Min €"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <CurrencyEuroIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    Çmimi maksimal
                                </label>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Max €"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                {filteredList.length} porosi{filteredList.length !== 1 ? "" : "a"} të filtruara
                            </div>
                            {(startDate || endDate || minPrice || maxPrice) && (
                                <div className="flex flex-wrap gap-2">
                                    {startDate && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Nga: {new Date(startDate).toLocaleDateString()}
                                            <button onClick={() => setStartDate("")} className="ml-1 text-gray-500 hover:text-gray-700">
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {endDate && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Deri: {new Date(endDate).toLocaleDateString()}
                                            <button onClick={() => setEndDate("")} className="ml-1 text-gray-500 hover:text-gray-700">
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {minPrice && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Min: €{minPrice}
                                            <button onClick={() => setMinPrice("")} className="ml-1 text-gray-500 hover:text-gray-700">
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {maxPrice && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Max: €{maxPrice}
                                            <button onClick={() => setMaxPrice("")} className="ml-1 text-gray-500 hover:text-gray-700">
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table - Enhanced styling */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-auto">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left">ID</th>
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center">
                                                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-green-800 bg-green-100">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Duke u ngarkuar...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedList.length > 0 ? (
                                        paginatedList.map((p) => (
                                            <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-gray-800">{p.id}</td>
                                                <td className="py-3 px-4 font-medium text-gray-800">{p.produktiEmri}</td>
                                                <td className="py-3 px-4 text-right">{p.sasia}</td>
                                                <td className="py-3 px-4 text-gray-600">{new Date(p.dataPorosise).toLocaleDateString()}</td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    €{(p.produktiCmimi * p.sasia).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${p.statusi === "Paguar" 
                                                            ? "bg-green-100 text-green-800" 
                                                            : "bg-yellow-100 text-yellow-800"}`}
                                                    >
                                                        {p.statusi === "Paguar" 
                                                            ? <><CheckCircleIcon className="h-3 w-3 mr-1" /> Paguar</> 
                                                            : <><ClockIcon className="h-3 w-3 mr-1" /> Ne pritje</>}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{p.kompaniaEmri}</td>
                                                <td className="py-3 px-4 text-gray-500 text-xs">
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
                                            <td colSpan={8} className="py-8 text-center">
                                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-1">Nuk u gjetën porosi</h3>
                                                <p className="text-sm text-gray-500 max-w-md mx-auto">
                                                    Nuk ka porosi që përputhen me kriteret e filtrave. Provoni të ndryshoni filtrat ose kthehuni në marketin e porosive.
                                                </p>
                                                <button
                                                    onClick={resetFilters}
                                                    className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Pastro filtrat
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination - Modernized */}
                    {paginatedList.length > 0 && (
                        <div className="flex justify-center mb-8">
                            <nav className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className={`p-2 rounded-md flex items-center ${
                                        currentPage === 1 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                    <span className="sr-only">Previous</span>
                                </button>
                                
                                <span className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-md">
                                    Faqe {currentPage} nga {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-md flex items-center ${
                                        currentPage === totalPages 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </main>

            <style>
                {`
                .bg-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                `}
            </style>
        </div>
    );
}

export default Historiku;
