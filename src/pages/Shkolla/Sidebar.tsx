import { Link, useLocation } from "react-router-dom";
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
import { useState } from "react";

function ShkollaSidebar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [hoveredPorosite, setHoveredPorosite] = useState(false);
    const [hoveredStafi, setHoveredStafi] = useState(false);

    const isActive = (path: string) =>
        location.pathname === path
            ? "font-semibold text-indigo-700"
            : "text-gray-700 hover:text-indigo-600";

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
                            <h2 className="text-lg font-bold text-gray-800">Admin i Shkollës</h2>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
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
                            <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <ShoppingCartIcon className="w-5 h-5" /> Porositë
                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transform transition-transform duration-200 ${
                                        hoveredPorosite ? "rotate-180" : "rotate-0"
                                    }`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    hoveredPorosite ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
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
                                <Link
                                    to="/shkolla/porosite/inventari"
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${isActive("/shkolla/porosite/inventari")}`}
                                >
                                    Inventari Aktual
                                </Link>
                            </div>
                        </div>

                        {/* Stafi Dropdown */}
                        <div
                            onMouseEnter={() => setHoveredStafi(true)}
                            onMouseLeave={() => setHoveredStafi(false)}
                            className="relative"
                        >
                            <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <UsersIcon className="w-5 h-5" /> Stafi
                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transform transition-transform duration-200 ${
                                        hoveredStafi ? "rotate-180" : "rotate-0"
                                    }`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    hoveredStafi ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
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

export default ShkollaSidebar;
