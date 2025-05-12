// AdminSidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useState, useContext } from "react";
import AuthenticationContext from "../auth/AuthenticationContext";
import { logout } from "../auth/handleJWT";

function AdminSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { update } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path
      ? "font-semibold text-indigo-700"
      : "text-gray-700 hover:text-indigo-600";

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow-md border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen bg-white border-r shadow-sm px-6 py-8 flex flex-col justify-between transition-transform duration-300 w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* User Info */}
          <div className="flex items-center gap-3 mb-10">
            <UserCircleIcon className="w-10 h-10 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Përdoruesi</p>
              <h2 className="text-lg font-bold text-gray-800">
                Admin i Komunës
              </h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              to="/perdoruesit"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                "/perdoruesit"
              )}`}
            >
              <UsersIcon className="w-5 h-5" />
              <span className="text-sm">Përdoruesit</span>
            </Link>

            <Link
              to="/operations"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                "/operations"
              )}`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span className="text-sm">Veprimet</span>
            </Link>

            <Link
              to="/rolePermissions"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                "/rolePermissions"
              )}`}
            >
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-sm">Privilegjet e përdoruesve</span>
            </Link>
          </nav>
        </div>

        {/* Sign Out */}
        <div className="pt-6 border-t mt-8">
          <button
            onClick={() => {
              logout(update);
              update([]);
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Dilni nga llogaria</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
