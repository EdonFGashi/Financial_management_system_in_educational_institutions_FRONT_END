import { useState, useEffect } from "react";
import { 
  CheckBadgeIcon, 
  XCircleIcon, 
  EyeIcon, 
  CalendarIcon, 
  ClockIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import oretShteseService, { OretShteseDto } from "../../../services/oretShteseService";
import { urlStafi } from "../../../endpoints";

interface StaffMember {
  id: number;
  emri: string;
  mbiemri: string;
  numriPersonal: number;
  pozita: string;
  paga: number;
  shkollaId: number;
}

interface OretShteseRequest {
  id: number;
  punetoriEmri: string;
  punetoriMbiemri: string;
  shkollaEmri: string;
  dataKerkeses: string;
  dataAngazhimit: string;
  nrOre: number;
  pagesaPerOre: number;
  totalPagesa: number;
  arsyeja: string;
  statusi: "pritje" | "aprovuar" | "refuzuar";
}

function KomunaOretShtese() {
  const [requests, setRequests] = useState<OretShteseRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<OretShteseRequest | null>(null);
  const [buxheti, setBuxheti] = useState(10000); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Fetch staff data and overtime data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Starting API requests");
        
        // Fetch staff data first
        const staffResponse = await axios.get(`${urlStafi}/paginated`, {
          params: { page: 1, recordsPerPage: 1000 }
        });
        
        if (staffResponse.data && staffResponse.data.succeeded) {
          console.log("Staff data loaded:", staffResponse.data);
          setStaffList(staffResponse.data.data || []);
        } else {
          console.error("Failed to load staff data");
        }
        
        // Then fetch overtime data
        const response = await oretShteseService.getAllOretShtese(currentPage, itemsPerPage);
        console.log("Overtime API response received:", response);
        
        if (response && response.succeeded) {
          const mappedData: OretShteseRequest[] = response.data.map(item => {
            // Find the staff member using stafiShkollesId
            const staffMember = staffResponse.data?.data?.find(
              (staff: StaffMember) => staff.id === item.stafiShkollesId
            );
            
            return {
              id: item.id,
              punetoriEmri: staffMember?.emri || item.emri || "Emër i panjohur",
              punetoriMbiemri: staffMember?.mbiemri || item.mbiemri || "Mbiemër i panjohur",
              shkollaEmri: item.shkollaEmri || "Shkollë e panjohur",
              dataKerkeses: item.createdAt || new Date().toISOString(),
              dataAngazhimit: item.dataAngazhimit,
              nrOre: item.nrOreve,
              pagesaPerOre: item.pagesaPerOre,
              totalPagesa: item.totalKosto,
              arsyeja: item.shenime || "",
              statusi: item.statusi || "pritje"
            };
          });
          
          console.log("Mapped data with staff info:", mappedData);
          setRequests(mappedData);
          setTotalRecords(response.totalRecords);
        } else {
          console.error("API response not successful:", response);
          setError("Gabim gjatë marrjes së të dhënave");
        }
      } catch (err) {
        console.error("API error:", err);
        setError("Gabim në komunikim me serverin");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, itemsPerPage]); // Refetch when page changes
  
  // Calculate summary stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.statusi === "pritje").length;
  const approvedRequests = requests.filter(r => r.statusi === "aprovuar").length;
  const rejectedRequests = requests.filter(r => r.statusi === "refuzuar").length;
  
  const totalPendingAmount = requests
    .filter(r => r.statusi === "pritje")
    .reduce((sum, r) => sum + r.totalPagesa, 0);
  
  const totalApprovedAmount = requests
    .filter(r => r.statusi === "aprovuar")
    .reduce((sum, r) => sum + r.totalPagesa, 0);
  
  const handleApprove = async (id: number) => {
    Swal.fire({
      title: "Konfirmo pagesën",
      text: "A jeni i sigurt që dëshironi të aprovoni këto orë shtesë?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Po, Aprovo",
      cancelButtonText: "Anulo",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`Approving overtime request with ID: ${id}`);
          const response = await oretShteseService.updateOretShtese(id, { 
            statusi: "aprovuar" 
          });
          
          console.log("Approval response:", response);
          
          if (response && (response.isSuccess || response.succeeded)) {
            setRequests(requests.map(req => 
              req.id === id ? {...req, statusi: "aprovuar"} : req
            ));
            setToast({ message: "Orët shtesë u aprovuan me sukses!", type: "success" });
            
            // Close the modal if it's open for this request
            if (selectedRequest?.id === id) {
              setSelectedRequest({...selectedRequest, statusi: "aprovuar"});
            }
          } else {
            setToast({ message: response.message || "Gabim gjatë aprovimit", type: "error" });
          }
        } catch (err) {
          console.error("Error during approval:", err);
          setToast({ message: "Gabim në komunikim me serverin", type: "error" });
        }
      }
    });
  };
  
  const handleReject = async (id: number) => {
    Swal.fire({
      title: "Konfirmo refuzimin",
      text: "A jeni i sigurt që dëshironi të refuzoni këto orë shtesë?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Po, Refuzo",
      cancelButtonText: "Anulo",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await oretShteseService.updateOretShtese(id, { statusi: "refuzuar" });
          
          if (response && (response.isSuccess || response.succeeded)) {
            setRequests(requests.map(req => 
              req.id === id ? {...req, statusi: "refuzuar"} : req
            ));
            setToast({ message: "Orët shtesë u refuzuan!", type: "success" });
            
            // Close the modal if it's open for this request
            if (selectedRequest?.id === id) {
              setSelectedRequest({...selectedRequest, statusi: "refuzuar"});
            }
          } else {
            setToast({ message: response.message || "Gabim gjatë refuzimit", type: "error" });
          }
        } catch (err) {
          console.error(err);
          setToast({ message: "Gabim në komunikim me serverin", type: "error" });
        }
      }
    });
  };
  
  const handleViewDetails = (request: OretShteseRequest) => {
    setSelectedRequest(request);
  };
  
  // Update pagination logic to use server-side pagination
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Row toggling
  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
      
      <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
        <Sidebar />
      </div>
      
      <main className="flex-1 md:ml-64 pb-16">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white px-6 md:px-12 py-8 md:py-12 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Kërkesat për Orë Shtesë</h1>
                <p className="text-indigo-100 text-sm md:text-base">Menaxhoni kërkesat e orëve shtesë të punonjësve të shkollave</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center bg-white bg-opacity-10 px-4 py-3 rounded-lg shadow-md backdrop-blur-sm">
                <CurrencyEuroIcon className="w-6 h-6 text-white mr-2 opacity-70" />
                <div>
                  <p className="text-xs font-medium text-indigo-100">Buxheti në dispozicion</p>
                  <p className="text-xl font-bold">{buxheti.toLocaleString('en-US')} €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Totali i kërkesave</h3>
                  <p className="text-xl font-semibold text-gray-800">{totalRequests}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Në pritje</h3>
                  <p className="text-xl font-semibold text-gray-800">{pendingRequests} <span className="text-sm text-gray-500 font-normal">({totalPendingAmount.toFixed(2)} €)</span></p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Të aprovuara</h3>
                  <p className="text-xl font-semibold text-gray-800">{approvedRequests} <span className="text-sm text-gray-500 font-normal">({totalApprovedAmount.toFixed(2)} €)</span></p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Të refuzuara</h3>
                  <p className="text-xl font-semibold text-gray-800">{rejectedRequests}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Table Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Lista e Kërkesave</h2>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-500">Duke u ngarkuar...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Provo përsëri
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punonjësi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shkolla
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orë/Pagesa
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statusi
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veprime
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.length > 0 ? (
                      requests.map((request) => (
                        <>
                          <tr 
                            key={request.id} 
                            className={`hover:bg-gray-50 cursor-pointer ${expandedRow === request.id ? 'bg-indigo-50' : ''}`}
                            onClick={() => toggleRow(request.id)}
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {request.punetoriEmri} {request.punetoriMbiemri}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {request.shkollaEmri}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(request.dataAngazhimit).toLocaleDateString('sq-AL')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <span className="font-medium">{request.nrOre} orë</span>
                                <span className="text-gray-500"> × {request.pagesaPerOre.toFixed(2)}€</span>
                              </div>
                              <div className="text-sm font-bold text-indigo-600">
                                {request.totalPagesa.toFixed(2)}€
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${request.statusi === 'pritje' ? 'bg-yellow-100 text-yellow-800' : 
                                  request.statusi === 'aprovuar' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {request.statusi === 'pritje' ? 'Në pritje' : 
                                 request.statusi === 'aprovuar' ? 'Aprovuar' : 'Refuzuar'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-3">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(request);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                                  title="Shiko detajet"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                
                                {request.statusi === 'pritje' && (
                                  <>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(request.id);
                                      }}
                                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                      title="Aprovo"
                                    >
                                      <CheckBadgeIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(request.id);
                                      }}
                                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                      title="Refuzo"
                                    >
                                      <XCircleIcon className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                                
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRow(request.id);
                                  }}
                                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                >
                                  <ChevronDownIcon 
                                    className={`h-5 w-5 transform transition-transform duration-200 ${
                                      expandedRow === request.id ? 'rotate-180' : ''
                                    }`} 
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {expandedRow === request.id && (
                            <tr className="bg-gray-50">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="border-l-4 border-indigo-400 pl-4 py-1 mb-3 mt-1">
                                  <p className="text-sm font-medium text-gray-500">Arsyeja e kërkesës:</p>
                                  <p className="text-gray-800 mt-1">{request.arsyeja}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-gray-500">
                                    <span className="font-medium">Kërkesa e bërë më:</span> {new Date(request.dataKerkeses).toLocaleDateString('sq-AL')}
                                  </div>
                                  
                                  {request.statusi === 'pritje' && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleReject(request.id)}
                                        className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        Refuzo
                                      </button>
                                      <button
                                        onClick={() => handleApprove(request.id)}
                                        className="px-3 py-1.5 bg-indigo-600 text-sm font-medium rounded-md text-white hover:bg-indigo-700"
                                      >
                                        Aprovo
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                          Nuk ka kërkesa për të shfaqur.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Shfaqur <span className="font-medium">{requests.length}</span> nga <span className="font-medium">{totalRecords}</span> rezultate
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      E mëparshme
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      E ardhshme
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Improved Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Detajet e Orëve Shtesë</h3>
                <span className={`px-2.5 py-1 text-xs leading-5 font-semibold rounded-full 
                  ${selectedRequest.statusi === 'pritje' ? 'bg-yellow-100 text-yellow-800' : 
                    selectedRequest.statusi === 'aprovuar' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {selectedRequest.statusi === 'pritje' ? 'Në pritje' : 
                   selectedRequest.statusi === 'aprovuar' ? 'Aprovuar' : 'Refuzuar'}
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase">Punonjësi</p>
                    <p className="mt-1 text-gray-900 font-semibold text-lg">{selectedRequest.punetoriEmri} {selectedRequest.punetoriMbiemri}</p>
                    <p className="mt-1 text-gray-500 text-sm">{selectedRequest.shkollaEmri}</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-indigo-600 uppercase">Detajet e Pagesës</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">{selectedRequest.nrOre} orë × {selectedRequest.pagesaPerOre.toFixed(2)}€</p>
                        <p className="text-xl font-bold text-indigo-600">{selectedRequest.totalPagesa.toFixed(2)}€</p>
                      </div>
                      <CurrencyEuroIcon className="h-10 w-10 text-indigo-300" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Data e kërkesës</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedRequest.dataKerkeses).toLocaleDateString('sq-AL')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Data e angazhimit</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedRequest.dataAngazhimit).toLocaleDateString('sq-AL')}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Arsyeja e kërkesës</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{selectedRequest.arsyeja}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                {selectedRequest.statusi === 'pritje' && (
                  <>
                    <button 
                      onClick={() => handleReject(selectedRequest.id)}
                      className="mr-3 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Refuzo
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="bg-indigo-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-700 transition"
                    >
                      Aprovo
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className={`${selectedRequest.statusi === 'pritje' ? 'mr-3' : ''} bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition`}
                >
                  Mbyll
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default KomunaOretShtese;
