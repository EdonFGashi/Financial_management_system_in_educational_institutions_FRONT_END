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
    <div className="flex min-h-screen bg-gray-50">
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
                  {buxheti !== null ? (
                    <p className="text-xl font-bold">{buxheti.toLocaleString('en-US')} €</p>
                  ) : (
                    <div className="h-7 w-24 bg-white bg-opacity-20 animate-pulse rounded"></div>
                  )}
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
                    onClick={() => fetchOretShtese()}
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
                    {displayedRequests.length > 0 ? (
                      displayedRequests.map((request) => {
                        const staffInfo = getStaffInfo(request.stafiShkollesId);
                        return (
                          <React.Fragment key={request.id}>
                            <tr 
                              className={`hover:bg-gray-50 cursor-pointer ${expandedRow === request.id ? 'bg-indigo-50' : ''}`}
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
                              <tr className="bg-gray-50">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="border-l-4 border-indigo-400 pl-4 py-1 mb-3 mt-1">
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
                          </React.Fragment>
                        );
                      })
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
                    Shfaqur <span className="font-medium">{displayedRequests.length}</span> nga <span className="font-medium">{totalRecords}</span> rezultate
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
        
        {/* Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Detajet e Orëve Shtesë</h3>
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
                      className="mr-3 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center"
                    >
                      {isUpdating && (
                        <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></span>
                      )}
                      Refuzo
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={isUpdating}
                      className="bg-indigo-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50 flex items-center"
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
                  className={`${selectedRequest.statusi === 'pritje' ? 'mr-3' : ''} bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition`}
                >
                  Mbyll
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast notification using the new Toast component */}
        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default KomunaOretShtese;
