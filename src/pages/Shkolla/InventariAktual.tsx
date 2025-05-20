import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Formik, Form, Field } from "formik";
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    TrashIcon,
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowDownTrayIcon,
    IdentificationIcon,
    QueueListIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import Swal from "sweetalert2";
import Toast from "../../components/Toast";
import { urlInventari } from "../../endpoints";

interface Inventar {
    id: number;
    emri: string;
    pershkrimi: string;
    sasia: number;
    shifra: string;
    createdAt: string;
}

function InventariAktual() {
    const [inventariList, setInventariList] = useState<Inventar[]>([]);
    const [filterEmri, setFilterEmri] = useState("");
    const [filterShifra, setFilterShifra] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchInventari = async () => {
        try {
            const response = await axios.get(`${urlInventari}/paginated`, {
                params: { page: 1, pageSize: 1000 }
            });
            setInventariList(response.data.data || []);
        } catch (error) {
            console.error("Gabim gjatë ngarkimit:", error);
            setToast({ message: "Gabim gjatë ngarkimit të inventarit", type: "error" });
        }
    };

    useEffect(() => {
        fetchInventari();
    }, []);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "A jeni i sigurt?",
            text: "Dëshironi të fshini këtë inventar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Po, Fshij",
            cancelButtonText: "Anulo",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${urlInventari}/${id}`);
                setToast({ message: "Inventari u fshi me sukses!", type: "success" });
                fetchInventari();
            } catch (error) {
                console.error("Gabim gjatë fshirjes:", error);
                setToast({ message: "Gabim gjatë fshirjes së inventarit", type: "error" });
            }
        }
    };

    const handleInlineEdit = async (
        id: number,
        field: keyof Pick<Inventar, "emri" | "pershkrimi" | "sasia" | "shifra">,
        value: string | number
    ) => {
        const updatedField = { [field]: field === "sasia" ? Number(value) : value };
        try {
            await axios.put(`${urlInventari}/${id}`, updatedField);
            fetchInventari();
            setToast({ message: "Të dhënat u përditësuan me sukses", type: "success" });
        } catch (error) {
            console.error("Gabim gjatë përditësimit:", error);
            setToast({ message: "Gabim gjatë përditësimit të të dhënave", type: "error" });
        }
    };

    // Calculate dashboard metrics
    const calculateInventoryMetrics = () => {
        const totalItems = inventariList.length;
        const totalQuantity = inventariList.reduce((sum, item) => sum + item.sasia, 0);
        const lowStockItems = inventariList.filter(item => item.sasia < 5).length;
        const itemCategories = new Set(inventariList.map(item => item.shifra.substring(0, 2))).size;
        
        return {
            totalItems,
            totalQuantity,
            lowStockItems,
            itemCategories
        };
    };
    
    const metrics = calculateInventoryMetrics();
    
    // Enhanced filtering
    const filteredList = inventariList.filter((item) => {
        const matchesEmri = item.emri.toLowerCase().includes(filterEmri.toLowerCase());
        const matchesShifra = item.shifra.toLowerCase().includes(filterShifra.toLowerCase());
        const matchesSearch = !searchTerm || 
            item.emri.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.pershkrimi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.shifra.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesEmri && matchesShifra && matchesSearch;
    });

    const totalPages = Math.max(Math.ceil(filteredList.length / itemsPerPage), 1);
    const paginatedList = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const clearFilters = () => {
        setFilterEmri("");
        setFilterShifra("");
        setSearchTerm("");
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm z-20">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Toast notification */}
                {toast && (
                    <div className="fixed top-5 right-5 z-50">
                        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                    </div>
                )}

                {/* Header - Updated with less fading */}
                <div className="bg-green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pattern opacity-20"></div>
                    <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Inventari Aktual</h1>
                                <p className="text-white text-lg max-w-2xl">
                                    Menaxhoni listën e inventarit të shkollës
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsFormVisible(!isFormVisible)}
                                className="flex items-center gap-2 bg-white text-green-700 px-5 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-200 transform hover:scale-105 font-medium"
                            >
                                <PlusIcon className="h-5 w-5" />
                                {isFormVisible ? "Mbyll Formularin" : "Shto Inventar të Ri"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <ArchiveBoxIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Artikuj</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalItems}</p>
                                <p className="text-xs text-gray-500 mt-1">Artikuj të regjistruar</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <ArrowDownTrayIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Sasia Totale</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalQuantity}</p>
                                <p className="text-xs text-gray-500 mt-1">Njësi në total</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-yellow-100 p-3 mr-4">
                                <QueueListIcon className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Stoku i Ulët</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.lowStockItems}</p>
                                <p className="text-xs text-gray-500 mt-1">Artikuj me më pak se 5 njësi</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <IdentificationIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Kategoritë</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.itemCategories}</p>
                                <p className="text-xs text-gray-500 mt-1">Grupe të ndryshme shifrash</p>
                            </div>
                        </div>
                    </div>

                    {/* Add Inventory Form */}
                    {isFormVisible && (
                        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
                            <div className="bg-gradient-to-r from-green-700 to-green-600 p-5">
                                <h2 className="text-xl font-semibold text-white">Shto Artikull të Ri në Inventar</h2>
                            </div>
                            <Formik
                                initialValues={{
                                    emri: "",
                                    pershkrimi: "",
                                    sasia: 0,
                                    shifra: "",
                                }}
                                onSubmit={async (values, { resetForm }) => {
                                    try {
                                        await axios.post(urlInventari, values);
                                        setToast({ message: "Inventari u shtua me sukses!", type: "success" });
                                        resetForm();
                                        setCurrentPage(1);
                                        fetchInventari();
                                    } catch (error) {
                                        console.error("Gabim gjatë shtimit:", error);
                                        setToast({ message: "Gabim gjatë shtimit të inventarit", type: "error" });
                                    }
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Emri</label>
                                                <Field 
                                                    name="emri" 
                                                    type="text" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Shifra</label>
                                                <Field 
                                                    name="shifra" 
                                                    type="text" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Sasia</label>
                                                <Field 
                                                    name="sasia" 
                                                    type="number" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-base font-medium text-gray-700 mb-2">Përshkrimi</label>
                                                <Field 
                                                    name="pershkrimi" 
                                                    as="textarea" 
                                                    rows={4}
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting}
                                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                                            >
                                                {isSubmitting ? "Duke u regjistruar..." : "Shto në Inventar"}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    )}

                    {/* Search and Filter Controls */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 border border-gray-100">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="w-full md:w-1/2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Kërko në të gjitha fushat..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                
                                <div className="flex items-center space-x-4 w-full md:w-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                        <input
                                            type="text"
                                            placeholder="Filtro sipas emrit..."
                                            value={filterEmri}
                                            onChange={(e) => {
                                                setFilterEmri(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-green-500 focus:border-green-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Filtro sipas shifrës..."
                                            value={filterShifra}
                                            onChange={(e) => {
                                                setFilterShifra(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {filteredList.length} artikuj të filtruar
                                </div>
                                {(filterEmri || filterShifra || searchTerm) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Pastro filtrat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emri</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Përshkrimi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sasia</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shifra</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Krijuar më</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veprimet</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedList.length > 0 ? (
                                        paginatedList.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        defaultValue={item.emri}
                                                        onBlur={(e) => handleInlineEdit(item.id, "emri", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        defaultValue={item.pershkrimi}
                                                        onBlur={(e) => handleInlineEdit(item.id, "pershkrimi", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        defaultValue={item.sasia}
                                                        onBlur={(e) => handleInlineEdit(item.id, "sasia", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className={`block w-24 rounded-md border-2 ${
                                                            item.sasia < 5 ? 'border-yellow-300' : 'border-green-300'
                                                        } shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3`}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        defaultValue={item.shifra}
                                                        onBlur={(e) => handleInlineEdit(item.id, "shifra", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 p-2 rounded-full hover:bg-red-50"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                                {searchTerm || filterEmri || filterShifra ? 
                                                    "Nuk u gjetën rezultate që përputhen me kriteret e kërkimit." : 
                                                    "Nuk ka artikuj të regjistruar në inventar."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredList.length > 0 && (
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

export default InventariAktual;
