import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../pages/Kompania/Sidebar";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination"; // Assure-toi d'importer correctement
import axios from "axios";
import Swal from "sweetalert2";
import AdminSidebar from "./AdminSidebar";
import { urlAccounts } from "../endpoints";

const roles = ["admin", "komun", "shkoll", "kompani"];

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rolesMap, setRolesMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  async function loadUsers() {
    const response = await axios.post(`${urlAccounts}/listUsers`, {
        page: 1,
        recordsPerPage: 10
      });
      console.log(response.data.data);
          setUsers(response.data.data);
    const total = parseInt(response.headers["totalamountofpages"]);
    setTotalPages(total);
    const initialRoles: { [key: string]: string } = {};
    response.data.data.forEach((user: any) => {
      initialRoles[user.email] = user.role;
    });
    
    setRolesMap(initialRoles);
  }

  function handleRoleChange(email: string, role: string) {
    setRolesMap({ ...rolesMap, [email]: role });
  }

  async function updateRole(email: string) {
    try{
    const newRole = rolesMap[email];
    await axios.put(`http://localhost:5102/api/accounts/updateRole`, { email, role: newRole });

    Swal.fire(
      'Sukses!',
      `Roli për ${email} u ndryshua në ${newRole} !`,
      'success'
    );
    // alert(`Role for ${email} updated to ${newRole}`);
  } catch (error: any) {
    if (error.response && error.response.status === 403) {
      Swal.fire({
        title: 'I pa autorizuar!',
        text: `Ju nuk jeni të autorizuar për ta bërë këtë veprim !`,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Ndodhi një error !',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
    
  }
    
  }
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-gray-800">
                  <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-600" />
                  User Management
                </h2>
                <p className="mt-2 text-gray-600">Manage user accounts and roles</p>
              </div>
              <Link
                to="/komuna/dashboard"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.email} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={rolesMap[user.email]}
                          onChange={(e) => handleRoleChange(user.email, e.target.value)}
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          {roles.map((role) => (
                            <option key={role} value={role} className="capitalize">
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => updateRole(user.email)}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          Update Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalAmountOfPages={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
