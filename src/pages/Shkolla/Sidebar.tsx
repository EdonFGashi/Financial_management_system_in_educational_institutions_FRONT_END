import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    HomeIcon,
    ShoppingCartIcon,
    UsersIcon,
    ChevronDownIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useContext } from "react";
import { logout } from "../../auth/handleJWT";
import AuthenticationContext from "../../auth/AuthenticationContext";
import { urlAccounts } from "../../endpoints";
import axiosInstance from "../../api/axiosInstance";
import { urlListShkolla } from "../../endpoints";
import { UserInfoDto, ApiResponse } from '../../interfaces/auth.models';

function ShkollaSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [hoveredPorosite, setHoveredPorosite] = useState(false);
    const [hoveredStafi, setHoveredStafi] = useState(false);
    const [hoveredInventari, setHoveredInventari] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const {update} = useContext(AuthenticationContext);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<UserInfoDto>>(`${urlAccounts}/me`);
                if (response.data.succeeded) {
                    setUserEmail(response.data.data.email);
                }
            } catch (error: any) {
                console.error('Failed to fetch user info:', error.response?.data?.message || error);
            }
        };

        fetchUserInfo();
    }, []);

    const isActive = (path: string) =>
        location.pathname === path
            ? "font-semibold text-green-700"
            : "text-gray-700 hover:text-green-600";

    return (
        <>
            {/* Toggle Button for mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow-md border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <XMarkIcon className="w-6 h-6 text-gray-700" /> : <Bars3Icon className="w-6 h-6 text-gray-700" />}
            </button>

            <aside
                className={`fixed md:sticky top-0 left-0 h-screen overflow-y-auto overflow-x-hidden bg-white border-r shadow-sm px-6 py-8 flex flex-col justify-between transition-transform duration-300 w-64 ${
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Remove the previous Home Link */}

                    {/* User Info */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/shkolla/profile"
                            className="flex items-center gap-3 mb-10 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
                        >
                            <div className="relative">
                                <UserCircleIcon className="w-12 h-12 text-green-500" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
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
                            to="/shkolla/dashboard"
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${isActive("/shkolla/dashboard")}`}
                        >
                            <HomeIcon className="w-5 h-5" />
                            <span className="text-sm">Dashboard</span>
                        </Link>

                        {/* Porosite Dropdown */}
                        <div
                            onMouseEnter={() => setHoveredPorosite(true)}
                            onMouseLeave={() => setHoveredPorosite(false)}
                            className="relative"
                        >
                            <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-green-50 cursor-pointer">
                                <span className="flex items-center gap-3 text-sm text-gray-700">
                                    <ShoppingCartIcon className="w-5 h-5" /> Porositë
                                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transform transition-transform duration-200 ${hoveredPorosite ? "rotate-180" : "rotate-0"
                                        }`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${hoveredPorosite ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                    } ml-4 mt-1 space-y-1`}
                            >
                                <Link
                                    to="/shkolla/porosite/market"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/porosite/market")}`}
                                >
                                    Market
                                </Link>
                                <Link
                                    to="/shkolla/porosite/shporta"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/porosite/shporta")}`}
                                >
                                    Shporta
                                </Link>
                                <Link
                                    to="/shkolla/porosite/historiku"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/porosite/historiku")}`}
                                >
                                    Historiku i porosive
                                </Link>
                            </div>
                        </div>

                        {/* Stafi Dropdown */}
                        <div
                            onMouseEnter={() => setHoveredStafi(true)}
                            onMouseLeave={() => setHoveredStafi(false)}
                            className="relative"
                        >
                            <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-green-50 cursor-pointer">
                                <span className="flex items-center gap-3 text-sm text-gray-700">
                                    <UsersIcon className="w-5 h-5" /> Stafi
                                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transform transition-transform duration-200 ${hoveredStafi ? "rotate-180" : "rotate-0"
                                        }`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${hoveredStafi ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                    } ml-4 mt-1 space-y-1`}
                            >
                                <Link
                                    to="/shkolla/stafi/menaxhimi"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/stafi/menaxhimi")}`}
                                >
                                    Menaxhimi i Stafit
                                </Link>
                                <Link
                                    to="/shkolla/stafi/ndalesat"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/stafi/ndalesat")}`}
                                >
                                    Ndalesat
                                </Link>
                                <Link
                                    to="/shkolla/stafi/oret-shtese"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/stafi/oret-shtese")}`}
                                >
                                    Orët shtesë
                                </Link>
                            </div>
                        </div>

                        {/* Inventari Dropdown */}
                        <div
                            onMouseEnter={() => setHoveredInventari(true)}
                            onMouseLeave={() => setHoveredInventari(false)}
                            className="relative"
                        >
                            <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-green-50 cursor-pointer">
                                <span className="flex items-center gap-3 text-sm text-gray-700">
                                    <ArchiveBoxIcon className="w-5 h-5" /> Inventari
                                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transform transition-transform duration-200 ${hoveredInventari ? "rotate-180" : "rotate-0"
                                        }`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${hoveredInventari ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                    } ml-4 mt-1 space-y-1`}
                            >
                                <Link
                                    to="/shkolla/inventari"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/inventari/aktual")}`}
                                >
                                    Inventari Aktual
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Sign Out with Home link added */}
                <div className="flex-shrink-0 pt-6 border-t mt-8 space-y-2">
                    {/* Small transparent home link */}
                    <Link
                        to="/"
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>Kthehu në Faqen Kryesore</span>
                    </Link>

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

export default ShkollaSidebar;
