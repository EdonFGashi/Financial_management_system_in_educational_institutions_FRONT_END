import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";
import Sidebar from "../pages/komuna/Sidebar";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

interface Role {
  userId: number;
  claimId: number;
  role: string;
}

interface UserClaims{
    claimId: number;
    userID: string;
    userName: string;
    claimType: string;
    claimValue: string;
}

interface Operation {
  operationId?: number;
  name: string;
  verb: string;
  resource: string;
}

interface RolePermission {
  rolePermissionId: number;
  role: string;
  name: string;
  verb: string;
  resource: string;
  userName: string;
  claimId: number;
  operationId: number;
//     userId: number;
}

type RolePermissionFormValues = {
    rolePermissionId: number;
  claimId: number;
  operationId: number;
};

const RolePermissions = () => {
  const [usersClaims, setUsers] = useState<UserClaims[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [rolePermissionsUpdate, setRolePermissionsUpdate] = useState<RolePermissionFormValues[]>([]);
  const [filteredRolePermissions, setFilteredRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [selectedRolePermission, setSelectedRolePermission] =
    useState<RolePermissionFormValues | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
    loadOperations();
    loadRolePermissions();
  }, [currentPage]);

  async function loadUsers() {
    try {
      const response = await axios.get(
        "http://localhost:5102/api/userClaims/getUserClaims"
      );
      // const response = await axios.post("http://localhost:5102/api/accounts/listUsers", {
      //   page: 1,
      //   recordsPerPage: -1
      // });
      
      setUsers(response.data);
      console.log("Userat: ", response.data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  }

  async function loadOperations() {
    try {
      const response = await axios.get(
        "http://localhost:5102/api/operations/getOperations"
      );
      setOperations(response.data);
    } catch (error) {
      console.error("Failed to load operations:", error);
    }

    // try {
    //   const response = await axios.get(
    //     "http://localhost:5102/api/Endpoints/all"
    //   );
      
    //   setOperations(response.data);
    // } catch (error) {
    //   console.error("Failed to load operations:", error);
    // }
  }

  async function loadRolePermissions() {
    try {
      const response = await axios.get(
        "http://localhost:5102/api/role-permissions/getAll"
      );
      console.log("Krejt: ", response.data);

      setRolePermissions(response.data);
      setFilteredRolePermissions(response.data); // Initially no filter applied
    } catch (error) {
      console.error("Failed to load role permissions:", error);
    }
  }

  const handleFilter = (values: any) => {
    const filtered = rolePermissions.filter((rp) => {
      return (
        (values.role === "" ||
          rp.role.toLowerCase().includes(values.role.toLowerCase())) &&
        (values.operationName === "" ||
          rp.name.toLowerCase().includes(values.operationName.toLowerCase())) &&
        (values.verb === "" || rp.verb === values.verb)
      );
    });
    setFilteredRolePermissions(filtered);
  };

  async function handleSubmit(data: RolePermissionFormValues) {
    try {
      console.log("Submitting data:", data);
      const response = await axios.post(
        "http://localhost:5102/api/role-permissions/create",
        data
      );
      loadRolePermissions();
      Swal.fire("Success", "Role Permission added successfully!", "success");
    } catch (error: any) {
      console.error("Update error:", error);
  
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const rawMessage = error.response.data;
  
        // Handle string or object response
        const message =
          typeof rawMessage === "string"
            ? rawMessage
            : rawMessage?.message || "Invalid input data.";
  
        if (status === 400) {
          Swal.fire("Bad Request", message, "error");
        } else if (status === 404) {
          Swal.fire("Not Found", "The operation does not exist.", "warning");
        } else {
          Swal.fire("Error", "Failed to update operation", "error");
        }
      } else {
        Swal.fire("Unexpected Error", "Something went wrong.", "error");
      }
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(
        `http://localhost:5102/api/role-permissions/${id}`
      );
      loadRolePermissions();
      Swal.fire("Deleted!", "Role Permission has been deleted.", "success");
    } catch (error) {
      console.error("Failed to delete role permission:", error);
      Swal.fire("Error", "Failed to delete the role permission.", "error");
    }
  };

  const handleEdit = (rolePermission: RolePermissionFormValues) => {
    setSelectedRolePermission(rolePermission);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to form if needed
  };

  const handleUpdate = async (data: RolePermissionFormValues) => {
    try {
      const response = await axios.put(
        `http://localhost:5102/api/role-permissions/${data.rolePermissionId}`,
        data
      );
      loadRolePermissions();
console.log("u editua: ", data);
      const updated = response.data;
      setRolePermissionsUpdate((prev) =>
        prev.map((op) =>
          op.operationId === updated.operationId ? updated : op
        )
      );
      setFilteredRolePermissions((prev) =>
        prev.map((op) =>
          op.operationId === updated.operationId ? updated : op
        )
      );
      setSelectedRolePermission(null)
      }catch (error: any) {
    console.error("Update error:", error);

    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const rawMessage = error.response.data;

      // Handle string or object response
      const message =
        typeof rawMessage === "string"
          ? rawMessage
          : rawMessage?.message || "Invalid input data.";

      if (status === 400) {
        Swal.fire("Bad Request", message, "error");
      } else if (status === 404) {
        Swal.fire("Not Found", "The operation does not exist.", "warning");
      } else {
        Swal.fire("Error", "Failed to update operation", "error");
      }
    } else {
      Swal.fire("Unexpected Error", "Something went wrong.", "error");
    }
  }
    };

    async function reloadEndpoints() {
      // try {
      //   const response = await axios.get(
      //     "http://localhost:5102/api/operations/getOperations"
      //   );
      //   setOperations(response.data);
      // } catch (error) {
      //   console.error("Failed to load operations:", error);
      // }
  
      try {
        const response = await axios.post(
          "http://localhost:5102/api/Endpoints/reload"
        );
      
        const { addedCount, removedCount } = response.data;
      
        loadOperations();
      
        Swal.fire(
          "Success",
          `Endpoints u ringarkuan me sukses.\nTë shtuara: ${addedCount}, Të fshira: ${removedCount}`,
          "success"
        );
      } catch (error) {
        console.error("Failed to load operations:", error);
      }
    }
    
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-gray-800">
              <BuildingLibraryIcon className="w-8 h-8 text-indigo-600" />
              Role Permissions Management
            </h2>
            <p className="mt-2 text-gray-600">Manage user roles and operation permissions</p>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Filter Permissions</h3>
            <Formik
              initialValues={{ role: "", operationName: "", verb: "" }}
              onSubmit={handleFilter}
            >
              <Form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <Field
                    name="role"
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by role..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operation Name</label>
                  <Field
                    name="operationName"
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by operation..."
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
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </Field>
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
              {selectedRolePermission ? "Edit Permission" : "Add New Permission"}
            </h3>
            <Formik
              enableReinitialize
              initialValues={{
                rolePermissionId: selectedRolePermission?.rolePermissionId || 0,
                claimId: selectedRolePermission?.claimId || 0,
                operationId: selectedRolePermission?.operationId || 0,
              }}
              onSubmit={(values, { resetForm }) => {
                const formattedValues: RolePermissionFormValues = {
                  rolePermissionId: values.rolePermissionId,
                  claimId: Number(values.claimId),
                  operationId: Number(values.operationId),
                };
                if (selectedRolePermission) {
                  handleUpdate(formattedValues);
                } else {
                  handleSubmit(formattedValues);
                }
                resetForm();
                setSelectedRolePermission(null);
              }}
            >
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                    <Field
                      as="select"
                      name="claimId"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choose a user...</option>
                      {usersClaims.map((user) => (
                        <option key={user.claimId} value={user.claimId}>
                          {`${user.userName} - ${user.claimType} - ${user.claimValue}`}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Operation</label>
                    <Field
                      as="select"
                      name="operationId"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choose an operation...</option>
                      {operations.map((operation) => (
                        <option key={operation.operationId} value={operation.operationId}>
                          {`${operation.name} - ${operation.verb} - ${operation.resource}`}
                        </option>
                      ))}
                    </Field>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                  >
                    {selectedRolePermission ? "Update Permission" : "Add Permission"}
                  </button>
                  {selectedRolePermission && (
                    <button
                      type="button"
                      onClick={() => setSelectedRolePermission(null)}
                      className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={reloadEndpoints}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reload Endpoints
                  </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredRolePermissions.length > 0 ? filteredRolePermissions : rolePermissions).map((rp) => (
                    <tr key={rp.rolePermissionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rp.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rp.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rp.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${rp.verb === 'GET' ? 'bg-blue-100 text-blue-800' : 
                            rp.verb === 'POST' ? 'bg-green-100 text-green-800' :
                            rp.verb === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {rp.verb}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rp.resource}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit({
                            rolePermissionId: rp.rolePermissionId,
                            claimId: rp.claimId,
                            operationId: rp.operationId,
                          })}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rp.rolePermissionId)}
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

export default RolePermissions;
