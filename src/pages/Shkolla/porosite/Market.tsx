import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import axios from "axios";
import {urlProdukt} from "../../../endpoints";
import {urlShporta} from "../../../endpoints";
import Swal from "sweetalert2";
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TagIcon,
    BuildingStorefrontIcon,
    CalendarIcon,
    CheckBadgeIcon
} from "@heroicons/react/24/outline";

interface Produkt {
    id: number;
    emri: string;
    pershkrimi: string;
    cmimi: number;
    sasiaNeStok: number;
    origjina?: string;
    prodhuesi?: string;
    fotografia?: string;
    kompaniaEmri?: string;
    createdAt: string; 
}


function ShkollaMarket() {
    const [produktiList, setProduktiList] = useState<Produkt[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    
    const fetchProduktet = async () => {
          try {
        const response = await axios.get(`${urlProdukt}/paginated`, {
            params: {
                page: currentPage,
                recordsPerPage: itemsPerPage,
            },
        });
        setProduktiList(response.data.data || []);
        setAllProducts(response.data.data || []);
    } catch (err) {
        console.error("Failed to load products", err);
        setToast({ message: "Gabim gjatë ngarkimit të produkteve", type: "error" });
    }
        };

    useEffect(() => {
          fetchProduktet();
    },  [currentPage]);

             
    // Lista e produkteve
    const [allProducts, setAllProducts] = useState<Produkt[]>([]);

    // State për filtrimin dhe kërkimin
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("të gjitha");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortOption, setSortOption] = useState("default");
    const [showFilters, setShowFilters] = useState(false);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    //
    const companies = ["të gjitha", ...Array.from(new Set(allProducts.map(p => p.kompaniaEmri || "")))];

    // Funksioni për ndryshimin e sasisë
    const handleQuantityChange = (productId: number, value: number) => {
        setQuantities({
            ...quantities,
            [productId]: value > 0 ? value : 1,
        });
    };

    // Funksioni për shtimin në shportë
   const addToCart = async (product: Produkt) => {
    const sasia = quantities[product.id] || 1;

            if (product.sasiaNeStok === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Jashtë stokut',
                    text: 'Ky produkt është jashtë stokut.',
                });
                return;
            }

            if (sasia > product.sasiaNeStok) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sasi e tepërt',
                    text: `Sasia që keni kërkuar (${sasia}) tejkalon stokun (${product.sasiaNeStok}).`,
                });
                return;
            }

            try {
                const response = await axios.post(urlShporta, {
                    produktiId: product.id,
                    sasia: sasia
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (response.data.succeeded) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sukses!',
                        text: 'Produkti u shtua në shportë.',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gabim!',
                        text: response.data.message || 'Diçka shkoi keq.',
                    });
                }
            } catch (error) {
                console.error("Gabim gjatë shtimit në shportë", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gabim në rrjet',
                    text: 'Gabim gjatë shtimit në shportë.',
                });
            }
        };

    // Funksioni për pastrimin e filtrave
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCompany("të gjitha");
        setMinPrice("");
        setMaxPrice("");
    };

    // Filtrimi dhe sortimi i produkteve
    const filteredProducts = allProducts
        .filter((product) => {
            const matchesSearch = product.emri.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.pershkrimi.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCompany = selectedCompany === "të gjitha" || product.kompaniaEmri === selectedCompany;
            const matchesMinPrice = !minPrice || product.cmimi >= Number(minPrice);
            const matchesMaxPrice = !maxPrice || product.cmimi <= Number(maxPrice);

            return matchesSearch && matchesCompany && matchesMinPrice && matchesMaxPrice;
        })
        .sort((a, b) => {
            switch (sortOption) {
                case "price-asc":
                    return a.cmimi - b.cmimi;
                case "price-desc":
                    return b.cmimi - a.cmimi;
                case "date-asc":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "date-desc":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "company-asc":
                    return a.kompaniaEmri?.localeCompare(b.kompaniaEmri|| "") || 0;
                case "company-desc":
                      return b.kompaniaEmri?.localeCompare(a.kompaniaEmri || "") || 0;
                default:
                    return 0;
            }
        });

    // Rregullimi i sidebar-it që të mos levizë gjatë scrollimit
    useEffect(() => {
        const mainContent = document.querySelector("main");
        if (mainContent) {
            mainContent.style.overflowY = "auto";
            mainContent.style.height = "100vh";
        }
    }, []);

    useEffect(() => {
            if (toast) {
                const timer = setTimeout(() => {
                    setToast(null);
                }, 3000); // zhduket pas 3 sekondash

                return () => clearTimeout(timer);
            }
        }, [toast]);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm z-20">
                <Sidebar />
            </div>
            
            {/* Toast notification */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-md flex items-center gap-3 transition-all duration-300 transform ${
                    toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {toast.type === 'success' ? (
                        <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                    ) : (
                        <XMarkIcon className="h-5 w-5 text-red-600" />
                    )}
                    <p className="font-medium">{toast.message}</p>
                    <button 
                        onClick={() => setToast(null)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}

            <main className="flex-1 md:ml-64 pb-16 relative">
                {/* Header - Updated with less fading */}
                <div className="bg-green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pattern opacity-20"></div>
                    <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Market i Mjeteve Shkollore</h1>
                                <p className="text-white text-lg max-w-2xl">
                                    Zgjidhni mjetet shkollore nga furnitorët më të mirë për nevojat e shkollës suaj
                                </p>
                            </div>
                            <Link
                                to="/shkolla/porosite/shporta"
                                className="flex items-center gap-3 bg-white text-green-700 px-6 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-200 transform hover:scale-105 font-medium"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                <span>Shiko Shportën</span>
                            </Link>
                        </div>
                    </div>
                    {/* Removed the bottom fade */}
                </div>

                {/* Main content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Search and filter controls - Enhanced design */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Kërko produkte sipas emrit ose përshkrimit..."
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                                        showFilters 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    <FunnelIcon className="w-5 h-5" />
                                    <span>Filtro</span>
                                </button>

                                <div className="relative">
                                    <select
                                        className="appearance-none bg-gray-100 border border-gray-200 px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-all duration-200 hover:bg-gray-200"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                    >
                                        <option value="default">Rendit sipas</option>
                                        <option value="price-asc">Çmimi: Nga më i ulët</option>
                                        <option value="price-desc">Çmimi: Nga më i lartë</option>
                                        <option value="date-asc">Data: Nga më e vjetra</option>
                                        <option value="date-desc">Data: Nga më e reja</option>
                                        <option value="company-asc">Kompania: A-Z</option>
                                        <option value="company-desc">Kompania: Z-A</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <ArrowsUpDownIcon className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced filters - Improved layout */}
                        {showFilters && (
                            <div className="bg-gray-50 p-6 rounded-lg mt-4 border border-gray-200 animate-fadeIn">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-lg font-medium text-gray-800">Filtra të avancuar</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        Pastro filtrat
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Kompania</label>
                                        <select
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                            value={selectedCompany}
                                            onChange={(e) => setSelectedCompany(e.target.value)}
                                        >
                                            {companies.map((kompania) => (
                                                <option key={kompania} value={kompania}>
                                                    {kompania.charAt(0).toUpperCase() + kompania.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Çmimi minimal (€)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="Min"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Çmimi maksimal (€)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter results summary */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {filteredProducts.length} produktet të disponueshme
                        </h2>
                        {searchTerm || selectedCompany !== "të gjitha" || minPrice || maxPrice ? (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                Pastro filtrat
                            </button>
                        ) : null}
                    </div>

                    {/* Products list - Enhanced card design with stronger shadows */}
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Nuk u gjet asnjë produkt</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">Nuk u gjet asnjë produkt me këto kritere kërkimi. Provoni të ndryshoni filtrat për të gjetur atë që po kërkoni.</p>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4 mr-2" />
                                Pastro të gjitha filtrat
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col transform hover:-translate-y-1">
                                    <div className="relative bg-gray-50 p-4 flex items-center justify-center h-64">
                                        <img
                                            src={product.fotografia || 'https://via.placeholder.com/300x300.png?text=No+Image'}
                                            alt={product.emri}
                                            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                                        />
                                        {product.sasiaNeStok === 0 && (
                                            <div className="absolute top-3 right-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                Jashtë stokut
                                            </div>
                                        )}
                                        {product.sasiaNeStok > 0 && product.sasiaNeStok <= 5 && (
                                            <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Vetëm {product.sasiaNeStok} në stok
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-6 flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.emri}</h3>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{product.pershkrimi}</p>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                {product.kompaniaEmri || 'Kompani e panjohur'}
                                            </div>
                                            
                                            <div className="flex items-center text-xs text-gray-400">
                                                <CalendarIcon className="w-4 h-4 mr-2 text-gray-300" />
                                                Shtuar: {new Date(product.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center mb-4">
                                            <TagIcon className="w-5 h-5 text-green-500 mr-2" />
                                            <span className="text-2xl font-bold text-green-600">€{product.cmimi.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                                                    disabled={product.sasiaNeStok === 0}
                                                    className="bg-white text-gray-700 px-3 py-2 rounded-l-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={product.sasiaNeStok}
                                                    value={quantities[product.id] || 1}
                                                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                                                    disabled={product.sasiaNeStok === 0}
                                                    className="w-14 text-center border-t border-b border-gray-300 py-2 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                                                    disabled={product.sasiaNeStok === 0}
                                                    className="bg-white text-gray-700 px-3 py-2 rounded-r-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={product.sasiaNeStok === 0}
                                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                                    product.sasiaNeStok === 0
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                <ShoppingCartIcon className="w-4 h-4" />
                                                {product.sasiaNeStok === 0 ? "Jashtë stokut" : "Shto"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination - Modernized */}
                    <div className="flex justify-center mt-12">
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
                                Faqe {currentPage}
                            </span>
                            
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </main>
            
            {/* CSS styles without the jsx attribute */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .bg-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                `}
            </style>
        </div>
    );
}

export default ShkollaMarket;