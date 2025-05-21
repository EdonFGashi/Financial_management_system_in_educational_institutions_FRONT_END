import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Sidebar from "../Sidebar";
import { urlFatura } from "../../../endpoints";
import { Fatura } from "../../../models/fatura.model";
import { generateInvoice } from "../../../utils/InvoiceGenerator";
import Swal from "sweetalert2";
import axios from "axios";
import {
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  FunnelIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";


export function useFatura() {
  const [faturat, setFaturat] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFaturat = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${urlFatura}/paginated`, {
        params: { page: 1, pageSize: 1000 },
      });
      setFaturat(response.data.data);
    } catch (error) {
      Swal.fire("Gabim", "Nuk u arrit të merret lista e faturave", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaturat(); }, []);

  return { faturat, loading };
}

export default function ListaFaturave() {
  const { faturat, loading } = useFatura();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [filterValues, setFilterValues] = useState({
    productName: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: ""
  });

  // Calculate dashboard metrics
  const calculateDashboardMetrics = () => {
    if (!faturat || faturat.length === 0) {
      return {
        totalInvoices: 0,
        totalRevenue: 0,
        averageAmount: 0,
        recentInvoices: 0
      };
    }

    const totalInvoices = faturat.length;
    const totalRevenue = faturat.reduce((sum, invoice) => sum + invoice.cmimiTotal, 0);
    const averageAmount = totalRevenue / totalInvoices;
    
    // Calculate invoices from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInvoices = faturat.filter(
      invoice => new Date(invoice.dataPageses) >= thirtyDaysAgo
    ).length;

    return {
      totalInvoices,
      totalRevenue,
      averageAmount,
      recentInvoices
    };
  };

  const metrics = calculateDashboardMetrics();

  const filteredFaturat = (faturat || []).filter((fatura) => {
    const totalPrice = fatura.cmimiTotal;
    const dataPageses = new Date(fatura.dataPageses);
    const startDate = filterValues.startDate ? new Date(filterValues.startDate) : null;
    const endDate = filterValues.endDate ? new Date(filterValues.endDate) : null;

  return (
    (!filterValues.productName || fatura.emriProduktit.toLowerCase().includes(filterValues.productName.toLowerCase())) &&
    (!filterValues.minPrice || totalPrice >= Number(filterValues.minPrice)) &&
    (!filterValues.maxPrice || totalPrice <= Number(filterValues.maxPrice)) &&
    (!startDate || dataPageses >= startDate) &&
    (!endDate || dataPageses <= endDate)
  );
  });

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getSelectedFaturat = () => {
    return selectedIds.length > 0
      ? filteredFaturat.filter(p => selectedIds.includes(p.id))
      : [];
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <div className="hidden md:block fixed h-full w-64 bg-white shadow-sm z-30">
        <Sidebar />
      </div>
      
      <main className="flex-1 min-h-screen w-full md:pl-64 pb-16 overflow-y-auto">
        {/* Red header with pattern */}
        <div className="bg-red-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Lista e Faturave</h1>
                <p className="text-red-100 text-lg max-w-2xl">
                  Shikoni dhe shkarkoni faturat tuaja
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Invoices Card */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <DocumentArrowDownIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Faturat Totale</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-700 relative z-10">{metrics.totalInvoices}</p>
                )}
              </div>
              
              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Të Ardhura Totale</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-700 relative z-10">
                    €{metrics.totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                )}
              </div>
              
              {/* Average Amount Card */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Mesatarja e Faturave</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-700 relative z-10">
                    €{metrics.averageAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                )}
              </div>
              
              {/* Recent Invoices Card */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <ClockIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Faturat e Reja (30 ditë)</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-700 relative z-10">{metrics.recentInvoices}</p>
                )}
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-red-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2 text-red-600" />
                Filtro Faturat
              </h3>
              
              <Formik 
                initialValues={filterValues} 
                onSubmit={(values) => {
                  setFilterValues(values);
                }}
              >
                {({ values, handleChange, handleSubmit }) => (
                  <Form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Artikulli</label>
                      <Field 
                        name="productName" 
                        placeholder="Emri i artikullit" 
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi minimal</label>
                      <Field 
                        name="minPrice" 
                        type="number" 
                        placeholder="€" 
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi maksimal</label>
                      <Field 
                        name="maxPrice" 
                        type="number" 
                        placeholder="€" 
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data fillestare</label>
                      <Field 
                        name="startDate" 
                        type="date" 
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data përfundimtare</label>
                      <Field 
                        name="endDate" 
                        type="date" 
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="flex items-end space-x-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          const emptyValues = {
                            productName: "",
                            minPrice: "",
                            maxPrice: "",
                            startDate: "",
                            endDate: ""
                          };
                          setFilterValues(emptyValues);
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Pastro
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors"
                      >
                        Apliko filtrat
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
            
            {/* Faturat Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <ArchiveBoxIcon className="w-5 h-5 mr-2 text-red-600" />
                  Faturat e Gjeneruara
                </h3>
                
                <div className="text-sm text-gray-500">
                  Gjithsej: <span className="font-medium">{filteredFaturat.length}</span> fatura
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-red-800 bg-red-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Duke u ngarkuar...
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-red-100">
                    <thead className="bg-red-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          <label className="inline-flex items-center cursor-pointer gap-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.length === filteredFaturat.length && filteredFaturat.length > 0}
                              onChange={() => {
                                if (selectedIds.length === filteredFaturat.length) {
                                  setSelectedIds([]);
                                } else {
                                  setSelectedIds(filteredFaturat.map(p => p.id));
                                }
                              }}
                              className="peer hidden"
                            />
                            <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-red-600 peer-checked:bg-red-600 transition-all relative flex items-center justify-center">
                              {selectedIds.length === filteredFaturat.length && filteredFaturat.length > 0 && (
                                <span className="text-white text-[10px] font-bold">✓</span>
                              )}
                            </span>
                            <span className="text-xs">Të gjitha</span>
                          </label>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Porosia ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Artikulli</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Sasia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Çmimi Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Çmimi me TVSH</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Data e Pageses</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-50">
                      {filteredFaturat.length > 0 ? (
                        filteredFaturat.map((fatura, index) => {
                          const isChecked = selectedIds.includes(fatura.id);
                          return (
                            <tr key={fatura.id} className={`hover:bg-red-50 transition-colors ${isChecked ? "bg-red-50" : ""} ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleSelect(fatura.id)}
                                    className="peer hidden"
                                  />
                                  <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-red-600 peer-checked:bg-red-600 transition-all relative flex items-center justify-center">
                                    {isChecked && (
                                      <span className="text-white text-[10px] font-bold">✓</span>
                                    )}
                                  </span>
                                </label>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fatura.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fatura.porosiaId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fatura.emriProduktit}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fatura.sasia}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                €{(fatura.cmimiTotal).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                €{(fatura.cmimiTotalMeTVSH).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(fatura.dataPageses).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                            <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-800 mb-1">Nuk u gjet asnjë faturë</p>
                            <p className="text-base text-gray-500">Provoni të ndryshoni filtrat për të gjetur atë që po kërkoni.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Download Button */}
            {selectedIds.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => generateInvoice(getSelectedFaturat())}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 transition-all duration-200"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Shkarko Faturën ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pattern background style */}
        <style>
          {`
          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0V4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          `}
        </style>
      </main>
    </div>
  );
}