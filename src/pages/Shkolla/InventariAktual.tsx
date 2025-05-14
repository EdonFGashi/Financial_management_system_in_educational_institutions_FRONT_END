import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Formik, Form, Field } from "formik";
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
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

    const filteredList = inventariList.filter((item) =>
        item.emri.toLowerCase().includes(filterEmri.toLowerCase()) &&
        item.shifra.toLowerCase().includes(filterShifra.toLowerCase())
    );

    const totalPages = Math.max(Math.ceil(filteredList.length / itemsPerPage), 1);
    const paginatedList = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {toast && (
                    <div className="fixed top-5 right-5 z-50">
                        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                    </div>
                )}

                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Inventari Aktual</h1>
                    <p className="text-base sm:text-lg text-green-100">Lista dhe menaxhimi i inventarit</p>
                </div>

                <div className="px-6 py-6">
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
                        {() => (
                            <Form className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1 font-medium">Emri</label>
                                        <Field name="emri" type="text" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Shifra</label>
                                        <Field name="shifra" type="text" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Sasia</label>
                                        <Field name="sasia" type="number" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-medium">Përshkrimi</label>
                                        <Field name="pershkrimi" as="textarea" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition">
                                        Shto Inventar
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>

                <div className="px-6 pb-4 flex flex-col md:flex-row gap-3 justify-end">
                    <input
                        type="text"
                        placeholder="Filtro sipas emrit..."
                        value={filterEmri}
                        onChange={(e) => {
                            setFilterEmri(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 px-4 py-2 rounded w-full md:max-w-xs"
                    />
                    <input
                        type="text"
                        placeholder="Filtro sipas shifrës..."
                        value={filterShifra}
                        onChange={(e) => {
                            setFilterShifra(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 px-4 py-2 rounded w-full md:max-w-xs"
                    />
                </div>


                <div className="px-6 pb-10 overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                                <th className="py-3 px-4 text-left">#</th>
                                <th className="py-3 px-4 text-left">Emri</th>
                                <th className="py-3 px-4 text-left">Përshkrimi</th>
                                <th className="py-3 px-4 text-left">Sasia</th>
                                <th className="py-3 px-4 text-left">Shifra</th>
                                <th className="py-3 px-4 text-left">Krijuar më</th>
                                <th className="py-3 px-4 text-left">Fshi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedList.length > 0 ? (
                                paginatedList.map((item) => (
                                    <tr key={item.id} className="border-t border-gray-200">
                                        <td className="py-3 px-4">{item.id}</td>
                                        <td className="py-3 px-4">
                                            <input
                                                defaultValue={item.emri}
                                                onBlur={(e) => handleInlineEdit(item.id, "emri", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                defaultValue={item.pershkrimi}
                                                onBlur={(e) => handleInlineEdit(item.id, "pershkrimi", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                defaultValue={item.sasia}
                                                onBlur={(e) => handleInlineEdit(item.id, "sasia", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                defaultValue={item.shifra}
                                                onBlur={(e) => handleInlineEdit(item.id, "shifra", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">{new Date(item.createdAt).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-500">
                                        Nuk ka të dhëna të inventarit.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

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
                            Tjetra <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default InventariAktual;
