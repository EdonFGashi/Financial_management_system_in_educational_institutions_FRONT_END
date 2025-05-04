import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";

interface Staff {
    stafId: number;
    emri: string;
    mbiemri: string;
}

interface Ndalesa {
    ndalesaId: number;
    stafId: number;
    arsyeja: string;
    shumaNdaleses: number;
    data: string;
    pershkrimi?: string;
    aprovuar: boolean;
}

let ndalesaCounter = 1;

function Ndalesat() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [ndalesat, setNdalesat] = useState<Ndalesa[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetch("/api/stafi")
            .then((res) => res.json())
            .then((data) => setStaffList(data))
            .catch(() => setStaffList([]));
    }, []);

    const handleDelete = (id: number) => {
        const updatedList = ndalesat.filter((n) => n.ndalesaId !== id);
        setNdalesat(updatedList);

        const newTotalPages = Math.ceil(updatedList.length / itemsPerPage);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
        }
    };

    const totalPages = Math.ceil(ndalesat.length / itemsPerPage);
    const paginatedList = ndalesat.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>
            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <h1 className="text-3xl font-bold">Ndalesat</h1>
                    <p className="text-green-100">Deklarimi dhe lista e ndalesave</p>
                </div>

                {/* Form */}
                <div className="px-6 py-6">
                    <Formik
                        initialValues={{ stafId: '', arsyeja: '', shumaNdaleses: 0, data: '', pershkrimi: '' }}
                        onSubmit={(values, { resetForm }) => {
                            const newEntry: Ndalesa = {
                                ndalesaId: ndalesaCounter++,
                                stafId: Number(values.stafId),
                                arsyeja: values.arsyeja,
                                shumaNdaleses: Number(values.shumaNdaleses),
                                data: values.data,
                                pershkrimi: values.pershkrimi,
                                aprovuar: false
                            };
                            setNdalesat([newEntry, ...ndalesat]);
                            resetForm();
                            setCurrentPage(1);
                        }}
                    >
                        {() => (
                            <Form className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1 font-medium">Punëtori</label>
                                        <Field as="select" name="stafId" className="w-full border border-gray-300 p-2 rounded" required>
                                            <option value="">Zgjidh punëtorin</option>
                                            {staffList.map((s) => (
                                                <option key={s.stafId} value={s.stafId}>{s.emri} {s.mbiemri}</option>
                                            ))}
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Shuma</label>
                                        <Field type="number" name="shumaNdaleses" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Data</label>
                                        <Field type="date" name="data" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Arsyeja</label>
                                        <Field name="arsyeja" className="w-full border border-gray-300 p-2 rounded" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-medium">Përshkrimi (opsional)</label>
                                        <Field name="pershkrimi" className="w-full border border-gray-300 p-2 rounded" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition">
                                        Deklaro ndalesë
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>

                {/* Table */}
                <div className="px-6">
                    <h2 className="text-lg font-semibold mb-4">Lista e ndalesave brenda muajit:</h2>
                    <table className="w-full bg-white rounded-lg shadow text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">Emri</th>
                                <th className="py-3 px-4 text-left">Shuma</th>
                                <th className="py-3 px-4 text-left">Arsyeja</th>
                                <th className="py-3 px-4 text-left">Aprovuar</th>
                                <th className="py-3 px-4 text-left">Data</th>
                                <th className="py-3 px-4 text-left">Fshi / Ndalo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedList.length > 0 ? paginatedList.map((n) => {
                                const staff = staffList.find((s) => s.stafId === n.stafId);
                                return (
                                    <tr key={n.ndalesaId} className="border-t border-gray-200">
                                        <td className="py-3 px-4">{staff ? `${staff.emri} ${staff.mbiemri}` : '—'}</td>
                                        <td className="py-3 px-4">{n.shumaNdaleses} €</td>
                                        <td className="py-3 px-4">{n.arsyeja}</td>
                                        <td className="py-3 px-4">{n.aprovuar ? "Po" : "Jo"}</td>
                                        <td className="py-3 px-4">{n.data}</td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => handleDelete(n.ndalesaId)} className="text-red-600 hover:text-red-800">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-gray-500">Nuk ka ndalesa të regjistruara.</td>
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
                            Faqja {currentPage} nga {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
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

export default Ndalesat;