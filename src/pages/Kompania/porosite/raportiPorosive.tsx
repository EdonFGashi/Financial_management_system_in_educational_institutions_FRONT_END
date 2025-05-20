import { useState } from "react";
import { Formik, Form, Field } from "formik";
import Sidebar from "../Sidebar";
import { 
  DocumentChartBarIcon, 
  FunnelIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  BuildingLibraryIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

interface Porosia {
  id: number;
  item: string;
  quantity: number;
  dateCreated: string;
  school: string;
  approvalStatus: "Pending" | "Approved" | "Refused";
  orderStatus: "Processing" | "Completed" | "Cancelled";
  price: number;
}

const initialPorosite: Porosia[] = [
  {
    id: 1,
    item: "Laptop",
    quantity: 2,
    dateCreated: "2025-04-27",
    school: "Shkolla 1",
    approvalStatus: "Pending",
    orderStatus: "Processing",
    price: 1200,
  },
  {
    id: 2,
    item: "Libra",
    quantity: 50,
    dateCreated: "2025-04-26",
    school: "Shkolla 2",
    approvalStatus: "Approved",
    orderStatus: "Completed",
    price: 300,
  },
];

export default function ListaPorosiveKompani() {
  const [porosite] = useState<Porosia[]>(initialPorosite);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Calculate report metrics
  const calculateReportMetrics = () => {
    const totalOrders = porosite.length;
    const totalValue = porosite.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    const pendingOrders = porosite.filter(order => order.approvalStatus === "Pending").length;
    const completedOrders = porosite.filter(order => order.orderStatus === "Completed").length;
    
    return {
      totalOrders,
      totalValue,
      pendingOrders,
      completedOrders
    };
  };

  const metrics = calculateReportMetrics();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm z-20">
        <Sidebar />
      </div>
      
      <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
        {/* Header - Updated with gradient */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-20"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Raporti i Porosive</h1>
                <p className="text-white text-lg max-w-2xl">
                  Gjenero raporte të detajuara për porositë dhe produktet
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Dashboard Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Orders Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <DocumentChartBarIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Porosi Totale</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">{metrics.totalOrders}</p>
            </div>
            
            {/* Value Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <ChartBarIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Vlera Totale</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">
                €{metrics.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            
            {/* Pending Orders Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <ClockIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Porosi në Pritje</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">{metrics.pendingOrders}</p>
            </div>
            
            {/* Completed Orders Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <CheckCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Porosi të Përfunduara</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">{metrics.completedOrders}</p>
            </div>
          </div>

          {/* Filter Form - Updated with red theme */}
          <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 mb-8 border border-red-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2 text-red-500" />
              Filtro Raportin
            </h2>
            <Formik
              initialValues={{
                item: "",
                school: "",
                approvalStatus: "",
                orderStatus: "",
                minPrice: "",
                maxPrice: "",
              }}
              onSubmit={() => {}}
            >
              {({ values, handleChange }) => {
                const filteredPorosite = porosite.filter((porosi) => {
                  return (
                    (!values.item || porosi.item.toLowerCase().includes(values.item.toLowerCase())) &&
                    (!values.school || porosi.school.toLowerCase().includes(values.school.toLowerCase())) &&
                    (!values.approvalStatus || porosi.approvalStatus === values.approvalStatus) &&
                    (!values.orderStatus || porosi.orderStatus === values.orderStatus) &&
                    (!values.minPrice || porosi.price >= Number(values.minPrice)) &&
                    (!values.maxPrice || porosi.price <= Number(values.maxPrice))
                  );
                });

                return (
                  <>
                    <Form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Artikulli</label>
                        <Field 
                          name="item" 
                          type="text" 
                          onChange={handleChange} 
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shkolla</label>
                        <Field 
                          name="school" 
                          type="text" 
                          onChange={handleChange} 
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statusi i Miratimit</label>
                        <Field 
                          name="approvalStatus" 
                          as="select" 
                          onChange={handleChange} 
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value="">Të gjitha</option>
                          <option value="Pending">Në Pritje</option>
                          <option value="Approved">Miratuar</option>
                          <option value="Refused">Refuzuar</option>
                        </Field>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statusi i Porosisë</label>
                        <Field 
                          name="orderStatus" 
                          as="select" 
                          onChange={handleChange} 
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value="">Të gjitha</option>
                          <option value="Processing">Në Proces</option>
                          <option value="Completed">Përfunduar</option>
                          <option value="Cancelled">Anuluar</option>
                        </Field>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi Minimal (€)</label>
                        <Field 
                          name="minPrice" 
                          type="number" 
                          onChange={handleChange} 
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi Maksimal (€)</label>
                        <Field 
                          name="maxPrice" 
                          type="number" 
                          onChange={handleChange} 
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white" 
                        />
                      </div>
                    </Form>

                    {/* Table - Enhanced with red theme */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8 mb-6 border border-red-100">
                      <table className="min-w-full divide-y divide-red-100">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Porosia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Sasia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Shkolla</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Çmimi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Statusi</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-red-700 uppercase tracking-wider">Përfshi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-50">
                          {filteredPorosite.length > 0 ? (
                            filteredPorosite.map((porosi) => (
                              <tr key={porosi.id} className="hover:bg-red-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{porosi.item}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{porosi.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <BuildingLibraryIcon className="w-4 h-4 text-gray-400 mr-1" />
                                    {porosi.school}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{porosi.dateCreated}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">€{(porosi.price * porosi.quantity).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    porosi.orderStatus === "Completed" 
                                      ? "bg-green-100 text-green-800" 
                                      : porosi.orderStatus === "Processing"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {porosi.orderStatus === "Completed" && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                                    {porosi.orderStatus === "Processing" && <ClockIcon className="h-3 w-3 mr-1" />}
                                    {porosi.orderStatus === "Cancelled" && <XCircleIcon className="h-3 w-3 mr-1" />}
                                    {porosi.orderStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(porosi.id)}
                                      onChange={() => toggleSelection(porosi.id)}
                                      className="peer hidden"
                                    />
                                    <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-red-600 peer-checked:bg-red-600 transition-all relative flex items-center justify-center">
                                      {selectedIds.includes(porosi.id) && (
                                        <span className="text-white text-[10px] font-bold">✓</span>
                                      )}
                                    </span>
                                  </label>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                Nuk u gjet asnjë porosi që përputhet me kriteret e kërkimit.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Generate Report Button - Enhanced */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          const selectedPorosite = porosite.filter(p => selectedIds.includes(p.id));
                          console.log("Selected for report:", selectedPorosite);
                        }}
                        disabled={selectedIds.length === 0}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg ${
                          selectedIds.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 transition-all duration-200'
                        }`}
                      >
                        <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                        Gjenero Raportin {selectedIds.length > 0 && `(${selectedIds.length})`}
                      </button>
                    </div>
                  </>
                );
              }}
            </Formik>
          </div>
        </div>
      </main>

      {/* Pattern background style */}
      <style>
        {`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        `}
      </style>
    </div>
  );
}
