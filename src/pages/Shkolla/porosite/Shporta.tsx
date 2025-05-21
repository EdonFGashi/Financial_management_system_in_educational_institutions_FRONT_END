import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import { 
    TrashIcon, 
    ArrowLeftIcon, 
    ShoppingCartIcon, 
    CurrencyEuroIcon,
    MinusIcon,
    PlusIcon,
    CheckIcon,
    ExclamationCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import {urlShporta} from "../../../endpoints";
import Swal from "sweetalert2";
import {urlListShkolla} from "../../../endpoints";
import {urlPorosite} from "../../../endpoints";
import {urlProdukte} from "../../../endpoints";

interface CartItem {
    id: number;
    produktiId: number;
    sasia: number;
    emriProduktit: string;
    cmimiProduktit: number;
    fotografia: string;
}

function Shporta() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [totalItems, setTotalItems] = useState(0);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [buxhetiAktual, setBuxhetiAktual] = useState<number | null>(null);
    const totalPages = Math.ceil(totalItems / itemsPerPage);


        // Merr produktet ne shporte
        const fetchShporta = async () => {
            try {
                const response = await axios.get(`${urlShporta}/paginated`, {
                    params: {
                        page: currentPage,
                        recordsPerPage: itemsPerPage
                    }
                });

                const items = response.data.data || [];
                setCartItems(items);
                setTotalItems(response.data.totalRecords);
            } catch (error) {
                console.error("Gabim gjatë marrjes së shportës", error);
            }
        };

        useEffect(() => {
            fetchShporta();
        }, [currentPage]);

        // Update sasia
        const updateQuantity = async (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            await axios.put(`${urlShporta}/${id}`, {
                sasia: newQuantity
            });

            setCartItems(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, sasia: newQuantity } : item
                )
            );
        } catch (err) {
            console.error("Gabim gjatë përditësimit të sasisë", err);
        }
         };

         // Delete nga shporta
        const removeItem = async (id: number) => {
        const result = await Swal.fire({
            title: "A jeni i sigurt?",
            text: "Produkti do të largohet nga shporta!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#16a34a", // e gjelbër
            cancelButtonColor: "#d33",
            confirmButtonText: "Po, largoje",
            cancelButtonText: "Anulo"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${urlShporta}/${id}`);
                setCartItems(prev => prev.filter(item => item.id !== id));

                Swal.fire({
                    icon: "success",
                    title: "U fshi!",
                    text: "Produkti u largua nga shporta.",
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Gabim gjatë fshirjes së produktit", err);
                Swal.fire({
                    icon: "error",
                    title: "Gabim",
                    text: "Nuk u arrit të largohet produkti.",
                });
            }
        }
    };

    // Fetch Buxheti Aktual
    useEffect(() => {
        const fetchShkollaBudget = async () => {
            try {
                const response = await axios.get(`${urlListShkolla}/statistics`);
                setBuxhetiAktual(response.data.data.buxhetiAktual);
            } catch (error) {
                console.error("Gabim gjatë marrjes së buxhetit të shkollës", error);
            }
        };

        fetchShkollaBudget();
    });

    // Kalkulimi i totalit te shportes
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.cmimiProduktit * item.sasia), 0);
    };
    const remainingBudget = (buxhetiAktual ?? 0) - calculateTotal();

    // Kryerja e porosise
    const handleKryejPorosine = async () => {
            const { value: shenime } = await Swal.fire({
                title: "Kryej Porosinë",
                input: "textarea",
                inputLabel: "Shënime për porosinë (opsionale)",
                inputPlaceholder: "Shkruani ndonjë koment për këtë porosi...",
                inputAttributes: {
                    "aria-label": "Shkruani shënimet tuaja këtu"
                },
                showCancelButton: true,
                confirmButtonText: "Po, kryej porosinë",
                cancelButtonText: "Anulo",
                confirmButtonColor: "#16a34a"
            });

            if (shenime === undefined) return; 

            const total = calculateTotal(); // ✅ calculate once before the loop
            try {

                for (const item of cartItems) {
                    const porosiaPayload = {
                        sasia: item.sasia,
                        produktiId: item.produktiId,
                        shenime: shenime || null
                    };

                    try {
                        await axios.post(`${urlPorosite}`, porosiaPayload);
                        console.log("Order created for", item.produktiId);
                    } catch (err) {
                        console.error("❌ POST order failed", err);
                    }

                    try {
                        await axios.patch(`${urlProdukte}/${item.produktiId}/sasia`, {
                            sasiaPorositur: item.sasia
                        });
                        console.log("Stock updated for", item.produktiId);
                    } catch (err) {
                        console.error("❌ PATCH produkti stock failed", err);
                    }

                    try {
                        await axios.delete(`${urlShporta}/${item.id}`);
                        console.log("Item deleted from cart", item.id);
                    } catch (err) {
                        console.error("❌ DELETE from cart failed", err);
                    }
                }

                try {
                    await axios.patch(`${urlListShkolla}/buxheti`, {
                        ShumaPorositur: total
                    });
                    console.log("✅ Buxheti updated successfully");
                } catch (err) {
                    console.error("❌ PATCH buxheti failed", err);
                }

                Swal.fire({
                    icon: "success",
                    title: "Porosia u krye me sukses!",
                    text: "Të gjitha produktet u transferuan në Porositë.",
                    timer: 2000,
                    showConfirmButton: false
                });

                fetchShporta(); // refresh cart
            } catch (error) {
                console.error("Gabim gjatë kryerjes së porosisë:", error);
                console.log("Error response:", error);
                Swal.fire({
                    icon: "error",
                    title: "Gabim",
                    text: "Dështoi kryerja e porosisë. Ju lutem provoni përsëri.",
                });
            }
        };



    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm z-20">
                <Sidebar />
            </div>

            {/* Main content */}
            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header - Updated with less fading */}
                <div className="bg-green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pattern opacity-20"></div>
                    <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Shporta e Porosive</h1>
                                <p className="text-white text-lg max-w-2xl">
                                    Shikoni dhe menaxhoni produktet në shportën tuaj para se të kryeni porosinë
                                </p>
                            </div>
                            <Link
                                to="/shkolla/porosite/market"
                                className="flex items-center gap-3 bg-white text-green-700 px-6 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-200 transform hover:scale-105 font-medium"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span>Kthehu në Market</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main cart content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Summary cards - Improved design */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Buxheti në Dispozicion</h3>
                                    <div className="flex items-baseline">
                                        <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {buxhetiAktual === null 
                                                ? 'Duke u ngarkuar...'
                                                : cartItems.length === 0 
                                                    ? `€${buxhetiAktual.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                                                    : `€${remainingBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                                        </p>
                                        {remainingBudget < 0 && (
                                            <span className="ml-2 text-sm text-red-500 font-medium">Buxhet i pamjaftueshëm</span>
                                        )}
                                    </div>
                                    {buxhetiAktual !== null && cartItems.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Nga €{buxhetiAktual.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} total
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-green-100 p-3">
                                    <ShoppingCartIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Totali i Shportës</h3>
                                    <p className="text-2xl font-bold text-gray-800">
                                        €{calculateTotal().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {cartItems.reduce((total, item) => total + item.sasia, 0)} artikuj në shportë
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cart items */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800">Artikujt në Shportë</h2>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Shporta juaj është e zbrazët</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Duket se nuk keni asnjë artikull në shportën tuaj. Vizitoni marketin për të shtuar produkte.
                                </p>
                                <Link
                                    to="/shkolla/porosite/market"
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    Shko tek Marketi
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                                                <img 
                                                    src={item.fotografia || 'https://via.placeholder.com/150'} 
                                                    alt={item.emriProduktit} 
                                                    className="w-full h-full object-contain" 
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-800 mb-1">{item.emriProduktit}</h3>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-lg font-semibold text-green-600">
                                                        €{item.cmimiProduktit.toFixed(2)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">për njësi</span>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.sasia - 1)}
                                                            className="p-2 rounded-l-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border border-gray-300"
                                                        >
                                                            <MinusIcon className="w-4 h-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.sasia}
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                            className="w-16 border-t border-b border-gray-300 py-2 text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.sasia + 1)}
                                                            className="p-2 rounded-r-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border border-gray-300"
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-500">Totali</div>
                                                            <div className="text-lg font-bold">
                                                                €{(item.cmimiProduktit * item.sasia).toFixed(2)}
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                                            aria-label="Remove item"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination - Modernized */}
                    {totalPages > 1 && (
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

                    {/* Checkout section */}
                    {cartItems.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Përfundoni Porosinë</h3>
                                    <p className="text-gray-500">
                                        {remainingBudget < 0 
                                            ? 'Buxheti nuk është i mjaftueshëm për këtë porosi.' 
                                            : 'Jeni gati për të përfunduar porosinë tuaj?'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleKryejPorosine}
                                    disabled={remainingBudget < 0 || cartItems.length === 0}
                                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                                        remainingBudget < 0
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                    }`}
                                >
                                    {remainingBudget < 0 ? (
                                        <>
                                            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                                            Buxheti nuk mjafton
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-5 h-5 mr-2" />
                                            Kryej Porosinë
                                        </>
                                    )}
                                </button>
                            </div>
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

export default Shporta;