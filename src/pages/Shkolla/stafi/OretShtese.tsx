import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import { urlOretShtese, urlStafi } from "../../../endpoints";

interface Staff {
    id: number;
    emri: string;
    mbiemri: string;
}

interface OretShtese {
    id: number;
    stafiShkollesId: number;
    dataAngazhimit: string;
    nrOreve: number;
    pagesaPerOre: number;
    shenime: string;
    stafi?: Staff;
}

function OretShtese() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [entries, setEntries] = useState<OretShtese[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchData = async () => {
        try {
            const oreRes = await axios.get(`${urlOretShtese}/paginated`, {
                params: { page: currentPage, recordsPerPage: itemsPerPage }
            });
            setEntries(oreRes.data?.data || []);

            const staffRes = await axios.get(`${urlStafi}/paginated`, {
                params: { page: 1, pageSize: 1000 }
            });
            setStaffList(staffRes.data?.data || []);
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
            text: "Dëshironi të fshini këtë orë shtesë?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Po, Fshij",
            cancelButtonText: "Anulo",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${urlOretShtese}/${id}`);
                setToast({ message: "Ora shtesë u fshi me sukses!", type: "success" });
                fetchData();
            } catch (error) {
                console.error("Gabim gjatë fshirjes", error);
                setToast({ message: "Gabim gjatë fshirjes", type: "error" });
            }
        }
    };

    const handleInlineEdit = async (
        id: number,
        field: "nrOreve" | "pagesaPerOre" | "shenime",
        value: string | number
    ) => {
        const updated = entries.find(e => e.id === id);
        if (!updated) return;

        const updatedEntry = {
            ...updated,
            [field]: field === "shenime" ? value : Number(value)
        };

        try {
            await axios.put(`${urlOretShtese}/${id}`, updatedEntry);
            fetchData();
            setToast({ message: "Ora u përditësua me sukses", type: "success" });
        } catch (error) {
            console.error("Gabim gjatë përditësimit", error);
            setToast({ message: "Gabim gjatë përditësimit", type: "error" });
        }
    };

    const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Orët Shtesë</h1>
                    <p className="text-base sm:text-lg text-green-100">Lista dhe menaxhimi i orëve shtesë</p>
                </div>

                <div className="px-6 py-6">
                    <Formik
                        initialValues={{
                            stafiShkollesId: "",
                            dataAngazhimit: "",
                            nrOreve: 0,
                            pagesaPerOre: 0,
                            shenime: "",
                        }}
                        onSubmit={async (values, { resetForm }) => {
                            try {
                                await axios.post(urlOretShtese, values);
                                setToast({ message: "Ora shtesë u shtua me sukses!", type: "success" });
                                resetForm();
                                setCurrentPage(1);
                                fetchData();
                            } catch (error) {
                                console.error("Gabim gjatë shtimit", error);
                                setToast({ message: "Gabim gjatë shtimit", type: "error" });
                            }
                        }}
                    >
                        {() => (
                            <Form className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1 font-medium">Stafi</label>
                                        <Field
                                            as="select"
                                            name="stafiShkollesId"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        >
                                            <option value="">Zgjidh stafin</option>
                                            {Array.isArray(staffList) &&
                                                staffList.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.emri} {s.mbiemri}
                                                    </option>
                                                ))}
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Data e angazhimit</label>
                                        <Field
                                            name="dataAngazhimit"
                                            type="date"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Numri i orëve</label>
                                        <Field
                                            name="nrOreve"
                                            type="number"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Pagesa për orë (€)</label>
                                        <Field
                                            name="pagesaPerOre"
                                            type="number"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-medium">Shënime</label>
                                        <Field
                                            as="textarea"
                                            name="shenime"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition">
                                        Shto
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>

                <div className="px-6 pb-10 overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                                <th className="py-3 px-4 text-left">#</th>
                                <th className="py-3 px-4 text-left">Stafi</th>
                                <th className="py-3 px-4 text-left">Data</th>
                                <th className="py-3 px-4 text-left">Orët</th>
                                <th className="py-3 px-4 text-left">Pagesa/Orë</th>
                                <th className="py-3 px-4 text-left">Shënime</th>
                                <th className="py-3 px-4 text-left">Fshi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="border-t border-gray-200">
                                        <td className="py-3 px-4">{entry.id}</td>
                                        <td className="py-3 px-4">
                                            {entry.stafi
                                                ? `${entry.stafi.emri} ${entry.stafi.mbiemri}`
                                                : staffList.find(s => s.id === entry.stafiShkollesId)?.emri + " " +
                                                staffList.find(s => s.id === entry.stafiShkollesId)?.mbiemri}
                                        </td>
                                        <td className="py-3 px-4">
                                            {entry.dataAngazhimit ? entry.dataAngazhimit.split("T")[0] : ""}
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                defaultValue={entry.nrOreve}
                                                onBlur={(e) => handleInlineEdit(entry.id, "nrOreve", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-20"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                defaultValue={entry.pagesaPerOre}
                                                onBlur={(e) => handleInlineEdit(entry.id, "pagesaPerOre", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-24"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                defaultValue={entry.shenime}
                                                onBlur={(e) => handleInlineEdit(entry.id, "shenime", e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-800">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-500">Nuk ka të dhëna.</td>
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

export default OretShtese;
