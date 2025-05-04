import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";

interface Staff {
    stafId: number;
    emri: string;
    mbiemri: string;
}

interface OretShtese {
    oretShteseId: number;
    stafId: number;
    dataAngazhimit: string;
    nrOreve: number;
    pagesaPerOre: number;
    shenime: string;
}

let entryIdCounter = 1;

function OretShtese() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [entries, setEntries] = useState<OretShtese[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        // Fetch staff from API
        fetch("/api/stafi")
            .then(res => res.json())
            .then(data => setStaffList(data))
            .catch(() => setStaffList([]));
    }, []);

    const handleDelete = (id: number) => {
        const updated = entries.filter((e) => e.oretShteseId !== id);
        setEntries(updated);
        const newTotalPages = Math.max(Math.ceil(updated.length / itemsPerPage), 1);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    };

    const handleInlineEdit = (
        id: number,
        field: keyof OretShtese,
        value: string | number
    ) => {
        setEntries((prev) =>
            prev.map((e) =>
                e.oretShteseId === id ? { ...e, [field]: value } : e
            )
        );
    };

    const paginatedEntries = entries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.max(Math.ceil(entries.length / itemsPerPage), 1);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Orët Shtesë</h1>
                    <p className="text-base sm:text-lg text-indigo-100">Regjistro dhe menaxho angazhimet shtesë</p>
                </div>

                {/* Form */}
                <div className="px-6 py-6">
                    <Formik
                        initialValues={{
                            stafId: "",
                            dataAngazhimit: "",
                            nrOreve: 0,
                            pagesaPerOre: 0,
                            shenime: "",
                        }}
                        onSubmit={(values, { resetForm }) => {
                            const newEntry: OretShtese = {
                                oretShteseId: entryIdCounter++,
                                stafId: Number(values.stafId),
                                dataAngazhimit: values.dataAngazhimit,
                                nrOreve: Number(values.nrOreve),
                                pagesaPerOre: Number(values.pagesaPerOre),
                                shenime: values.shenime,
                            };
                            setEntries([newEntry, ...entries]);
                            resetForm();
                            setCurrentPage(1);
                        }}
                    >
                        {() => (
                            <Form className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1 font-medium">Stafi</label>
                                        <Field
                                            as="select"
                                            name="stafId"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        >
                                            <option value="">Zgjidh stafin</option>
                                            {staffList.map((s) => (
                                                <option key={s.stafId} value={s.stafId}>
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
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                                    >
                                        Shto
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>

                {/* Table */}
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
                            {paginatedEntries.length > 0 ? (
                                paginatedEntries.map((entry) => {
                                    const staff = staffList.find((s) => s.stafId === entry.stafId);
                                    return (
                                        <tr key={entry.oretShteseId} className="border-t border-gray-200">
                                            <td className="py-3 px-4">{entry.oretShteseId}</td>
                                            <td className="py-3 px-4">{staff ? `${staff.emri} ${staff.mbiemri}` : "—"}</td>
                                            <td className="py-3 px-4">{entry.dataAngazhimit}</td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="number"
                                                    value={entry.nrOreve}
                                                    onChange={(e) =>
                                                        handleInlineEdit(entry.oretShteseId, "nrOreve", e.target.value)
                                                    }
                                                    className="border rounded px-2 py-1 w-20"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="number"
                                                    value={entry.pagesaPerOre}
                                                    onChange={(e) =>
                                                        handleInlineEdit(entry.oretShteseId, "pagesaPerOre", e.target.value)
                                                    }
                                                    className="border rounded px-2 py-1 w-24"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="text"
                                                    value={entry.shenime}
                                                    onChange={(e) =>
                                                        handleInlineEdit(entry.oretShteseId, "shenime", e.target.value)
                                                    }
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleDelete(entry.oretShteseId)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-500">
                                        Nuk ka të dhëna.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
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
