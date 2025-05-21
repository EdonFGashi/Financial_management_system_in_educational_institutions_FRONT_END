import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import axiosInstance from "../../../api/axiosInstance";
import { urlListKomuna, urlListShkolla } from "../../../endpoints";
import { isAxiosError } from "axios"; // Keep only the isAxiosError helper

interface SchoolObject {
  id: number;
  emriShkolles: string;
  nrNxenesve: number;
  buxhetiAktual: number;
  buxhetiShfrytezuar: number; // Add this
  autoNdarja: boolean; // Add this
  drejtori: string;
  adresaId: number;
}

interface Ndarja {
  shkollaId: number;
  shuma: number;
  data: string;
  shenime: string;
}

interface School {
  id: number;
  emriShkolles: string;
  nrNxenesve: number;
  shfrytezimiAktualPerqindje: number;
  buxhetiAktual: number;
  buxhetiShfrytezuar: number; // Add this
  autoNdarja: boolean; // Add this
  shenime?: string; // Optional field for notes
  drejtori: string;
  adresaId: number;
}

interface KomunaResponse {
  buxhetiAktual: number; // Define the structure of the response
}


function NdarjaBuxhetit() {
  const [ndarje, setNdarje] = useState<Ndarja[]>([]);
  const [schoolRecord, setSchoolRecord] = useState<School[]>([]);
  const [schools, setSchools] = useState<SchoolObject[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("Qershor 2025");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [daysInterval, setDaysInterval] = useState("5");

  // Add state for allocation input
  const [allocations, setAllocations] = useState<{
    [key: number]: { amount: string; isPercentage: boolean };
  }>({});

  useEffect(() => {
    // Remove mock data
    loadSchools();
    loadKomunaBudget();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await axiosInstance.get(`${urlListShkolla}/get-all`);

      // Extract the data array from the response
      const schoolsData = response.data.data;

      // Ensure that schoolsData is an array before calling map
      if (!Array.isArray(schoolsData)) {
        console.error("Expected an array, but got:", schoolsData);
        return;
      }

      // Mapping the API data to match the School interface
      const mappedSchools: School[] = schoolsData.map((school) => {
        const shfrytezimiAktualPerqindje = school.buxhetiAktual
          ? ((school.buxhetiShfrytezuar / school.buxhetiAktual) * 100).toFixed(
              2
            ) // Keeps 2 decimal places
          : "0.00"; // Default to "0.00" if no data

        return {
          id: school.id,
          emriShkolles: school.emriShkolles,
          nrNxenesve: school.nrNxenesve,
          buxhetiAktual: school.buxhetiAktual,
          buxhetiShfrytezuar: school.buxhetiShfrytezuar,
          shfrytezimiAktualPerqindje: parseFloat(shfrytezimiAktualPerqindje),
          autoNdarja: school.autoNdarja, // Assuming this field exists in your API response
          drejtori: school.drejtori,
          adresaId: school.adresaId
        };
      });

      // Now we are setting the state with the mapped data
      setSchoolRecord(mappedSchools);

      console.log("Mapped Schools:", mappedSchools); // To verify the result
    } catch (error) {
      console.error("Failed to load schools:", error);
    }
  };

  const loadKomunaBudget = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }
      const userId = token.split(".")[1];
      const decodedUserId = JSON.parse(atob(userId));
  
      const response = await axiosInstance.get<KomunaResponse>(`${urlListKomuna}/${decodedUserId.id}`);
      const buxhetiAktual = response.data.buxhetiAktual;
  
      // if (komuna && typeof komuna.buxhetiAktual === "number") {
        setTotalBudget(buxhetiAktual);
      // } else {
      //   console.warn("BuxhetiAktual nuk u gjet në përgjigje:", komuna);
      // }
    } catch (error) {
      console.error("Gabim gjatë marrjes së buxhetit të komunës:", error);
      setToast({
        message: "Gabim gjatë marrjes së buxhetit të komunës",
        type: "error",
      });
    }
  };
  
  

  const handleAutoNdarjaChange = (id: number, checked: boolean) => {
    setSchoolRecord((prev: any[]) =>
      prev.map((record) =>
        record.id === id ? { ...record, autoNdarja: checked } : record
      )
    );
  };

  // Add handler for allocation type toggle
  const handleAllocationTypeToggle = (schoolId: number) => {
    setAllocations((prev) => ({
      ...prev,
      [schoolId]: {
        amount: prev[schoolId]?.amount || "",
        isPercentage: !prev[schoolId]?.isPercentage,
      },
    }));
  };

  // Add handler for allocation input change
  const handleAllocationChange = (schoolId: number, value: string) => {
    setAllocations((prev) => ({
      ...prev,
      [schoolId]: {
        ...prev[schoolId],
        amount: value,
      },
    }));
  };

  const handleAllocation = async (schoolId: number) => {
    const school = schoolRecord.find((s) => s.id === schoolId);
    const allocation = allocations[schoolId];

    if (!school || !allocation?.amount) {
      setToast({
        message: "Ju lutem vendosni shumën për ndarje",
        type: "error",
      });
      return;
    }

    let allocationAmount: number;
    if (allocation.isPercentage) {
      allocationAmount =
        (parseFloat(allocation.amount) / 100) * school.buxhetiAktual;
    } else {
      allocationAmount = parseFloat(allocation.amount);
    }

    if (isNaN(allocationAmount)) {
      setToast({
        message: "Shuma e ndarjes nuk është e vlefshme",
        type: "error",
      });
      return;
    }

    if(allocationAmount < 0 && school.buxhetiAktual + allocationAmount < 0) {
      await Swal.fire({
        title: "Njoftim",
        text: `Ju nuk mund të të zvogëloni buxhetin më shumë se sa është aktualisht!`,
        icon: "info", // You can use 'success', 'warning', 'error', etc. depending on the context
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK"
      });
      return;
    }

    const result = await Swal.fire({
      title: "Konfirmo ndarjen e buxhetit",
      text: `A jeni të sigurt që dëshironi të ${
        allocationAmount >= 0 ? "ndani" : "zvogëloni"
      } ${Math.abs(allocationAmount)}€ për shkollën "${school.emriShkolles}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Po, vazhdo",
      cancelButtonText: "Anulo",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token not found in localStorage");
        }
        const userId = token.split(".")[1];
        const decodedUserId = JSON.parse(atob(userId));

        const response = await axiosInstance.put(`${urlListKomuna}/${decodedUserId.id}`, {
          komunaId: 0,
          qyteti: "",
          DitaNdarjesAuto: false,
          BuxhetiAktual: allocationAmount,
          UserId: "",
          nrPopullsis: 0
        });

        console.log("ERRORII: ",response?.data);
        if(response.status == 200) {
          await Swal.fire({
            title: "Njoftim",
            text: "Ndarja e buxhetit u realizua me sukses!",
            icon: "info", // You can use 'success', 'warning', 'error', etc. depending on the context
            confirmButtonColor: "#16a34a",
            confirmButtonText: "OK"
          });
        }
        if(response.data == "Ju nuk keni buxhet të mjaftueshëm !") {
          await Swal.fire({
            title: "Njoftim",
            text: `${response.statusText}`,
            icon: "info", // You can use 'success', 'warning', 'error', etc. depending on the context
            confirmButtonColor: "#16a34a",
            confirmButtonText: "OK"
          });
          return;
        }

        // try {
        //   const response = await axios.put(...);
        // } catch (error) {
        //   if (axios.isAxiosError(error)) {
        //     if (error.response?.data === "Ju nuk keni buxhet të mjaftueshëm !") {
        //       setToast({
        //         message: error.response.data,
        //         type: "error",
        //       });
        //       return;
        //     }
        //   }
        // }
        

        await axiosInstance.put(`${urlListShkolla}/${schoolId}`, {
          drejtori: school.drejtori,
          adresaId: school.adresaId,
          nrNxenesve: school.nrNxenesve,
          buxhetiAktual: allocationAmount,
          buxhetiShfrytezuar: school.buxhetiShfrytezuar,
          autoNdarja: school.autoNdarja
        });

        await axiosInstance.post("http://localhost:5102/api/NdarjetBuxhetit", {
          shkollaId: schoolId,
          shuma: allocationAmount,
          data: new Date().toISOString(),
          shenime: school.shenime,
        });   

        setToast({
          message: "Ndarja u realizua me sukses!",
          type: "success",
        });


        // Clear input
        setAllocations((prev) => ({
          ...prev,
          [schoolId]: { amount: "", isPercentage: false }, // Reset allocation input
        }));
        setSchoolRecord((prev) =>
        prev.map((s) =>
          s.id === schoolId ? { ...s, shenime: "" } : s
        )
      );

        // Reload schools
        await loadKomunaBudget();
        await loadSchools();
      } catch (error: any) {
        console.error(error);
      
        // Update to use the imported isAxiosError helper
        if (
          isAxiosError(error) &&
          error.response?.data === "Ju nuk keni buxhet të mjaftueshëm !"
        ) {
          await Swal.fire({
            title: "Gabim",
            text: "Ju nuk keni buxhet të mjaftueshëm !",
            icon: "error",
            confirmButtonColor: "#dc2626",
            confirmButtonText: "OK"
          });
          return;
        }
      
        // Fallback for other errors
        setToast({
          message: "Ndodhi një gabim gjatë ndarjes së buxhetit",
          type: "error",
        });
      }
      
    }
  };

  // Calculate budget allocation statistics
  const calculateBudgetStats = () => {
    if (!schoolRecord || schoolRecord.length === 0) {
      return {
        totalAllocated: 0,
        highestAllocation: 0
      };
    }

    const totalAllocated = schoolRecord.reduce((sum, school) => sum + school.buxhetiAktual, 0);
    const highestAllocation = Math.max(...schoolRecord.map(school => school.buxhetiAktual));

    return {
      totalAllocated,
      highestAllocation
    };
  };

  const budgetStats = calculateBudgetStats();

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
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Ndarja e Buxhetit</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Menaxhoni dhe ndani buxhetin për institucionet arsimore
                </p>
              </div>
              <Link
                to="/komuna/dashboard"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium self-start"
              >
                ← Kthehu te Dashboard
              </Link>
            </div>
          </div>
        </div>
        
        {/* Budget Dashboard */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Total Budget Overview Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 mb-8 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                <div>
                  <h3 className="text-lg font-medium text-blue-100 mb-1">Buxheti në dispozicion</h3>
                  <p className="text-4xl font-bold">{totalBudget.toLocaleString()} €</p>
                  <p className="text-blue-200 mt-1">Për muajin: {selectedMonth}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <button 
                    onClick={() => loadKomunaBudget()} 
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-all duration-200 flex items-center"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Rifresko Buxhetin
                  </button>
                </div>
              </div>
            </div>

            {/* Budget Statistics - Updated to 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Total Allocated Card */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-blue-100 mb-3">
                    <BanknotesIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Totali i Ndarjes</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700 relative z-10">
                  €{budgetStats.totalAllocated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
              
              {/* Highest Allocation Card */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-[100px] -z-0"></div>
                <div className="flex flex-col items-start mb-2 relative z-10">
                  <div className="p-3 rounded-xl bg-purple-100 mb-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Ndarja Maksimale</h3>
                </div>
                <p className="text-3xl font-bold text-purple-700 relative z-10">
                  €{budgetStats.highestAllocation.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <BuildingLibraryIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Lista e Shkollave
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Shkolla
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Shfrytëzimi i buxhetit
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Shuma e ndarjes
                      </th>
                      <th scope="col" className="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Shënime
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Veprime
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schoolRecord.map((school, index) => (
                      <tr key={school.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingLibraryIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{school.emriShkolles}</div>
                              <div className="text-xs text-gray-500">{school.nrNxenesve} nxënës</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  school.shfrytezimiAktualPerqindje <= 40
                                    ? "bg-green-500" // Green for 0% - 40%
                                    : school.shfrytezimiAktualPerqindje <= 60
                                    ? "bg-yellow-500" // Yellow for 41% - 60%
                                    : school.shfrytezimiAktualPerqindje <= 80
                                    ? "bg-orange-500" // Orange for 61% - 80%
                                    : "bg-red-500" // Red for 81% - 100%
                                }`}
                                style={{width: `${Math.min(school.shfrytezimiAktualPerqindje, 100)}%`}}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <div className="flex flex-col">
                                <span className="font-medium">Total:</span>
                                <span className="text-gray-900">{school.buxhetiAktual}€</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">Shfrytëzuar:</span>
                                <span className="text-gray-900">{school.buxhetiShfrytezuar}€</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">Përqindja:</span>
                                <span className={`text-gray-900 ${
                                  school.shfrytezimiAktualPerqindje > 80 ? 'text-red-600 font-medium' : ''
                                }`}>
                                  {school.shfrytezimiAktualPerqindje}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="relative rounded-md shadow-sm">
                              <input
                                type="number"
                                value={allocations[school.id]?.amount || ""}
                                onChange={(e) => handleAllocationChange(school.id, e.target.value)}
                                className="w-28 pl-3 pr-12 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-center"
                                placeholder="Shuma"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span 
                                  className="text-gray-500 sm:text-sm cursor-pointer"
                                  onClick={() => handleAllocationTypeToggle(school.id)}
                                >
                                  €
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="hidden md:table-cell px-6 py-4">
                          <textarea
                            value={school.shenime || ""}
                            onChange={(e) => {
                              const newNote = e.target.value;
                              setSchoolRecord((prev) =>
                                prev.map((s) =>
                                  s.id === school.id ? { ...s, shenime: newNote } : s
                                )
                              );
                            }}
                            className="w-full h-16 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Shënime për ndarjen e buxhetit..."
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleAllocation(school.id)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              Ndaj
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {schoolRecord.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          <BuildingLibraryIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk u gjetën shkolla</h3>
                          <p className="text-gray-500">Nuk u gjetën shkolla për të shfaqur.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

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

export default NdarjaBuxhetit;
