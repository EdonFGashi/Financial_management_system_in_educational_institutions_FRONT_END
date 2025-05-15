import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import { TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import {urlShporta} from "../../../endpoints";
import Swal from "sweetalert2";
import {urlListShkolla} from "../../../endpoints";

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
    const [shkollaId, setShkollaId] = useState<number | null>(null);

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

                if (items.length > 0 && !shkollaId) {
                    setShkollaId(items[0].shkollaId);
                }
            } catch (error) {
                console.error("Gabim gjatë marrjes së shportës", error);
            }
        };

        useEffect(() => {
            fetchShporta();
        }, [currentPage]);

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

    useEffect(() => {
        const fetchShkollaBudget = async () => {
            if (shkollaId === null) return;

            try {
                const response = await axios.get(`${urlListShkolla}/${shkollaId}`);
                setBuxhetiAktual(response.data.buxhetiAktual);
            } catch (error) {
                console.error("Gabim gjatë marrjes së buxhetit të shkollës", error);
            }
        };

        fetchShkollaBudget();
    }, [shkollaId]);

    // Funksione për menaxhimin e shportës
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.cmimiProduktit * item.sasia), 0);
    };

    const remainingBudget = (buxhetiAktual ?? 0) - calculateTotal();
    const totalPages = Math.ceil(totalItems / itemsPerPage);


    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar Statik - i njëjtë si në Market */}
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            {/* Përmbajtja kryesore me margin për sidebar */}
            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shporta e Porosive</h1>
                            <p className="text-base sm:text-lg text-green-100">
                                Shikoni dhe menaxhoni produktet në shportën tuaj
                            </p>
                        </div>
                        <Link
                            to="/shkolla/porosite/market"
                            className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>Kthehu në Market</span>
                        </Link>
                    </div>
                </div>

                {/* Përmbajtja */}
                <div className="px-4 sm:px-6 md:px-12 py-8">
                    {/* Buxheti dhe Totali */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Buxheti në Dispozicion</h3>
                            <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {buxhetiAktual === null ? 'Loading...' : `€${remainingBudget.toLocaleString()}`}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Totali i Shportës</h3>
                            <p className="text-2xl font-bold text-gray-800">
                                €{calculateTotal().toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {cartItems.reduce((total, item) => total + item.sasia, 0)} artikuj
                            </p>
                        </div>
                    </div>

                    {/* Lista e produkteve */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        {cartItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Shporta juaj është e zbrazët
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <img src={item.fotografia} alt={item.emriProduktit} className="w-20 h-20 object-contain rounded-lg" />

                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-800">{item.emriProduktit}</h3>
                                                <p className="text-green-600 font-semibold">€{item.cmimiProduktit.toFixed(2)}</p>
                                                <p className="text-sm text-gray-500">Total: €{(item.cmimiProduktit * item.sasia).toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.sasia - 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1">{item.sasia}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.sasia + 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Faqja paraprake
                        </button>

                        <span className="px-4 py-2 text-gray-700 font-medium">
                            Faqja {currentPage} nga {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Faqja tjetër
                        </button>
                    </div>
                )}

                    {/* Butoni i porosisë */}
                    {cartItems.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => alert(`Porosia u krye me sukses! Totali: €${calculateTotal().toFixed(2)}`)}
                                disabled={remainingBudget < 0}
                                className={`px-6 py-3 rounded-lg font-medium ${
                                    remainingBudget < 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {remainingBudget < 0 ? 'Buxheti nuk mjafton' : 'Kryej Porosinë'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Shporta;