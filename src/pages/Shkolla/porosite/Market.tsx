import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import axios from "axios";
import {urlProdukt} from "../../../endpoints";
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    XMarkIcon,
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


    const companies = ["të gjitha", ...Array.from(new Set(allProducts.map(p => p.kompaniaEmri || "")))];

    // Funksioni për ndryshimin e sasisë
    const handleQuantityChange = (productId: number, value: number) => {
        setQuantities({
            ...quantities,
            [productId]: value > 0 ? value : 1,
        });
    };

    // Funksioni për shtimin në shportë
    const addToCart = (product: Produkt) => {
        // Këtu do të shtohet logjika për shtimin në shportë me vone
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

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
            <Sidebar />

            <main className="flex-1 pb-16 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10 mb-8 sticky top-0 z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Market i Mjeteve Shkollore</h1>
                            <p className="text-base sm:text-lg text-green-100">
                                Zgjidhni mjetet shkollore nga furnitorët më të mirë
                            </p>
                        </div>
                        <Link
                            to="/shkolla/porosite/shporta"
                            className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <ShoppingCartIcon className="w-5 h-5" />
                            <span>Shiko Shportën</span>
                        </Link>
                    </div>
                </div>

                {/* Kontrollat e filtrimit dhe sortimit */}
                <div className="bg-white rounded-xl shadow-sm mx-4 sm:mx-6 md:mx-12 px-4 sm:px-6 py-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Kërko produkte..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                            >
                                <FunnelIcon className="w-5 h-5" />
                                <span>Filtro</span>
                            </button>

                            <div className="relative">
                                <select
                                    className="block appearance-none bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
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
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ArrowsUpDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtra të avancuar */}
                    {showFilters && (
                        <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium">Filtra të avancuar</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Pastro filtrat
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kompania</label>
                                    <select
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi min (€)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi max (€)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista e produkteve */}
                <div className="mx-4 sm:mx-6 md:mx-12">
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <p className="text-gray-500">Nuk u gjet asnjë produkt me këto kritere kërkimi.</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-green-600 hover:text-green-700 font-medium"
                            >
                                Pastro të gjitha filtrat
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                                    <div className="p-4">
                                        <img
                                            src={product.fotografia}
                                            alt={product.fotografia}
                                            className="w-full h-48 object-contain mb-4"
                                        />
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-semibold text-gray-800">{product.emri}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{product.pershkrimi}</p>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Kompania: {product.kompaniaEmri || 'Kompani e panjohur'}
                                        </p>
                                        <p className="text-xs text-gray-400 mb-3">Shtuar: {new Date(product.createdAt).toLocaleDateString()}</p>
                                        <p className="text-xl font-bold text-green-600 mb-4">€{product.cmimi.toFixed(2)}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-lg hover:bg-gray-300 transition"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantities[product.id] || 1}
                                                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                                                    className="w-12 text-center border-t border-b border-gray-300 py-1"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-lg hover:bg-gray-300 transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                            >
                                                Shto në Shportë
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={currentPage === 1}
                    >
                        Faqja Paraprake
                    </button>
                    <span className="px-4 py-2">{currentPage}</span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Faqja Tjetër
                    </button>
                </div>
            </main>
        </div>
    );
}

export default ShkollaMarket;