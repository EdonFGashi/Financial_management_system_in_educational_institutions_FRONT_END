import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ToastContainer, { ToastData } from "../../components/ToastContainer";
import Sidebar from "./Sidebar"; // ShkollaSidebar
import axios from "axios";
import { urlListShkolla } from "../../endpoints";



import {
    ClipboardDocumentCheckIcon,
    BanknotesIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";

function ShkollaDashboard() {
    const [statistics, setStatistics] = useState({
        buxhetiAktual: 0,
        buxhetiShfrytezuar: 0,
        nrStafit: 0,
    });

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get(`${urlListShkolla}/statistics`); 
                if (response.data.succeeded) {
                    setStatistics({
                        buxhetiAktual: response.data.data.buxhetiAktual,
                        buxhetiShfrytezuar: response.data.data.buxhetiShfrytezuar,
                        nrStafit: response.data.data.nrStafit,
                    });
                } else {
                    showToast("error", response.data.message || "Nuk u ngarkuan statistikat");
                }
            } catch (error) {
                console.error("Gabim gjatë marrjes së statistikave:", error);
                showToast("error", "Gabim gjatë ngarkimit të statistikave");
            }
        };

        fetchStatistics();
    }, []);

    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = (type: "success" | "error", message: string) => {
        const newToast: ToastData = {
            id: Date.now(),
            type,
            message,
        };
        setToasts((prev) => [...prev, newToast]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
            <Sidebar />

            <main className="flex-1 pb-16">
                <ToastContainer toasts={toasts} removeToast={removeToast} />

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-12 md:py-14 mb-12"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Mirësevini në panelin e Shkollës</h1>
                    <p className="text-base sm:text-lg text-green-100">
                        Kontrolloni financat, porositë dhe stafin me lehtësi.
                    </p>
                </motion.div>

                {/* Navigation Cards */}
                <div className="bg-gray-100 rounded-xl shadow-sm mx-4 sm:mx-6 md:mx-12 px-4 sm:px-6 py-8 sm:py-10 mb-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link to="/shkolla/porosite/historiku">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Porositë</h3>
                                <p className="text-sm text-gray-500">
                                    Menaxhoni kërkesat për furnizime.
                                </p>
                            </div>
                        </Link>

                        <Link to="/shkolla/dashboard">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Buxheti</h3>
                                <p className="text-sm text-gray-500">
                                    Kontrolloni gjendjen dhe ndarjen e buxhetit.
                                </p>
                            </div>
                        </Link>

                        <Link to="/shkolla/stafi/menaxhimi">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Stafi</h3>
                                <p className="text-sm text-gray-500">
                                    Shiko dhe menaxho listën e stafit.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Overview Boxes */}
                <div className="bg-white rounded-xl shadow-md mx-4 sm:mx-6 md:mx-12 px-4 sm:px-6 py-8 sm:py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                            <BanknotesIcon className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-500">Buxheti total i muajit</p>
                                <p className="text-xl font-semibold text-gray-800">€ {statistics.buxhetiAktual.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                            <ClipboardDocumentCheckIcon className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-500">Shpenzimet totale te muajit</p>
                                <p className="text-xl font-semibold text-gray-800">€ {statistics.buxhetiShfrytezuar.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                            <UsersIcon className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-500">Numri i stafit</p>
                                <p className="text-xl font-semibold text-gray-800">{statistics.nrStafit}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ShkollaDashboard;
