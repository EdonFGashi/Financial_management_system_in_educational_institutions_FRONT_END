import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";
import Sidebar from "../pages/komuna/Sidebar";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

interface Operation {
  operationId: number;
  name: string;
  verb: string;
  resource: string;
}

type OperationFormValues = {
  operationId: number;
  name: string;
  verb: string;
  resource: string;
};

const OperationsList = () => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);

  const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  const filterValues = { id: 0, name: "", verb: "", resource: "" };

  useEffect(() => {
    loadOperations();
  }, [currentPage]);

  async function loadOperations() {
    try {
      const response = await axios.get(
        "http://localhost:5102/api/operations/getOperations"
      );
      console.log(response.data);
      setOperations(response.data.data);
      setFilteredOperations(response.data.data);
    } catch (error) {
      console.error("Failed to load operations:", error);
    }
  }

  const handleFilter = (values: typeof filterValues) => {
    const filtered = operations.filter((op) => {
      return (
        (values.name === "" ||
          op.name.toLowerCase().includes(values.name.toLowerCase())) &&
        (values.verb === "" || op.verb === values.verb) &&
        (values.resource === "" ||
          op.resource.toLowerCase().includes(values.resource.toLowerCase()))
      );
    });
    setFilteredOperations(filtered);
  };

  async function handleSubmit(data: OperationFormValues) {
    try {
      console.log(data);
      const response = await axios.post(
        "http://localhost:5102/api/operations/createOperation",
        data
      );
      loadOperations();
      setOperations((prevOperations) => [...prevOperations, response.data.data]);
      Swal.fire("Success", "Operation added successfully!", "success");
    } catch (error: any) {
      console.error("Failed to add operation:", error);
      throw error;
    }
  }

  const handleDelete = async (id: number) => {
    try {
      console.log("idja", id);
      const response = await axios.delete(
        `http://localhost:5102/api/operations/${id}`
      );
      loadOperations();
      if (response.status === 200) {
        setOperations(operations.filter((op) => op.operationId !== id));
        setFilteredOperations(
          filteredOperations.filter((op) => op.operationId !== id)
        );
        Swal.fire("Deleted!", "The operation has been deleted.", "success");
      }
    } catch (error) {
      console.error("Failed to delete operation:", error);
      Swal.fire("Error", "Failed to delete the operation.", "error");
    }
  };

  // const handleEdit = (id: number) => {
  //   Swal.fire("Edit", `Editing operation with ID: ${id}`, "info");
  //   // Implement the logic to show a modal or form to edit the operation.
  // };
  const handleEdit = (operation: Operation) => {
    setSelectedOperation(operation);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to form if needed
  };

  const handleUpdate = async (data: OperationFormValues) => {
    try {
      const response = await axios.put(
        `http://localhost:5102/api/operations/getOperations/${data.operationId}`,
        data
      );
console.log("u editua: ", data);
await loadOperations();
      const updated = response.data;
      setOperations((prev) =>
        prev.map((op) =>
          op.operationId === updated.operationId ? updated : op
        )
      );
      setFilteredOperations((prev) =>
        prev.map((op) =>
          op.operationId === updated.operationId ? updated : op
        )
      );

      setSelectedOperation(null); // Reset the form
      Swal.fire("Success", "Operation updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update operation:", error);
      Swal.fire("Error", "Failed to update operation", "error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-gray-800">
              <BuildingLibraryIcon className="w-8 h-8 text-indigo-600" />
              Operations Management
            </h2>
            <p className="mt-2 text-gray-600">Configure and manage API operations and endpoints</p>
          </div>

          {/* Filter Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Filter Operations</h3>
            <Formik initialValues={filterValues} onSubmit={handleFilter}>
              <Form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Field
                    name="name"
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                  <Field
                    as="select"
                    name="verb"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Methods</option>
                    {methodOptions.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                  <Field
                    name="resource"
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by resource..."
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </Form>
            </Formik>
          </div>

          {/* Add/Edit Form Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {selectedOperation ? "Edit Operation" : "Add New Operation"}
            </h3>
            <Formik
              enableReinitialize
              initialValues={
                selectedOperation
                  ? {
                      operationId: selectedOperation.operationId,
                      name: selectedOperation.name,
                      verb: selectedOperation.verb,
                      resource: selectedOperation.resource,
                    }
                  : { operationId: 0, name: "", verb: "GET", resource: "" }
              }
              onSubmit={(values, { resetForm }) => {
                if (selectedOperation) {
                  handleUpdate(values);
                } else {
                  handleSubmit(values);
                }
                resetForm();
              }}
            >
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operation Name</label>
                    <Field 
                      name="name" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter operation name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                    <Field
                      as="select"
                      name="verb"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {methodOptions.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Path</label>
                    <Field
                      name="resource"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter resource path..."
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                  >
                    {selectedOperation ? "Update Operation" : "Add Operation"}
                  </button>
                  {selectedOperation && (
                    <button
                      type="button"
                      onClick={() => setSelectedOperation(null)}
                      className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </Form>
            </Formik>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredOperations.length > 0 ? filteredOperations : operations).map((op) => (
                    <tr key={`${op.operationId}-${op.name}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${op.verb === 'GET' ? 'bg-blue-100 text-blue-800' : 
                            op.verb === 'POST' ? 'bg-green-100 text-green-800' :
                            op.verb === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            op.verb === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {op.verb}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.resource}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(op)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(op.operationId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperationsList;
