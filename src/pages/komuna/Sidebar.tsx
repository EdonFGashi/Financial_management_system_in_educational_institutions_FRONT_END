import { Link, useLocation } from "react-router-dom";
import {
  FolderOpenIcon,
  AdjustmentsVerticalIcon,
  BriefcaseIcon,
  BanknotesIcon,
  UserCircleIcon,
  ChevronDownIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Authorized from "../../auth/Authorized";

function Sidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [schoolsHovered, setSchoolsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path: string) =>
    location.pathname === path
      ? "font-semibold text-indigo-700"
      : "text-gray-700 hover:text-indigo-600";

  return (
    <>
      {/* Toggle Button (Visible on small screens) */}
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
              to="/komuna/dashboard"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                "/komuna/dashboard"
              )}`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-sm">Dashboard</span>
            </Link>

            {/* Orders dropdown */}
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="relative"
            >
              <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <FolderOpenIcon className="w-5 h-5" /> Porositë
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    hovered ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  hovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                } ml-4 mt-1 space-y-1`}
              >
                <Link
                  to="/komuna/porosite/lista"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/porosite/lista"
                  )}`}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" /> Lista e Porosive
                </Link>
                <Link
                  to="/komuna/porosite/raporte"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/porosite/raporte"
                  )}`}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" /> Raportet e
                  Porosive
                </Link>
              </div>
            </div>

            {/* Schools Section */}
            <div
              onMouseEnter={() => setSchoolsHovered(true)}
              onMouseLeave={() => setSchoolsHovered(false)}
              className="relative"
            >
              <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <BuildingLibraryIcon className="w-5 h-5" /> Shkollat
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    schoolsHovered ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  schoolsHovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                } ml-4 mt-1 space-y-1`}
              >
                <Link
                  to="/komuna/shkollat/listashkollave"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/shkollat/listashkollave"
                  )}`}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" /> Lista e Shkollave
                </Link>
                <Link
                  to="/komuna/shkollat/shto"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/shkollat/shto"
                  )}`}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" /> Shto Shkollë
                </Link>
              </div>
            </div>

            <Link
              to="/komuna/buxheti"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                "/komuna/buxheti"
              )}`}
            >
              <AdjustmentsVerticalIcon className="w-5 h-5" />
              <span className="text-sm">Ndarja e Buxhetit</span>
            </Link>

            <Authorized
              role="admin"
              authorized={
                <>
                  <Link
                    to="/komuna/kontraktoret"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                      "/komuna/kontraktoret"
                    )}`}
                  >
                    <BriefcaseIcon className="w-5 h-5" />
                    <span className="text-sm">Kontraktorët</span>
                  </Link>

                  <Link
                    to="/komuna/financat"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive(
                      "/komuna/financat"
                    )}`}
                  >
                    <BanknotesIcon className="w-5 h-5" />
                    <span className="text-sm">Financat</span>
                  </Link>
                </>
              }
            />
          </nav>
        </div>

        {/* Sign Out */}
        <div className="pt-6 border-t mt-8">
          <Link
            to="/signin"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-red-500 transition"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Dilni nga llogaria
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
