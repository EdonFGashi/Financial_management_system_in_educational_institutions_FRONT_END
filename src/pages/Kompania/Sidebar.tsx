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
  ClipboardIcon,
  CubeIcon,
  CubeTransparentIcon,
  WalletIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useContext } from "react";
import AuthenticationContext from "../../auth/AuthenticationContext";
import { logout } from "../../auth/handleJWT";
import { urlAccounts } from "../../endpoints";
import axiosInstance from "../../api/axiosInstance";
import { UserInfoDto, ApiResponse } from '../../interfaces/auth.models';

function Sidebar() {
  const location = useLocation();
  const [hoveredPorosite, setHoveredPorosite] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const {update} = useContext(AuthenticationContext);
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
    location.pathname === path ? "font-semibold text-red-700" : "text-gray-700 hover:text-red-600";

  // Handle long email addresses
  const formatEmail = (email: string) => {
    if (!email) return "Admin i Kompanisë";
    
    // If email is shorter than 15 chars, show it fully
    if (email.length <= 15) return email;
    
    // Otherwise, show first part + @ + first part of domain
    const [username, domain] = email.split('@');
    if (!domain) return username.substring(0, 12) + '...';
    
    // Show first 8 chars of username + @ + first 3 chars of domain
    return `${username.substring(0, 8)}...@${domain.substring(0, 3)}...`;
  };

  return (
    <div className="flex h-screen">
      {/* Toggle Button (Visible on small screens) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow-md border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XMarkIcon className="w-6 h-6 text-gray-700" /> : <Bars3Icon className="w-6 h-6 text-gray-700" />}
      </button>

      <aside
        className={`h-screen bg-white border-r border-red-100 shadow-sm px-6 py-8 flex flex-col justify-between transition-all duration-300 w-64 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0`}
      >
        <div>
          {/* User Info */}
          <Link
            to="/kompania/profile"
            className="flex items-center gap-3 mb-10 cursor-pointer hover:bg-red-50 p-3 rounded-lg transition-all duration-200 group"
          >
            <div className="relative">
              <UserCircleIcon className="w-12 h-12 text-red-600" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-0.5">Përdoruesi</p>
              <div className="flex items-center gap-2 relative">
                <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[140px]" title={userEmail || "Admin i Kompanisë"}>
                  {formatEmail(userEmail)}
                </h2>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                
                {/* Tooltip for full email */}
                {userEmail && userEmail.length > 15 && (
                  <div className="absolute -bottom-8 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 w-auto max-w-[200px] break-all">
                      {userEmail}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>

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
              <div className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer hover:bg-red-50 ${isActive("/kompania/porosite/lista")} ${isActive("/kompania/porosite/raporte")}`}>
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
        <div className="pt-6 border-t border-red-100 mt-8">
          <button
            onClick={() => {
              logout(update);
              update([]);
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors duration-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Dilni nga llogaria</span>
          </button>
        </div>
      </aside>

      {/* This empty div serves as a placeholder for the sidebar when it's toggled off on mobile */}
      <div className={`md:hidden ${isOpen ? "w-0" : "w-0"}`}></div>
    </div>
  );
}

export default Sidebar;
