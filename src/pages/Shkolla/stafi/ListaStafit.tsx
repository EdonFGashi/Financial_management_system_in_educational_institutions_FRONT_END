import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { Formik, Form, Field } from "formik";
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    TrashIcon, 
    UserGroupIcon,
    CurrencyEuroIcon,
    BriefcaseIcon,
    ClockIcon,
    PlusIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import Swal from "sweetalert2";
import Toast from "../../../components/Toast";
import { urlStafi } from "../../../endpoints";

interface Staff {
    id: number;
    emri: string;
    mbiemri: string;
    numriPersonal: string;
    pozita: string;
    paga: number;
    numriOreve: number;
}

function ListaStafit() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filterPozita, setFilterPozita] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStafi = async () => {
        try {
            const response = await axios.get(`${urlStafi}/paginated`, {
                params: {
                    page: 1,
                    pageSize: 1000 // Load all for local filtering
                }
            });
            setStaffList(response.data.data || []);
        } catch (error) {
            console.error("Gabim gjatë marrjes së stafit:", error);
            setToast({ message: "Gabim gjatë ngarkimit të stafit", type: "error" });
        }
    };

    useEffect(() => {
        fetchStafi();
    }, []);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "A jeni i sigurt?",
            text: "Dëshironi të fshini këtë staf?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Po, Fshij",
            cancelButtonText: "Anulo",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${urlStafi}/${id}`);
                setToast({ message: "Stafi u fshi me sukses!", type: "success" });
                fetchStafi();
            } catch (error) {
                console.error("Gabim gjatë fshirjes:", error);
                setToast({ message: "Gabim gjatë fshirjes së stafit", type: "error" });
            }
        }
    };

    const handleInlineEdit = async (
        id: number,
        field: "pozita" | "paga" | "numriOreve",
        value: string | number
    ) => {
        const updatedField = { [field]: field === "pozita" ? value : Number(value) };

        try {
            await axios.put(`${urlStafi}/${id}`, updatedField);
            fetchStafi();
            setToast({ message: "Të dhënat u përditësuan me sukses", type: "success" });
        } catch (error) {
            console.error("Gabim gjatë përditësimit:", error);
            setToast({ message: "Gabim gjatë përditësimit të të dhënave", type: "error" });
        }
    };

    // Calculate dashboard metrics
    const calculateDashboardMetrics = () => {
        const totalStaff = staffList.length;
        const totalSalary = staffList.reduce((sum, staff) => sum + staff.paga, 0);
        const averageSalary = totalStaff > 0 ? totalSalary / totalStaff : 0;
        const totalHours = staffList.reduce((sum, staff) => sum + staff.numriOreve, 0);
        
        // Get position distribution
        const positionCounts: Record<string, number> = {};
        staffList.forEach(staff => {
            positionCounts[staff.pozita] = (positionCounts[staff.pozita] || 0) + 1;
        });
        
        // Find position with most staff
        let topPosition = { name: "", count: 0 };
        Object.entries(positionCounts).forEach(([position, count]) => {
            if (count > topPosition.count) {
                topPosition = { name: position, count };
            }
        });
        
        return {
            totalStaff,
            averageSalary,
            totalSalary,
            totalHours,
            topPosition
        };
    };
    
    const metrics = calculateDashboardMetrics();

    // Enhanced filtering
    const filteredStaff = staffList.filter(staff => {
        const matchesPosition = !filterPozita || staff.pozita === filterPozita;
        const matchesSearch = !searchTerm || 
            `${staff.emri} ${staff.mbiemri}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.numriPersonal.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.pozita.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesPosition && matchesSearch;
    });

    const uniquePozitat = Array.from(new Set(staffList.map((s) => s.pozita)));

    const totalPages = Math.max(Math.ceil(filteredStaff.length / itemsPerPage), 1);
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Stafi i Shkollës</h1>
                                <p className="text-white text-lg max-w-2xl">
                                    Menaxhoni stafin dhe informacionet e pagave
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsFormVisible(!isFormVisible)}
                                className="flex items-center gap-2 bg-white text-green-700 px-5 py-3 rounded-full shadow-lg hover:bg-green-50 transition duration-200 transform hover:scale-105 font-medium"
                            >
                                <PlusIcon className="h-5 w-5" />
                                {isFormVisible ? "Mbyll Formularin" : "Shto Staf të Ri"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <UserGroupIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Stafi</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalStaff}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Paga Mesatare</h3>
                                <p className="text-2xl font-bold text-gray-900">€{metrics.averageSalary.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-1">Total: €{metrics.totalSalary.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <BriefcaseIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Pozita Kryesore</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.topPosition.name || "N/A"}</p>
                                {metrics.topPosition.count > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">{metrics.topPosition.count} staf</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <ClockIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total Orët</h3>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalHours}</p>
                                <p className="text-xs text-gray-500 mt-1">Orë pune në total</p>
                            </div>
                        </div>
                    </div>

                    {/* Add Staff Form */}
                    {isFormVisible && (
                        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
                            <div className="bg-gradient-to-r from-green-700 to-green-600 p-5">
                                <h2 className="text-xl font-semibold text-white">Shto Anëtar të Ri të Stafit</h2>
                            </div>
                            <Formik
                                initialValues={{
                                    numriPersonal: "",
                                    pozita: "",
                                    paga: 0,
                                    numriOreve: 0,
                                }}
                                onSubmit={async (values, { resetForm }) => {
                                    try {
                                        await axios.post(urlStafi, values);
                                        setToast({ message: "Stafi u shtua me sukses!", type: "success" });
                                        resetForm();
                                        setCurrentPage(1);
                                        fetchStafi();
                                    } catch (error) {
                                        console.error("Gabim gjatë shtimit:", error);
                                        setToast({ message: "Gabim gjatë shtimit të stafit", type: "error" });
                                    }
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Numri Personal</label>
                                                <Field 
                                                    name="numriPersonal" 
                                                    type="text" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Pozita</label>
                                                <Field 
                                                    name="pozita" 
                                                    type="text" 
                                                    className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Paga (€)</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <Field 
                                                        name="paga" 
                                                        type="number" 
                                                        className="block w-full pr-12 rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4" 
                                                        required 
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 text-lg">€</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-base font-medium text-gray-700 mb-2">Numri i orëve</label>
                                                <Field 
                                                    name="numriOreve" 
                                                    type="number" 
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
                                                {isSubmitting ? "Duke u regjistruar..." : "Shto Staf"}
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
                                        placeholder="Kërko sipas emrit, numrit personal, ose pozitës..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                
                                <div className="flex items-center space-x-4 w-full md:w-auto">
                                    <div className="flex items-center">
                                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-500 mr-2">Filtro:</span>
                                        <select
                                            value={filterPozita}
                                            onChange={(e) => {
                                                setFilterPozita(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Të gjitha pozitat</option>
                                            {uniquePozitat.map((pozita, idx) => (
                                                <option key={idx} value={pozita}>{pozita}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="text-sm text-gray-500">
                                        {filteredStaff.length} rezultate
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staff Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emri Mbiemri</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numri Personal</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozita</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paga (€)</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numri i orëve</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veprimet</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedStaff.length > 0 ? (
                                        paginatedStaff.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-gray-50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-700">
                                                            {staff.emri.charAt(0)}{staff.mbiemri.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{`${staff.emri} ${staff.mbiemri}`}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.numriPersonal}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        defaultValue={staff.pozita}
                                                        onBlur={(e) => handleInlineEdit(staff.id, "pozita", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className="block w-full rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        defaultValue={staff.paga}
                                                        onBlur={(e) => handleInlineEdit(staff.id, "paga", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className="block w-24 rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        defaultValue={staff.numriOreve}
                                                        onBlur={(e) => handleInlineEdit(staff.id, "numriOreve", e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                        className="block w-24 rounded-md border-2 border-green-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-sm py-2 px-3"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(staff.id)}
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
                                                {searchTerm || filterPozita ? 
                                                    "Nuk u gjetën rezultate që përputhen me kriteret e kërkimit." : 
                                                    "Nuk ka staf të regjistruar."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredStaff.length > 0 && (
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
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0V4h-2V0h-4v2h4v4h2V2h4V0h-4zM0 34v-4H2v4h4v2H2v4H0v-4H2v-2H0zM0 0V4h2V0h4v2H2v4H0V2h4V0H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                `}
            </style>
        </div>
    );
}

export default ListaStafit;
