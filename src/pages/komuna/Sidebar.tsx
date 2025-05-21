import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ClockIcon,
  BuildingOffice2Icon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Authorized from "../../auth/Authorized";
import Button from "../../components/Button";
import { logout } from "../../auth/handleJWT";
import AuthenticationContext from "../../auth/AuthenticationContext";
import { useContext } from "react";
import { urlAccounts } from "../../endpoints";
import axiosInstance from "../../api/axiosInstance";
import { UserInfoDto, ApiResponse } from '../../interfaces/auth.models';

function Sidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [schoolsHovered, setSchoolsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [financatHovered, setFinancatHovered] = useState(false);
  const [kontraktoretHovered, setKontraktoretHovered] = useState(false);
  const [ndalesatHovered, setNdalesatHovered] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {update, claims} = useContext(AuthenticationContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<UserInfoDto>>(`${urlAccounts}/me`);
        if (response.data.succeeded) {
          setUserEmail(response.data.data.email);
        } else {
          console.error('Failed to fetch user info:', response.data.message);
        }
      } catch (error: any) {
        console.error('Failed to fetch user info:', error.response?.data?.message || error);
      }
    };

    fetchUserInfo();
  }, []);

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
        className={`fixed md:sticky top-0 left-0 h-screen overflow-y-auto overflow-x-hidden bg-white border-r shadow-sm px-6 py-8 flex flex-col justify-between transition-transform duration-300 w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* User Info */}
          <div className="flex-shrink-0">
            <Link
              to="/komuna/profile"
              className="flex items-center gap-3 mb-10 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
            >
              <div className="relative">
                <UserCircleIcon className="w-12 h-12 text-indigo-500" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Përdoruesi</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
                    {userEmail}
                  </h2>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation with Scroll */}
          <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden">
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
                  hovered ? "max-h-52 opacity-100" : "max-h-0 opacity-0"
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
                <Link
                  to="/komuna/faturat/listafaturave"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/faturat/listafaturave"
                  )}`}
                >
                  <BanknotesIcon className="w-4 h-4" /> Lista e Faturave
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
                  to="/komuna/shkolla/listashkollave"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/shkolla/listashkollave"
                  )}`}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" /> Lista e Shkollave
                </Link>
                <Link
                  to="/komuna/shto-shkolle"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/shto-shkolle"
                  )}`}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" /> Shto Shkollë
                </Link>
              </div>
            </div>

            <div
              onMouseEnter={() => setFinancatHovered(true)}
              onMouseLeave={() => setFinancatHovered(false)}
              className="relative"
            >
              <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <BanknotesIcon className="w-5 h-5" /> Financat
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    financatHovered ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>              <div
                className={`overflow-hidden transition-all duration-300 ${
                  financatHovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                } ml-4 mt-1 space-y-1`}
              >
                <Link
                  to="/komuna/buxheti"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/buxheti"
                  )}`}
                >
                  <AdjustmentsVerticalIcon className="w-4 h-4" /> Ndarja e Buxhetit
                </Link>
                <Link
                  to="/komuna/buxheti/historiku"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/buxheti/historiku"
                  )}`}
                >
                  <ClockIcon className="w-4 h-4" /> Historiku
                </Link>
              </div>
            </div>

            
            <div
              onMouseEnter={() => setKontraktoretHovered(true)}
              onMouseLeave={() => setKontraktoretHovered(false)}
              className="relative"
            >
              <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <BriefcaseIcon className="w-5 h-5" /> Kontraktorët
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    kontraktoretHovered ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  kontraktoretHovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                } ml-4 mt-1 space-y-1`}
              >
                <Link
                  to="/komuna/kompanite"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/kompanite"
                  )}`}
                >
                  <BuildingOffice2Icon className="w-4 h-4" /> Lista e Kontraktorëve
                </Link>
                <Link
                  to="/komuna/kontraktoret/marreveshjet"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/kontraktoret/marreveshjet"
                  )}`}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" /> Marrëveshjet
                </Link>
              </div>
            </div>            
            {/* Ndalesat e Punetoreve dropdown with Orët Shtesë included */}
            <div
              onMouseEnter={() => setNdalesatHovered(true)}
              onMouseLeave={() => setNdalesatHovered(false)}
              className="relative"
            >
              <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <MinusCircleIcon className="w-5 h-5" /> Ndalesat e Punonjësve
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform duration-200 ${
                    ndalesatHovered ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  ndalesatHovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                } ml-4 mt-1 space-y-1`}
              >
                <Link
                  to="/komuna/financat"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/financat"
                  )}`}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" /> Ndalesat e Punëtorëve
                </Link>
                <Link
                  to="/komuna/financat/oretshtese"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive(
                    "/komuna/financat/oretshtese"
                  )}`}
                >
                  <ClockIcon className="w-4 h-4" /> Orët Shtesë
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Sign Out - Always visible at bottom */}
        <div className="flex-shrink-0 pt-6 border-t mt-8">
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

export default Sidebar;
