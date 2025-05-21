import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, PencilSquareIcon, XMarkIcon, CheckIcon, ClockIcon, CurrencyEuroIcon, CalendarIcon, UserIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import { urlOretShtese, urlStafi } from "../../../endpoints";
import axiosInstance from "../../../api/axiosInstance";
import * as Yup from 'yup';

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
    statusi?: string;
    stafi?: Staff;
    emriShkolles?: string; // For Komuna role
    totalPagesa?: number;  // For Komuna role
}

interface PaginatedResponse<T> {
    data: T[];
    page: number;
    recordsPerPage: number;
    totalRecords: number;
    message: string;
    succeeded: boolean;
}

// Validation schema for the form
const OretShteseSchema = Yup.object().shape({
  stafiShkollesId: Yup.string().required('Stafi është i detyrueshëm'),
  dataAngazhimit: Yup.date().required('Data është e detyrueshme'),
  nrOreve: Yup.number().required('Numri i orëve është i detyrueshëm').positive('Numri i orëve duhet të jetë pozitiv'),
  pagesaPerOre: Yup.number().required('Pagesa për orë është e detyrueshme').positive('Pagesa duhet të jetë pozitive'),
  shenime: Yup.string(),
});

function OretShtese() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [entries, setEntries] = useState<OretShtese[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 5;
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const oreRes = await axiosInstance.get<PaginatedResponse<OretShtese>>(`${urlOretShtese}/paginated`, {
                params: { page: currentPage, recordsPerPage: itemsPerPage }
            });
            
            if (oreRes.data.succeeded) {
                setEntries(oreRes.data.data || []);
                setTotalRecords(oreRes.data.totalRecords);
            } else {
                console.error("API error:", oreRes.data.message);
                setToast({ message: oreRes.data.message || "Gabim gjatë ngarkimit", type: "error" });
            }

            const staffRes = await axiosInstance.get(`${urlStafi}/paginated`, {
                params: { page: 1, pageSize: 1000 }
            });
            setStaffList(staffRes.data?.data || []);
        } catch (error) {
            console.error("Gabim gjatë ngarkimit", error);
            setToast({ message: "Gabim gjatë ngarkimit", type: "error" });
        } finally {
            setIsLoading(false);
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
                await axiosInstance.delete(`${urlOretShtese}/${id}`);
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
            await axiosInstance.put(`${urlOretShtese}/${id}`, updatedEntry);
            fetchData();
            setToast({ message: "Ora u përditësua me sukses", type: "success" });
        } catch (error) {
            console.error("Gabim gjatë përditësimit", error);
            setToast({ message: "Gabim gjatë përditësimit", type: "error" });
        }
    };

    const getStatusBadgeClass = (status?: string) => {
        if (!status) return "bg-yellow-50 text-yellow-700 border border-yellow-200";
        
        switch(status.toLowerCase()) {
            case "ne pritje":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm";
            case "aprovuar":
                return "bg-green-50 text-green-700 border border-green-200 shadow-sm";
            case "refuzuar":
                return "bg-red-50 text-red-700 border border-red-200 shadow-sm";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200 shadow-sm";
        }
    };

    const getStatusIcon = (status?: string) => {
        if (!status || status.toLowerCase() === "ne pritje") {
            return <ClockIcon className="w-3.5 h-3.5 mr-1" />;
        } else if (status.toLowerCase() === "aprovuar") {
            return <CheckIcon className="w-3.5 h-3.5 mr-1" />;
        } else if (status.toLowerCase() === "refuzuar") {
            return <XMarkIcon className="w-3.5 h-3.5 mr-1" />;
        }
        return null;
    };

    // Calculate total pages based on the total records from the API
    const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800">
            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            <div className="hidden md:block fixed h-full w-64 bg-white border-r border-slate-200 shadow-sm">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                <div className="bg-gradient-to-r from-green-800 via-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-10 md:py-14 shadow-lg">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3">Orët Shtesë</h1>
                    <p className="text-base sm:text-lg text-green-100 max-w-3xl">
                        Ky modul shërben për regjistrimin dhe menaxhimin e orëve shtesë të stafit. Orët e aprovuara nga komuna paguhen në buxhetin e shkollës.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl mb-10 border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <div className="bg-green-100 text-green-700 p-2 rounded-xl mr-3">
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
                Shto Orë Shtesë
              </h2>
            </div>
            
            <Formik
              initialValues={{
                stafiShkollesId: "",
                dataAngazhimit: "",
                nrOreve: 0,
                pagesaPerOre: 0,
                shenime: "",
              }}
              validationSchema={OretShteseSchema}
              onSubmit={async (values, { resetForm }) => {
                setIsSubmitting(true);
                try {
                    const formattedValues = {
                        stafiShkollesId: Number(values.stafiShkollesId),
                        dataAngazhimit: values.dataAngazhimit,
                        nrOreve: Number(values.nrOreve),
                        pagesaPerOre: Number(values.pagesaPerOre),
                        shenime: values.shenime,
                    };
                    
                    await axiosInstance.post(urlOretShtese, formattedValues);
                    setToast({ 
                        message: "Ora shtesë u shtua me sukses dhe është në pritje të aprovimit!", 
                        type: "success" 
                    });
                    resetForm();
                    setCurrentPage(1);
                    fetchData();
                } catch (error) {
                    console.error("Gabim gjatë shtimit", error);
                    setToast({ message: "Gabim gjatë shtimit", type: "error" });
                } finally {
                    setIsSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched }) => (
                <Form className="p-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1.5 text-slate-500" />
                          Stafi
                        </div>
                      </label>
                      <div className={`relative rounded-lg shadow-sm ${errors.stafiShkollesId && touched.stafiShkollesId ? 'ring-1 ring-red-500' : ''}`}>
                        <Field
                          as="select"
                          name="stafiShkollesId"
                          className={`w-full border ${errors.stafiShkollesId && touched.stafiShkollesId ? 'border-red-300' : 'border-slate-300'} rounded-lg py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none`}
                        >
                          <option value="">Zgjidh stafin</option>
                          {Array.isArray(staffList) &&
                            staffList.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.emri} {s.mbiemri}
                              </option>
                            ))}
                        </Field>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <ErrorMessage name="stafiShkollesId" component="div" className="text-red-600 text-sm mt-1.5" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-500" />
                          Data e angazhimit
                        </div>
                      </label>
                      <div className={`relative rounded-lg shadow-sm ${errors.dataAngazhimit && touched.dataAngazhimit ? 'ring-1 ring-red-500' : ''}`}>
                        <Field
                          name="dataAngazhimit"
                          type="date"
                          className={`w-full border ${errors.dataAngazhimit && touched.dataAngazhimit ? 'border-red-300' : 'border-slate-300'} rounded-lg py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                        />
                      </div>
                      <ErrorMessage name="dataAngazhimit" component="div" className="text-red-600 text-sm mt-1.5" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1.5 text-slate-500" />
                          Numri i orëve
                        </div>
                      </label>
                      <div className={`relative rounded-lg shadow-sm ${errors.nrOreve && touched.nrOreve ? 'ring-1 ring-red-500' : ''}`}>
                        <Field
                          name="nrOreve"
                          type="number"
                          className={`w-full border ${errors.nrOreve && touched.nrOreve ? 'border-red-300' : 'border-slate-300'} rounded-lg py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                        />
                      </div>
                      <ErrorMessage name="nrOreve" component="div" className="text-red-600 text-sm mt-1.5" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center">
                          <CurrencyEuroIcon className="w-4 h-4 mr-1.5 text-slate-500" />
                          Pagesa për orë (€)
                        </div>
                      </label>
                      <div className={`relative rounded-lg shadow-sm ${errors.pagesaPerOre && touched.pagesaPerOre ? 'ring-1 ring-red-500' : ''}`}>
                        <Field
                          name="pagesaPerOre"
                          type="number"
                          step="0.01"
                          className={`w-full border ${errors.pagesaPerOre && touched.pagesaPerOre ? 'border-red-300' : 'border-slate-300'} rounded-lg py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                        />
                      </div>
                      <ErrorMessage name="pagesaPerOre" component="div" className="text-red-600 text-sm mt-1.5" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-4 h-4 mr-1.5 text-slate-500" />
                          Shënime
                        </div>
                      </label>
                      <Field
                        as="textarea"
                        name="shenime"
                        className="w-full border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                        rows={3}
                        placeholder="Shkruaj detaje shtesë nëse nevojiten..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    {(values.nrOreve !== undefined && values.pagesaPerOre !== undefined) ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center space-x-2">
                        <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
                        <div>
                          <span className="text-slate-600 font-medium">Totali i pagesës:</span>
                          <span className="ml-2 text-green-600 font-bold">{(Number(values.nrOreve) * Number(values.pagesaPerOre)).toFixed(2)} €</span>
                        </div>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-medium hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isSubmitting ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                          Duke shtuar...
                        </>
                      ) : (
                        <>
                          <PencilSquareIcon className="w-5 h-5 mr-2" />
                          Shto orë shtesë
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-xl mr-3">
                  <ClockIcon className="w-5 h-5" />
                </div>
                Lista e orëve shtesë
              </h2>
              <button 
                onClick={fetchData} 
                className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 flex items-center gap-2"
                aria-label="Rifresko"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Rifresko</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center p-16">
                  <ArrowPathIcon className="w-12 h-12 animate-spin text-green-600 mb-4" />
                  <span className="text-slate-600 font-medium">Duke ngarkuar të dhënat...</span>
                  <span className="text-slate-500 text-sm mt-1">Ju lutem prisni</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-700 font-medium text-sm tracking-wider">
                    <tr>
                      <th className="py-4 px-4 text-left">#</th>
                      <th className="py-4 px-4 text-left">Stafi</th>
                      {entries.some(e => e.emriShkolles) && (
                        <th className="py-4 px-4 text-left">Shkolla</th>
                      )}
                      <th className="py-4 px-4 text-left">Data</th>
                      <th className="py-4 px-4 text-left">Orët</th>
                      <th className="py-4 px-4 text-left">Pagesa/Orë</th>
                      <th className="py-4 px-4 text-left">Totali</th>
                      <th className="py-4 px-4 text-left">Statusi</th>
                      <th className="py-4 px-4 text-left">Shënime</th>
                      <th className="py-4 px-4 text-center">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {entries.length > 0 ? (
                      entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-4 px-4 text-slate-900 font-medium">{entry.id}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                                <UserIcon className="h-4 w-4" />
                              </div>
                              <div className="ml-3">
                                {entry.stafi
                                  ? `${entry.stafi.emri} ${entry.stafi.mbiemri}`
                                  : staffList.find(s => s.id === entry.stafiShkollesId)?.emri + " " +
                                  staffList.find(s => s.id === entry.stafiShkollesId)?.mbiemri}
                              </div>
                            </div>
                          </td>
                          {entries.some(e => e.emriShkolles) && (
                            <td className="py-4 px-4">
                              {entry.emriShkolles || "-"}
                            </td>
                          )}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-slate-500 mr-1.5" />
                              {entry.dataAngazhimit ? entry.dataAngazhimit.split("T")[0] : ""}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              min="0"
                              value={entry.nrOreve}
                              onChange={(e) => {
                                const newValue = e.target.value === '' ? 0 : Number(e.target.value);
                                const updatedEntries = entries.map(item => 
                                  item.id === entry.id ? {...item, nrOreve: newValue} : item
                                );
                                setEntries(updatedEntries);
                              }}
                              onBlur={(e) => handleInlineEdit(entry.id, "nrOreve", e.target.value === '' ? 0 : e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                              className="border border-slate-300 rounded-md px-3 py-2 w-20 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={entry.pagesaPerOre}
                              onChange={(e) => {
                                const newValue = e.target.value === '' ? 0 : Number(e.target.value);
                                const updatedEntries = entries.map(item => 
                                  item.id === entry.id ? {...item, pagesaPerOre: newValue} : item
                                );
                                setEntries(updatedEntries);
                              }}
                              onBlur={(e) => handleInlineEdit(entry.id, "pagesaPerOre", e.target.value === '' ? 0 : e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                              className="border border-slate-300 rounded-md px-3 py-2 w-24 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                            />
                          </td>
                          <td className="py-4 px-4 font-medium text-green-600">
                            {`${(Number(entry.nrOreve || 0) * Number(entry.pagesaPerOre || 0)).toFixed(2)} €`}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.statusi)}`}>
                              {getStatusIcon(entry.statusi)}
                              {entry.statusi || "Ne pritje"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              defaultValue={entry.shenime}
                              onBlur={(e) => handleInlineEdit(entry.id, "shenime", e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                              className="border border-slate-300 rounded-md px-3 py-2 w-32 md:w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              onClick={() => handleDelete(entry.id)} 
                              className="inline-flex items-center p-2 rounded-lg text-red-600 hover:text-white hover:bg-red-600 transition-all duration-200 group"
                              aria-label="Fshi"
                            >
                              <TrashIcon className="w-5 h-5" />
                              <span className="sr-only">Fshi</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={entries.some(e => e.emriShkolles) ? 10 : 9} className="py-16 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-slate-100 rounded-full p-4 mb-4">
                              <XMarkIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-medium text-slate-600">Nuk ka të dhëna</p>
                            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                              Nuk u gjetën regjistrime të orëve shtesë. Përdorni formularin më sipër për të shtuar orë shtesë.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            {entries.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 bg-slate-50 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-4 sm:mb-0">
                  Duke shfaqur <span className="font-medium">{entries.length}</span> nga <span className="font-medium">{totalRecords}</span> rezultate
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    <ChevronLeftIcon className="w-5 h-5 mr-1.5" /> E mëparshme
                  </button>
                  <div className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    Tjetra <ChevronRightIcon className="w-5 h-5 ml-1.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OretShtese;
