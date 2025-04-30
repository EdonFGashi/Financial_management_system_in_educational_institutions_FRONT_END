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
  ClipboardIcon,
  CubeIcon,
  CubeTransparentIcon,
  WalletIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

function Sidebar() {
  const location = useLocation();
  const [hoveredPorosite, setHoveredPorosite] = useState(false);
  // const [HoveredProdukte, setHoveredProdukte] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path: string) =>
    location.pathname === path ? "font-semibold text-indigo-700" : "text-gray-700 hover:text-indigo-600";

  return (
    <>
      {/* Toggle Button (Visible on small screens) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow-md border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XMarkIcon className="w-6 h-6 text-gray-700" /> : <Bars3Icon className="w-6 h-6 text-gray-700" />}
      </button>

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen bg-white border-r shadow-sm px-6 py-8 flex flex-col justify-between transition-transform duration-300 w-65 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* User Info */}
          <div className="flex items-center gap-3 mb-10">
            <UserCircleIcon className="w-10 h-10 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Përdoruesi</p>
              <h2 className="text-lg font-bold text-gray-800">Admin i Kompanisë</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              to="/kompania/dashboard"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive("/kompania/dashboard")}`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-sm">Dashboard</span>
            </Link>

            <div
              onMouseEnter={() => setHoveredPorosite(true)}
              onMouseLeave={() => setHoveredPorosite(false)}
              className="relative"
            >
              <div className={`flex items-center justify-between px-4 py-2 rounded-lg  cursor-pointer ${isActive("/kompania/porosite/lista")} ${isActive("/kompania/porosite/raporte")}`}>
                <span className="flex items-center gap-3 text-sm ">
                  <WalletIcon className="w-5 h-5" /> Porositë
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-200 ${hoveredPorosite ? "rotate-180" : "rotate-0"}`}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${hoveredPorosite ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} ml-4 mt-1 space-y-1`}
              >
                <Link
                  to="/kompania/porosite/lista"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/kompania/porosite/lista")}`}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" /> Lista e Porosive
                </Link>
                <Link
                  to="/kompania/porosite/raporte"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/kompania/porosite/raporte")}`}
                >
                  <DocumentIcon className="w-4 h-4" /> Raportet e Porosive
                </Link>
              </div>
            </div>
            <Link
              to="/kompania/regjistri"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive("/kompania/regjistri")}`}
            >
              <CubeIcon className="w-5 h-5" />
              <span className="text-sm">Menaxho Produktet</span>
            </Link>
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
