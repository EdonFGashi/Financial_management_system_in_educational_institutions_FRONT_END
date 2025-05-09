import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../pages/Kompania/Sidebar";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/Pagination"; // Assure-toi d'importer correctement
import axios from "axios";
import Swal from "sweetalert2";

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
    const response = await axios.post("http://localhost:5102/api/accounts/listUsers", {
        page: 1,
        recordsPerPage: 10
      });
      console.log(response.data);
          setUsers(response.data);
    const total = parseInt(response.headers["totalamountofpages"]);
    setTotalPages(total);
    const initialRoles: { [key: string]: string } = {};
    response.data.forEach((user: any) => {
      initialRoles[user.email] = user.role; // suppose que tu reçois aussi "role"
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" />
            Lista e Përdoruesve
          </h2>
          <Link
            to="/komuna/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700 transition text-sm"
          >
            ← Kthehu te Dashboard
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 border-b">Email</th>
                <th className="px-4 py-3 border-b">Roli</th>
                <th className="px-4 py-3 border-b">Veprim</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={rolesMap[user.email]}
                      onChange={(e) => handleRoleChange(user.email, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateRole(user.email)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Update role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalAmountOfPages={totalPages}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
    </div>
  );
}
