import React, { useState, useEffect } from "react";
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
  ArrowPathIcon,
  DocumentTextIcon,
  ArrowTrendingDownIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import { urlOretShtese, urlStafi, urlListKomuna } from "../../../endpoints";
import axiosInstance from "../../../api/axiosInstance";
import Toast from "../../../components/Toast";
import Swal from 'sweetalert2';

// Sweet Alert initialization
// const MySwal = withReactContent(Swal);

interface StaffMember {
  id: number;
  emri: string;
  mbiemri: string;
  numriPersonal: number;
  pozita: string;
  paga: number;
  numriOreve: number;
  shkollaId: number;
  createdAt: string;
  updatedAt: string | null;
}

interface OretShteseRequest {
  id: number;
  stafiShkollesId: number;
  emriStafit: string | null;
  mbiemriStafit: string | null;
  pozita: string | null;
  emriShkolles: string;
  dataAngazhimit: string;
  nrOreve: number;
  pagesaPerOre: number;
  totalPagesa: number;
  shenime: string;
  statusi: "ne pritje" | "pritje" | "aprovuar" | "refuzuar"; // Updated to include both "ne pritje" and "pritje"
  dataStatusi: string | null;
  arsyejaStatusi: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  page: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  data: OretShteseRequest[];
  succeeded: boolean;
  message: string;
  statusCode: number;
}

interface StaffApiResponse {
  page: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  data: StaffMember[];
  succeeded: boolean;
  message: string;
  statusCode: number;
}

interface UpdateOretShteseDto {
  stafiShkollesId?: number | null;
  dataAngazhimit?: string;
  nrOreve?: number;
  pagesaPerOre?: number;
  shenime?: string;
  statusi?: string;
}

interface ApiResponseUpdate {
  data: boolean;
  succeeded: boolean;
  message: string;
  statusCode: number;
}

interface KomunaResponse {
  komunaId: number;
  qyteti: string;
  nrPopullsis: number;
  buxhetiAktual: number;
  ditaNdarjesAuto: boolean;
  userId: string;
}

function KomunaOretShtese() {
  const [requests, setRequests] = useState<OretShteseRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  
  const [selectedRequest, setSelectedRequest] = useState<OretShteseRequest | null>(null);
  const [buxheti, setBuxheti] = useState<number | null>(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [staffMap, setStaffMap] = useState<Map<number, StaffMember>>(new Map());
  
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  useEffect(() => {
    fetchOretShtese();
    fetchStaff();
    fetchBuxheti();
  }, [currentPage, itemsPerPage]);
  
  const fetchBuxheti = async () => {
    try {
      const response = await axiosInstance.get<KomunaResponse[]>(`${urlListKomuna}`);
      
      if (response.data && response.data.length > 0) {
        // Get the first komuna's budget or sum up all budgets if there are multiple
        const totalBudget = response.data.reduce((sum, komuna) => sum + komuna.buxhetiAktual, 0);
        setBuxheti(totalBudget);
      } else {
        console.error("Failed to fetch budget data: No komuna data returned");
      }
    } catch (err) {
      console.error("Error fetching budget data:", err);
    }
  };
  
  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get<StaffApiResponse>(
        `${urlStafi}/paginated?Page=1&RecordsPerPage=100`
      );
      
      if (response.data.succeeded) {
        const newStaffMap = new Map<number, StaffMember>();
        response.data.data.forEach(staff => {
          newStaffMap.set(staff.id, staff);
        });
        setStaffMap(newStaffMap);
      } else {
        console.error("Failed to fetch staff data:", response.data.message);
      }
    } catch (err) {
      console.error("Error fetching staff data:", err);
    }
  };
  
  const fetchOretShtese = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axiosInstance.get<ApiResponse>(
        `${urlOretShtese}/paginated?Page=${currentPage}&RecordsPerPage=${itemsPerPage}`
      );
      
      if (response.data.succeeded) {
        setRequests(response.data.data);
        setTotalRecords(response.data.totalRecords);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.data.message || "Ndodhi një gabim gjatë marrjes së të dhënave.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Ndodhi një gabim gjatë komunikimit me serverin.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get staff info
  const getStaffInfo = (stafiShkollesId: number) => {
    const staff = staffMap.get(stafiShkollesId);
    return {
      emri: staff?.emri || "N/A",
      mbiemri: staff?.mbiemri || "N/A",
      pozita: staff?.pozita || "N/A"
    };
  };
  
  // Helper function to map status from backend to frontend display text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "ne pritje":
      case "pritje":
        return "Në pritje";
      case "aprovuar":
        return "Aprovuar";
      case "refuzuar":
        return "Refuzuar";
      default:
        return status;
    }
  }
  
  // Helper function to map status from backend to status class
  const getStatusClass = (status: string): string => {
    if (status === "ne pritje" || status === "pritje") {
      return "bg-yellow-100 text-yellow-800";
    } else if (status === "aprovuar") {
      return "bg-green-100 text-green-800";
    } else if (status === "refuzuar") {
      return "bg-red-100 text-red-800";
    }
    return "";
  }
  
  // Helper function to check if status is pending (regardless of format)
  const isPending = (status: string): boolean => {
    return status === "ne pritje" || status === "pritje";
  }
  
  // Calculate summary stats with updated status check
  const totalRequests = totalRecords;
  const pendingRequests = requests.filter(r => isPending(r.statusi)).length;
  const approvedRequests = requests.filter(r => r.statusi === "aprovuar").length;
  const rejectedRequests = requests.filter(r => r.statusi === "refuzuar").length;
  
  const totalPendingAmount = requests
    .filter(r => isPending(r.statusi))
    .reduce((sum, r) => sum + r.totalPagesa, 0);
  
  const totalApprovedAmount = requests
    .filter(r => r.statusi === "aprovuar")
    .reduce((sum, r) => sum + r.totalPagesa, 0);
    
  const handleApprove = async (id: number) => {
    try {
      // First ask for confirmation using Swal directly
      const result = await Swal.fire({
        title: 'Konfirmo aprovimin',
        text: 'Jeni të sigurt që dëshironi ta aprovoni këtë kërkesë?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4F46E5',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Po, aprovo!',
        cancelButtonText: 'Anulo'
      });
      
      if (!result.isConfirmed) return;
      
      setIsUpdating(true);
      setUpdateError(null);
      
      // Find the request
      const request = requests.find(r => r.id === id);
      if (!request) {
        setUpdateError("Kërkesa nuk u gjet.");
        return;
      }
      
      console.log("Found request to approve:", request);
      
      // Send the entire request object but with status changed to "aprovuar"
      const updateDto = {
        id: request.id,
        stafiShkollesId: request.stafiShkollesId,
        dataAngazhimit: request.dataAngazhimit,
        nrOreve: request.nrOreve,
        pagesaPerOre: request.pagesaPerOre,
        shenime: request.shenime,
        statusi: "aprovuar"
      };
      
      console.log("Sending update DTO:", updateDto);
      
      // Send PUT request to update the overtime request status
      const response = await axiosInstance.put<ApiResponseUpdate>(
        `${urlOretShtese}/${id}`, 
        updateDto
      );
      
      console.log("Response from server:", response);
      
      if (response.data.succeeded) {
        // Update local state with the updated request
        const updatedRequests = requests.map(req => 
          req.id === id ? {...req, statusi: "aprovuar" as const} : req
        );
        setRequests(updatedRequests);
        
        // Find the updated request and set it as selected (if in modal view)
        const updatedRequest = updatedRequests.find(req => req.id === id);
        if (updatedRequest && selectedRequest?.id === id) {
          setSelectedRequest(updatedRequest);
        }
        
        // Show success toast
        setToast({
          message: "Kërkesa u aprovua me sukses!",
          type: "success"
        });
        
        // Refresh data to get updated stats and budget
        fetchOretShtese();
        fetchBuxheti();
      } else {
        setUpdateError(response.data.message || "Ndodhi një gabim gjatë aprovimit të kërkesës.");
        setToast({
          message: response.data.message || "Ndodhi një gabim gjatë aprovimit të kërkesës.",
          type: "error"
        });
      }
    } catch (err: any) {
      console.error("Error approving request:", err);
      console.error("Error details:", err.response?.data);
      setUpdateError(err.response?.data?.message || "Ndodhi një gabim gjatë komunikimit me serverin.");
      setToast({
        message: err.response?.data?.message || "Ndodhi një gabim gjatë komunikimit me serverin.",
        type: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      // First ask for confirmation using Swal directly
      const result = await Swal.fire({
        title: 'Konfirmo refuzimin',
        text: 'Jeni të sigurt që dëshironi ta refuzoni këtë kërkesë?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Po, refuzo!',
        cancelButtonText: 'Anulo'
      });
      
      if (!result.isConfirmed) return;
      
      setIsUpdating(true);
      setUpdateError(null);
      
      // Find the request
      const request = requests.find(r => r.id === id);
      if (!request) {
        setUpdateError("Kërkesa nuk u gjet.");
        return;
      }
      
      console.log("Found request to reject:", request);
      
      // Send the entire request object but with status changed to "refuzuar"
      const updateDto = {
        id: request.id,
        stafiShkollesId: request.stafiShkollesId,
        dataAngazhimit: request.dataAngazhimit,
        nrOreve: request.nrOreve,
        pagesaPerOre: request.pagesaPerOre,
        shenime: request.shenime,
        statusi: "refuzuar"
      };
      
      console.log("Sending update DTO:", updateDto);
      
      // Send PUT request to update the overtime request status
      const response = await axiosInstance.put<ApiResponseUpdate>(
        `${urlOretShtese}/${id}`, 
        updateDto
      );
      
      console.log("Response from server:", response);
      
      if (response.data.succeeded) {
        // Update local state with the updated request
        const updatedRequests = requests.map(req => 
          req.id === id ? {...req, statusi: "refuzuar" as const} : req
        );
        setRequests(updatedRequests);
        
        // Find the updated request and set it as selected (if in modal view)
        const updatedRequest = updatedRequests.find(req => req.id === id);
        if (updatedRequest && selectedRequest?.id === id) {
          setSelectedRequest(updatedRequest);
        }
        
        // Show success toast
        setToast({
          message: "Kërkesa u refuzua me sukses!",
          type: "success"
        });
        
        // Refresh data to get updated stats
        fetchOretShtese();
      } else {
        setUpdateError(response.data.message || "Ndodhi një gabim gjatë refuzimit të kërkesës.");
        setToast({
          message: response.data.message || "Ndodhi një gabim gjatë refuzimit të kërkesës.",
          type: "error"
        });
      }
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      console.error("Error details:", err.response?.data);
      setUpdateError(err.response?.data?.message || "Ndodhi një gabim gjatë komunikimit me serverin.");
      setToast({
        message: err.response?.data?.message || "Ndodhi një gabim gjatë komunikimit me serverin.",
        type: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleViewDetails = (request: OretShteseRequest) => {
    setSelectedRequest(request);
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // No need to slice the data since it's already paginated from the API
  const displayedRequests = requests;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 pb-16 overflow-y-auto">
        {/* Toast notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Kërkesat për Orë Shtesë</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Menaxhoni kërkesat e orëve shtesë të punonjësve të shkollave
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <CurrencyEuroIcon className="w-8 h-8 text-white mr-3 opacity-80" />
                  <div>
                    <p className="text-xs font-medium text-blue-100">Buxheti në dispozicion</p>
                    {buxheti !== null ? (
                      <p className="text-xl font-bold">{buxheti.toLocaleString('en-US')} €</p>
                    ) : (
                      <div className="h-7 w-24 bg-white/20 animate-pulse rounded"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Requests Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Totali i Kërkesave</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700 relative z-10">{totalRequests}</p>
              </div>
              
              {/* Pending Requests Card */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-sm border border-amber-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-amber-100 mb-3">
                    <ClockIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Në Pritje</h3>
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-amber-600">{pendingRequests}</p>
                  <p className="text-sm text-amber-700 font-medium">{totalPendingAmount.toFixed(2)} €</p>
                </div>
              </div>
              
              {/* Approved Requests Card */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-green-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-green-100 mb-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Të Aprovuara</h3>
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-green-600">{approvedRequests}</p>
                  <p className="text-sm text-green-700 font-medium">{totalApprovedAmount.toFixed(2)} €</p>
                </div>
              </div>
              
              {/* Rejected Requests Card */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-red-100 mb-3">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Të Refuzuara</h3>
                </div>
                <p className="text-3xl font-bold text-red-600 relative z-10">{rejectedRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Kërkesave për Orë Shtesë
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-blue-800 bg-blue-100">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Duke ngarkuar të dhënat...
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">Gabim gjatë ngarkimit të të dhënave</p>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                      onClick={() => fetchOretShtese()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" /> Provo përsëri
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Punonjësi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Shkolla
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Orë/Pagesa
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Statusi
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Veprime
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedRequests.length > 0 ? (
                        displayedRequests.map((request, index) => {
                          const staffInfo = getStaffInfo(request.stafiShkollesId);
                          return (
                            <React.Fragment key={request.id}>
                              <tr 
                                className={`hover:bg-blue-50 transition-colors ${
                                  expandedRow === request.id ? 'bg-blue-50' : 
                                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                } cursor-pointer`}
                                onClick={() => toggleRow(request.id)}
                              >
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {request.emriStafit ? 
                                      `${request.emriStafit} ${request.mbiemriStafit}` : 
                                      `${staffInfo.emri} ${staffInfo.mbiemri}`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {request.pozita || staffInfo.pozita}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {request.emriShkolles}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(request.dataAngazhimit).toLocaleDateString('sq-AL')}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm">
                                    <span className="font-medium">{request.nrOreve} orë</span>
                                    <span className="text-gray-500"> × {request.pagesaPerOre.toFixed(2)}€</span>
                                  </div>
                                  <div className="text-sm font-bold text-indigo-600">
                                    {request.totalPagesa.toFixed(2)}€
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${getStatusClass(request.statusi)}`}>
                                    {getStatusText(request.statusi)}
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
                                    
                                    {isPending(request.statusi) && (
                                      <>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprove(request.id);
                                          }}
                                          disabled={isUpdating}
                                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 disabled:opacity-50"
                                          title="Aprovo"
                                        >
                                          <CheckBadgeIcon className="h-5 w-5" />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReject(request.id);
                                          }}
                                          disabled={isUpdating}
                                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                                          title="Refuzuar"
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
                                <tr className="bg-blue-50/70">
                                  <td colSpan={6} className="px-6 py-4">
                                    <div className="border-l-4 border-blue-400 pl-4 py-1 mb-3 mt-1">
                                      <p className="text-sm font-medium text-gray-500">Shënimet e kërkesës:</p>
                                      <p className="text-gray-800 mt-1">{request.shenime}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div className="text-sm text-gray-500">
                                        <span className="font-medium">Kërkesa e bërë më:</span> {new Date(request.createdAt).toLocaleDateString('sq-AL')}
                                      </div>
                                      
                                      {isPending(request.statusi) && (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReject(request.id);
                                            }}
                                            className="px-3 py-1.5 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                                          >
                                            Refuzo
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApprove(request.id);
                                            }}
                                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium rounded-lg text-white hover:from-blue-700 hover:to-indigo-700"
                                          >
                                            Aprovo
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                            <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk ka kërkesa</h3>
                            <p className="text-gray-500">Nuk u gjetën kërkesa për orë shtesë</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Pagination - Updated styling */}
              {totalPages > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Shfaqur <span className="font-medium">{displayedRequests.length}</span> nga <span className="font-medium">{totalRecords}</span> rezultate
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        E mëparshme
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
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
        </div>
        
        {/* Modal - Updated styling */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <DocumentCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Detajet e Orëve Shtesë
                </h3>
                <span className={`px-2.5 py-1 text-xs leading-5 font-semibold rounded-full 
                  ${getStatusClass(selectedRequest.statusi)}`}>
                  {getStatusText(selectedRequest.statusi)}
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase">Punonjësi</p>
                    <p className="mt-1 text-gray-900 font-semibold text-lg">
                      {(() => {
                        const staffInfo = getStaffInfo(selectedRequest.stafiShkollesId);
                        return selectedRequest.emriStafit ? 
                          `${selectedRequest.emriStafit} ${selectedRequest.mbiemriStafit}` : 
                          `${staffInfo.emri} ${staffInfo.mbiemri}`;
                      })()}
                    </p>
                    <p className="mt-1 text-gray-500 text-sm">{selectedRequest.emriShkolles}</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-indigo-600 uppercase">Detajet e Pagesës</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">{selectedRequest.nrOreve} orë × {selectedRequest.pagesaPerOre.toFixed(2)}€</p>
                        <p className="text-xl font-bold text-indigo-600">{selectedRequest.totalPagesa.toFixed(2)}€</p>
                      </div>
                      <CurrencyEuroIcon className="h-10 w-10 text-indigo-300" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Data e kërkesës</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString('sq-AL')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Data e angazhimit</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedRequest.dataAngazhimit).toLocaleDateString('sq-AL')}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Shënimet</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{selectedRequest.shenime}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                {updateError && (
                  <div className="mr-auto text-sm text-red-600">
                    {updateError}
                  </div>
                )}
                
                {isPending(selectedRequest.statusi) && (
                  <>
                    <button 
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={isUpdating}
                      className="mr-3 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center"
                    >
                      {isUpdating && (
                        <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></span>
                      )}
                      Refuzo
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={isUpdating}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center shadow-sm"
                    >
                      {isUpdating && (
                        <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      )}
                      Aprovo
                    </button>
                  </>
                )}
                <button 
                  onClick={() => {
                    setSelectedRequest(null);
                    setUpdateError(null);
                  }}
                  className={`${isPending(selectedRequest.statusi) ? 'ml-0' : 'ml-auto'} bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition`}
                >
                  Mbyll
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Pattern background style */}
        <style>
          {`
          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
          `}
        </style>
      </main>
    </div>
  );
}

export default KomunaOretShtese;
