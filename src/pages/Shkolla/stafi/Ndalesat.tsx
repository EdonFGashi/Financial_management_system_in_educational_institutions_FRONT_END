import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, UserGroupIcon, CurrencyEuroIcon, DocumentTextIcon, ClockIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import { urlNdalesat, urlStafi } from "../../../endpoints";

interface Staff {
    id: number;
    emri: string;
    mbiemri: string;
}

interface Ndalesa {
    id: number;
    stafiShkollesId: number;
    arsyeja: string;        
    shumaNdaleses: number;
    data: string;
    pershkrimi?: string;
    aprovuari: boolean;
    stafi?: Staff;
}

function Ndalesat() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [entries, setEntries] = useState<Ndalesa[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [stats, setStats] = useState({
        totalStaff: 0,
        totalDeductions: 0,
        totalAmount: 0,
        approvedDeductions: 0
    });
    const [isFormVisible, setIsFormVisible] = useState(true);

    const fetchData = async () => {
        try {
            const ndalesaRes = await axios.get(`${urlNdalesat}/paginated`, {
                params: { page: currentPage, recordsPerPage: itemsPerPage }
            });
            const ndalesaData = ndalesaRes.data?.data || [];
            setEntries(ndalesaData);

            const staffRes = await axios.get(`${urlStafi}/paginated`, {
                params: { page: 1, pageSize: 1000 }
            });
            const staffData = staffRes.data?.data || [];
            setStaffList(staffData);

            // Calculate dashboard stats
            const totalAmount = ndalesaData.reduce((sum: number, item: Ndalesa) => sum + item.shumaNdaleses, 0);
            const approvedCount = ndalesaData.filter((item: Ndalesa) => item.aprovuari).length;
            
            setStats({
                totalStaff: staffData.length,
                totalDeductions: ndalesaData.length,
                totalAmount: totalAmount,
                approvedDeductions: approvedCount
            });
        } catch (error) {
            console.error("Gabim gjatë ngarkimit", error);
            setToast({ message: "Gabim gjatë ngarkimit", type: "error" });
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "A jeni i sigurt?",
            text: "Dëshironi të fshini këtë ndalesë?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Po, Fshij",
            cancelButtonText: "Anulo",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${urlNdalesat}/${id}`);
                setToast({ message: "Ndalesa u fshi me sukses!", type: "success" });
                fetchData();
            } catch (error) {
                console.error("Gabim gjatë fshirjes", error);
                setToast({ message: "Gabim gjatë fshirjes", type: "error" });
            }
        }
    };

    const handleInlineEdit = async (
        id: number,
        field: "shumaNdaleses" | "arsyeja" | "pershkrimi",
        value: string | number
    ) => {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        const updatedEntry = {
            ...entry,
            [field]: field === "shumaNdaleses" ? Number(value) : value
        };

        try {
            await axios.put(`${urlNdalesat}/${id}`, updatedEntry);
            setToast({ message: "Ndalesa u përditësua me sukses", type: "success" });
            fetchData();
        } catch (error) {
            console.error("Gabim gjatë përditësimit", error);
            setToast({ message: "Gabim gjatë përditësimit", type: "error" });
        }
    };

    const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));

    return (
        <div className="flex h-screen bg-gray-100">
            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            {/* Modern Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-white shadow-lg rounded-r-lg">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Updated with less fading */}
                <header className="bg-green-600 relative overflow-hidden z-10">
                    <div className="absolute inset-0 bg-pattern opacity-20"></div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-white">Menaxhimi i Ndalesave</h1>
                            <button 
                                onClick={() => setIsFormVisible(!isFormVisible)}
                                className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                            >
                                {isFormVisible ? "Mbyll Formularin" : "Shto Ndalesë të Re"}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Stats - Changed to white/light gray background */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-r from-white to-gray-100 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Përmbledhje e Ndalesave</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Only showing 3 cards now, removed the Approved Deductions card */}
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center transform transition-all duration-200 hover:scale-105">
                                <div className="rounded-full bg-green-100 p-3 mr-4">
                                    <UserGroupIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Stafi</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center transform transition-all duration-200 hover:scale-105">
                                <div className="rounded-full bg-green-100 p-3 mr-4">
                                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Ndalesa</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalDeductions}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center transform transition-all duration-200 hover:scale-105">
                                <div className="rounded-full bg-green-100 p-3 mr-4">
                                    <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Shuma Totale</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalAmount.toFixed(2)} €</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main content area */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
                    {/* Form - Always visible by default now */}
                    {isFormVisible && (
                        <div className="max-w-5xl mx-auto mb-8 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
                            <div className="bg-gradient-to-r from-green-700 to-green-600 p-5">
                                <h2 className="text-xl font-semibold text-white">Shto Ndalesë të Re</h2>
                            </div>
                            <Formik
                                initialValues={{
                                    stafiShkollesId: "",
                                    arsyeja: "",
                                    shumaNdaleses: 0,
                                    data: "",
                                    pershkrimi: ""
                                }}
                                onSubmit={async (values, { resetForm }) => {
                                    try {
                                        await axios.post(urlNdalesat, values);
                                        setToast({ message: "Ndalesa u shtua me sukses!", type: "success" });
                                        resetForm();
                                        setCurrentPage(1);
                                        fetchData();
                                    } catch (error) {
                                        console.error("Gabim gjatë shtimit", error);
                                        setToast({ message: "Gabim gjatë shtimit", type: "error" });
                                    }
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Punëtori</label>
                                                <Field 
                                                    as="select" 
                                                    name="stafiShkollesId" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required
                                                >
                                                    <option value="">Zgjidh punëtorin</option>
                                                    {staffList.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.emri} {s.mbiemri}
                                                        </option>
                                                    ))}
                                                </Field>
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Shuma</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <Field 
                                                        type="number" 
                                                        name="shumaNdaleses" 
                                                        className="block w-full pr-12 rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                        placeholder="0.00" 
                                                        required 
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 text-lg">€</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Data</label>
                                                <Field 
                                                    type="date" 
                                                    name="data" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Arsyeja</label>
                                                <Field 
                                                    name="arsyeja" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-base font-medium text-gray-700 mb-2">Përshkrimi</label>
                                                <Field 
                                                    as="textarea" 
                                                    rows={4} 
                                                    name="pershkrimi" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting}
                                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                                            >
                                                {isSubmitting ? "Duke u regjistruar..." : "Shto ndalesë"}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-green-700 to-green-600">
                            <h3 className="text-lg leading-6 font-medium text-white">Lista e Ndalesave</h3>
                            <p className="mt-1 max-w-2xl text-sm text-green-100">
                                Kliko në vlera për të edituar direkt në tabelë
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punëtori</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shuma (€)</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arsyeja</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Përshkrimi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statusi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veprimet</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {entries.length > 0 ? (
                                        entries.map((entry) => {
                                            return (
                                                <tr key={entry.id} className="hover:bg-gray-50 transition duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-700">
                                                                {(() => {
                                                                    const staff = entry.stafi ?? staffList.find(s => s.id === entry.stafiShkollesId);
                                                                    return staff ? staff.emri.charAt(0) + staff.mbiemri.charAt(0) : "—";
                                                                })()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {(() => {
                                                                        const staff = entry.stafi ?? staffList.find(s => s.id === entry.stafiShkollesId);
                                                                        return staff ? `${staff.emri} ${staff.mbiemri}` : "—";
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <input
                                                                type="number"
                                                                defaultValue={entry.shumaNdaleses}
                                                                onBlur={(e) => handleInlineEdit(entry.id, "shumaNdaleses", e.target.value)}
                                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                                className="block w-32 rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-2 px-3"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <input
                                                                type="text"
                                                                defaultValue={entry.arsyeja}
                                                                onBlur={(e) => handleInlineEdit(entry.id, "arsyeja", e.target.value)}
                                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                                className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-2 px-3"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <input
                                                                type="text"
                                                                defaultValue={entry.pershkrimi}
                                                                onBlur={(e) => handleInlineEdit(entry.id, "pershkrimi", e.target.value)}
                                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                                className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-2 px-3"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.aprovuari ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {entry.aprovuari ? (
                                                                <><CheckCircleIcon className="h-4 w-4 mr-1" /> Aprovuar</>
                                                            ) : (
                                                                <><ClockIcon className="h-4 w-4 mr-1" /> Në pritje</>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.data ? new Date(entry.data).toLocaleDateString() : ""}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 p-2 rounded-full hover:bg-red-50"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <ExclamationCircleIcon className="h-10 w-10 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nuk ka ndalesa</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Nuk ka ndalesa të regjistruara për momentin.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Kthehu
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Tjetra
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Duke shfaqur <span className="font-medium">{entries.length}</span> ndalesa
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            Faqja {currentPage} nga {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Ndalesat;
