import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  ReceiptRefundIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import { urlFatura } from "../../../endpoints";
import axiosInstance from "../../../api/axiosInstance";

// Interface for the invoice item
interface Fatura {
  id: number;
  porosiaId: number;
  cmimiTotal: number;
  cmimiTotalMeTVSH: number;
  dataPageses: string;
  createdAt: string;
  sasia: number;
  emriProduktit: string;
}

// Interface for the paginated response
interface PaginatedResponse {
  page: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  data: Fatura[];
  succeeded: boolean;
  message: string;
  statusCode: number;
}

// Interface for filter parameters
interface FilterParams {
  startDate: string;
  endDate: string;
  productName: string;
}

function ListaFaturat() {
  // State variables
  const [invoices, setInvoices] = useState<Fatura[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    startDate: "",
    endDate: "",
    productName: "",
  });
  // Change default to true so filters are always shown
  const [showFilters, setShowFilters] = useState(true);

  // Fetch invoices from API
  const fetchInvoices = async (page: number = 1, filterParams: FilterParams = filters) => {
    setLoading(true);
    try {
      // Use correct parameter names that match backend expectations
      const params = new URLSearchParams();
      params.append('Page', page.toString());
      params.append('RecordsPerPage', recordsPerPage.toString());
      
      // Add filters if provided
      if (filterParams.startDate) params.append('NgaData', filterParams.startDate);
      if (filterParams.endDate) params.append('DeriData', filterParams.endDate);
      if (filterParams.productName) params.append('EmriProduktit', filterParams.productName);
      
      // Make the API call with the correct endpoint path
      const response = await axiosInstance.get(`${urlFatura}/paginated`, { params });
      
      if (response.data.succeeded) {
        setInvoices(response.data.data);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
        setTotalRecords(response.data.totalRecords);
        setRecordsPerPage(response.data.recordsPerPage);
      } else {
        setToast({ 
          message: response.data.message || "Gabim gjatë marrjes së të dhënave", 
          type: "error" 
        });
      }
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      let errorMessage = "Gabim gjatë marrjes së të dhënave";
      
      if (error.response) {
        // Handle specific HTTP error codes
        if (error.response.status === 405) {
          errorMessage = "Metoda e kërkesës nuk lejohet. Ju lutemi kontaktoni administratorin.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      setToast({ message: errorMessage, type: "error" });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInvoices(1);
  }, []);

  // Calculate metrics from current invoices
  const totalInvoices = totalRecords;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.cmimiTotal, 0);
  const totalAmountWithVAT = invoices.reduce((sum, invoice) => sum + invoice.cmimiTotalMeTVSH, 0);
  const totalProducts = invoices.reduce((sum, invoice) => sum + invoice.sasia, 0);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchInvoices(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchInvoices(currentPage + 1);
    }
  };

  // Filter form handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchInvoices(1, filters);
    setToast({ message: "Filtrat u aplikuan me sukses", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      productName: "",
    };
    setFilters(resetFilters);
    fetchInvoices(1, resetFilters);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 pb-16 overflow-y-auto">
        {/* Toast notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Lista e Faturave</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Shfletoni dhe menaxhoni të gjitha faturat e shpenzimeve
                </p>
              </div>
              <Link
                to="/komuna/dashboard"
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium self-start"
              >
                ← Kthehu te Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Invoices Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Numri i Faturave</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-700 relative z-10">{totalInvoices}</p>
                )}
              </div>
              
              {/* Total Amount Card */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-green-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-green-100 mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Vlera Totale</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-700 relative z-10">{totalAmount.toFixed(2)}€</p>
                )}
              </div>
              
              {/* Total Amount with VAT Card */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-indigo-100 mb-3">
                    <ReceiptRefundIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Vlera me TVSH</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-indigo-700 relative z-10">{totalAmountWithVAT.toFixed(2)}€</p>
                )}
              </div>
              
              {/* Total Products Card */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-sm border border-amber-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-amber-100 mb-3">
                    <ChartBarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Produktet Gjithsej</h3>
                </div>
                {loading ? (
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-amber-700 relative z-10">{totalProducts}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Always visible */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Filtrat
                </h3>
                {/* Remove the toggle button to keep filters always visible */}
              </div>
              
              {/* Remove the conditional rendering to always show filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">Nga data:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">Deri më:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="productName" className="text-sm font-medium text-gray-700 mb-1">Emri i produktit:</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={filters.productName}
                    onChange={handleFilterChange}
                    placeholder="Shkruaj emrin e produktit..."
                    className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Remove the conditional rendering for filter buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center"
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Apliko Filtrat
                </button>
                
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Pastro Filtrat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Faturave
                </h3>
                
                {loading && (
                  <div className="flex items-center text-sm text-gray-500">
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Duke ngarkuar...
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <ArrowPathIcon className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p>Duke ngarkuar faturat...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <DocumentMagnifyingGlassIcon className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Nuk ka të dhëna</p>
                  <p className="text-sm">Nuk u gjetën fatura që përputhen me kriteret e kërkimit</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        {/* Removed ID column */}
                        {/* Removed ID e Porosisë column */}
                        <th className="px-6 py-4 font-semibold border-b border-blue-500">Produkti</th>
                        <th className="px-6 py-4 font-semibold border-b border-blue-500">Sasia</th>
                        <th className="px-6 py-4 font-semibold border-b border-blue-500">Çmimi Total</th>
                        <th className="px-6 py-4 font-semibold border-b border-blue-500">Çmimi me TVSH</th>
                        <th className="px-6 py-4 font-semibold border-b border-blue-500">Data e Pagesës</th>
                        <th className="px-6 py-4 font-semibold border-b border-blue-500">Data e Krijimit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((fatura, index) => (
                        <tr 
                          key={fatura.id} 
                          className={`
                            border-b border-gray-200 hover:bg-blue-50 transition-colors
                            ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          `}
                        >
                          {/* Removed ID column data */}
                          {/* Removed ID e Porosisë column data */}
                          <td className="px-6 py-4">{fatura.emriProduktit}</td>
                          <td className="px-6 py-4">{fatura.sasia}</td>
                          <td className="px-6 py-4">{fatura.cmimiTotal.toFixed(2)}€</td>
                          <td className="px-6 py-4">{fatura.cmimiTotalMeTVSH.toFixed(2)}€</td>
                          <td className="px-6 py-4">{formatDate(fatura.dataPageses)}</td>
                          <td className="px-6 py-4">{formatDate(fatura.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {!loading && invoices.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Faqja <span className="font-medium">{currentPage}</span> nga{" "}
                    <span className="font-medium">{totalPages}</span> ({totalRecords} rezultate)
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`
                        px-3 py-1 rounded-md text-sm flex items-center
                        ${currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                      `}
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-1" />
                      Para
                    </button>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`
                        px-3 py-1 rounded-md text-sm flex items-center
                        ${currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                      `}
                    >
                      Tjetër
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Pattern background style */}
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

export default ListaFaturat;
