import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import axios from "axios";
import { urlListShkolla } from "../../../endpoints";
import { StringLiteral } from "@babel/types";

interface SchoolObject {
  shkollaId: number;
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
  shkollaId: number;
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

function NdarjaBuxhetit() {
  const [ndarje, setNdarje] = useState<Ndarja[]>([]);
  const [schoolRecord, setSchoolRecord] = useState<School[]>([]);
  const [schools, setSchools] = useState<SchoolObject[]>([]);
  const [totalBudget, setTotalBudget] = useState(10230);
  const [remainingBudget, setRemainingBudget] = useState(542);
  const [selectedMonth, setSelectedMonth] = useState("Qershor 2025");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [autoAllocate, setAutoAllocate] = useState(false);
  const [daysInterval, setDaysInterval] = useState("5");

  // Add state for allocation input
  const [allocations, setAllocations] = useState<{
    [key: number]: { amount: string; isPercentage: boolean };
  }>({});

  // Mock data
  useEffect(() => {
    setSchoolRecord([
      {
        shkollaId: 1,
        emriShkolles: "Sami Frasheri",
        nrNxenesve: 850,
        buxhetiShfrytezuar: 500, // 32% of 500
        shfrytezimiAktualPerqindje: 50,
        buxhetiAktual: 1000,
        autoNdarja: false,
        drejtori: "Drejtori 1",
        adresaId: 1,
      },
      {
        shkollaId: 3,
        emriShkolles: "Xhevdet Doda",
        nrNxenesve: 720,
        buxhetiShfrytezuar: 400, // 32% of 500
        shfrytezimiAktualPerqindje: 80,
        buxhetiAktual: 500,
        autoNdarja: true,
        drejtori: "Drejtori 1",
        adresaId: 1,
      },
    ]);
    // setNdarje([
    //   {
    //     shkollaId: 1,
    //     shuma: 850,
    //     data: "25/05/2025",  // 32% of 500
    //   },
    //   {
    //     shkollaId: 3,
    //     shuma: 1000,
    //     data: "25/05/2025",  // 32% of 500
    //   }
    // ]);
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await axios.get(`${urlListShkolla}`);

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
          shkollaId: school.shkollaId,
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
    const school = schoolRecord.find((s) => s.shkollaId === schoolId);
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
        await axios.post("http://localhost:5102/api/NdarjetBuxhetit", {
          shkollaId: schoolId,
          shuma: allocationAmount,
          data: new Date().toISOString(),
          shenime: school.shenime, // Or pass textarea note if needed
        });

        await axios.put((`${urlListShkolla}/${schoolId}`), {
          drejtori: school.drejtori,
          adresaId: school.adresaId,
          nrNxenesve: school.nrNxenesve,
          buxhetiAktual: allocationAmount,
          buxhetiShfrytezuar: school.buxhetiShfrytezuar,
          autoNdarja: school.autoNdarja
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
          s.shkollaId === schoolId ? { ...s, shenime: "" } : s
        )
      );

        // Reload schools
        await loadSchools();
      } catch (error) {
        console.error(error);
        setToast({
          message: "Ndodhi një gabim gjatë ndarjes së buxhetit",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-indigo-600" />
            Ndarja e Buxhetit
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-green-700 font-semibold mb-2">
              Buxheti në dispozicion:
            </h3>
            <p className="text-3xl font-bold text-green-600">{totalBudget} €</p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h3 className="text-red-700 font-semibold mb-2">
              Buxheti i ndarë:
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {remainingBudget} €
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Për muajin:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option>Qershor 2025</option>
                <option>Korrik 2025</option>
                <option>Gusht 2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ndarja automatike:
              </label>
              <div className="flex h-10 items-center">
                <input
                  type="checkbox"
                  checked={autoAllocate}
                  onChange={(e) => setAutoAllocate(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Auto</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çdo (ditë):
              </label>
              <select
                value={daysInterval}
                onChange={(e) => setDaysInterval(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                // disabled={!autoAllocate}
              >
                <option value="1">1 ditë</option>
                <option value="2">2 ditë</option>
                <option value="3">3 ditë</option>
                <option value="5">5 ditë</option>
                <option value="7">7 ditë</option>
                <option value="10">10 ditë</option>
                <option value="14">14 ditë</option>
                <option value="30">30 ditë</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <button
                onClick={() => {
                  // Add your filter logic here
                  setToast({
                    message: "Filtrat u aplikuan me sukses",
                    type: "success",
                  });
                }}
                className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
              >
                Filtro
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Shkolla
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Shfrytëzimi i buxhetit
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                    Shuma e ndarjes
                  </th>
                  <th className="hidden sm:table-cell px-2 sm:px-2 py-2 sm:py-2 w-10 text-center text-center text-xs sm:text-sm font-semibold text-gray-900">
                    Ndarja automatike
                  </th>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 w-48 sm:w-64 text-center text-xs sm:text-sm font-semibold text-gray-900">
                    Shenime
                  </td>

                  <th className="px-4 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                    Veprime
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schoolRecord.map((school) => (
                  <tr key={school.shkollaId} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingLibraryIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {school.emriShkolles}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              school.shfrytezimiAktualPerqindje <= 40
                                ? "bg-green-600" // Green for 0% - 40%
                                : school.shfrytezimiAktualPerqindje <= 60
                                ? "bg-yellow-500" // Yellow for 41% - 60%
                                : school.shfrytezimiAktualPerqindje <= 80
                                ? "bg-orange-500" // Orange for 61% - 80%
                                : "bg-red-600" // Red for 81% - 100%
                            }`}
                            style={{width: `${Math.min(school.shfrytezimiAktualPerqindje, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                          <span>Total: {school.buxhetiAktual}€</span>
                          <span>Shfrytezuar: {school.buxhetiShfrytezuar}€</span>
                          <span>{school.shfrytezimiAktualPerqindje}%</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <input
                          type="number"
                          value={allocations[school.shkollaId]?.amount || ""}
                          onChange={(e) =>
                            handleAllocationChange(
                              school.shkollaId,
                              e.target.value
                            )
                          }
                          className="w-16 sm:w-24 p-1 sm:p-2 border border-gray-300 rounded-md text-xs sm:text-sm text-center"
                          placeholder="Shuma"
                        />
                        <button
                          onClick={() =>
                            handleAllocationTypeToggle(school.shkollaId)
                          }
                          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {allocations[school.shkollaId]?.isPercentage
                            ? "%"
                            : "€"}
                        </button>
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={school.autoNdarja}
                          onChange={(e) =>
                            handleAutoNdarjaChange(
                              school.shkollaId,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    <td className="hidden md:table-cell px-2 sm:px-2 py-2 sm:py-2 w-48 sm:w-64 text-center text-xs sm:text-sm">
                      <textarea
                        value={school.shenime} // Bind the textarea value to the school note
                        onChange={(e) => {
                          const newNote = e.target.value;
                          setSchoolRecord((prev) =>
                            prev.map((s) =>
                              s.shkollaId === school.shkollaId
                                ? { ...s, shenime: newNote } // Update the note in state
                                : s
                            )
                          );
                        }}
                        className="w-full h-16 p-2 border border-gray-300 rounded-md text-sm resize-none"
                        placeholder="Vërejtje..."
                      />
                    </td>

                    <td className="px-4 sm:px-2 py-3 sm:py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleAllocation(school.shkollaId)}
                          className="bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-indigo-700 transition"
                        >
                          Ndaj
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NdarjaBuxhetit;
