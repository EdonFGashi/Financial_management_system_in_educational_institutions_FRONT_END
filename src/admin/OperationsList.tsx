import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";
import Sidebar from "../pages/komuna/Sidebar";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import axios from "axios";

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
      setOperations(response.data);
      setFilteredOperations(response.data);
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
      setOperations((prevOperations) => [...prevOperations, response.data]);
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
        `http://localhost:5102/api/operations/${data.operationId}`,
        data
      );
console.log("u editua: ", data);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-8">
            <BuildingLibraryIcon className="w-7 h-7 text-indigo-600" />
            Operations List
          </h2>

          {/* Filter Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
            <Formik initialValues={filterValues} onSubmit={handleFilter}>
              <Form className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Field
                    name="name"
                    type="text"
                    className="p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Verb</label>
                  <Field
                    as="select"
                    name="verb"
                    className="p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    {methodOptions.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Resource
                  </label>
                  <Field
                    name="resource"
                    type="text"
                    className="p-2 border rounded-md"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Filter
                  </button>
                </div>
              </Form>
            </Formik>
          </div>

          {/* Add New Operation Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
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
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <Field name="name" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Verb</label>
                  <Field
                    as="select"
                    name="verb"
                    className="w-full p-2 border rounded-md"
                  >
                    {methodOptions.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium">Resource</label>
                  <Field
                    name="resource"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {selectedOperation ? "Update Operation" : "Add Operation"}
                  </button>
                  {selectedOperation && (
                    <button
                      type="button"
                      onClick={() => setSelectedOperation(null)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </Form>
            </Formik>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <table className="min-w-full table-auto">
              <thead>
                <tr key={1}>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Verb</th>
                  <th className="px-4 py-2 border">Resource</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredOperations.length > 0
                  ? filteredOperations
                  : operations
                ).map((op) => {
                  console.log("Operation item:", op.operationId);
                  return (
                    <tr key={`${op.operationId}-${op.name}`}>
                      <td className="px-4 py-2 border">{op.name}</td>
                      <td className="px-4 py-2 border">{op.verb}</td>
                      <td className="px-4 py-2 border">{op.resource}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          onClick={() => handleEdit(op)}
                          className="bg-yellow-500 text-white px-4 py-1 rounded-md mr-2"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(op.operationId)}
                          className="bg-red-500 text-white px-4 py-1 rounded-md"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperationsList;
