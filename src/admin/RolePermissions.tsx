import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";
import Sidebar from "../pages/komuna/Sidebar";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import axios from "axios";

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
  operationId: number;
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
  email: string;
//   claimId: number;
//   operationId: number;
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
  }

  async function loadRolePermissions() {
    try {
      const response = await axios.get(
        "http://localhost:5102/api/role-permissions/getAll"
      );
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
      console.error("Failed to add role permission:", error);
      throw error;
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-8">
            <BuildingLibraryIcon className="w-7 h-7 text-indigo-600" />
            Role Permissions List
          </h2>

          {/* Filter Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
            <Formik
              initialValues={{ role: "", operationName: "", verb: "" }}
              onSubmit={handleFilter}
            >
              <Form className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Field
                    name="role"
                    type="text"
                    className="p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Operation Name
                  </label>
                  <Field
                    name="operationName"
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
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </Field>
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

          {/* Add New RolePermission Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
          <Formik
  enableReinitialize
  initialValues={{
    rolePermissionId: selectedRolePermission
      ? selectedRolePermission.rolePermissionId
      : 0,
    claimId: selectedRolePermission
      ? selectedRolePermission.claimId
      : 0,
    operationId: selectedRolePermission
      ? selectedRolePermission.operationId
      : 0,
  }}
  onSubmit={(values, { resetForm }) => {
    const formattedValues: RolePermissionFormValues = {
      rolePermissionId: values.rolePermissionId,
      claimId: values.claimId ? Number(values.claimId) : 0,
      operationId: values.operationId ? Number(values.operationId) : 0,
    };
    handleSubmit(formattedValues);
    resetForm();
    setSelectedRolePermission(null);
  }}
>


              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">User</label>
                  <Field
                    as="select"
                    name="claimId"
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select User</option>
                    {usersClaims.map((user) => (
                      <option key={user.claimId} value={user.claimId}>
                        {user.userName + " - " + user.claimType + " - " + user.claimValue}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium">Operation</label>
                  <Field
                    as="select"
                    name="operationId"
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Operation</option>
                    {operations.map((operation) => (
                      <option
                        key={operation.operationId}
                        value={operation.operationId}
                      >
                        {operation.name}
                      </option>
                    ))}
                  </Field>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {selectedRolePermission
                      ? "Update RolePermission"
                      : "Add RolePermission"}
                  </button>
                  {selectedRolePermission && (
                    <button
                      type="button"
                      onClick={() => setSelectedRolePermission(null)}
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
                <tr>
                  <th className="px-4 py-2 border">User</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Operation Name</th>
                  <th className="px-4 py-2 border">Verb</th>
                  <th className="px-4 py-2 border">Resource</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredRolePermissions.length > 0
                  ? filteredRolePermissions
                  : rolePermissions
                ).map((rp) => (
                  <tr key={rp.rolePermissionId}>
                    <td className="px-4 py-2 border">{rp.email}</td>
                    <td className="px-4 py-2 border">{rp.role}</td>
                    <td className="px-4 py-2 border">{rp.name}</td>
                    <td className="px-4 py-2 border">{rp.verb}</td>
                    <td className="px-4 py-2 border">{rp.resource}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        // onClick={() => handleEdit(rp)}
                        className="bg-yellow-500 text-white px-4 py-1 rounded-md mr-2"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(rp.rolePermissionId)}
                        className="bg-red-500 text-white px-4 py-1 rounded-md"
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
      </main>
    </div>
  );
};

export default RolePermissions;
