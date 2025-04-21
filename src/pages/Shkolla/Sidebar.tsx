import { useState } from "react";
import { Link } from "react-router-dom";
import {
    HomeIcon,
    ShoppingCartIcon,
    UsersIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

function ShkollaSidebar() {
    const [openPorosite, setOpenPorosite] = useState(false);
    const [openStafi, setOpenStafi] = useState(false);

    return (
        <aside className="w-full md:w-64 bg-white shadow-md border-r border-gray-200">
            <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-indigo-700">Shkolla</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2 text-sm">
                    <Link to="/shkolla/dashboard" className="block p-2 rounded hover:bg-gray-100 text-gray-800 font-medium">
                        <div className="flex items-center gap-2">
                            <HomeIcon className="w-5 h-5" />
                            Dashboard
                        </div>
                    </Link>

                    {/* Porosite with dropdown */}
                    <div>
                        <button
                            onClick={() => setOpenPorosite(!openPorosite)}
                            className="w-full flex justify-between items-center p-2 rounded hover:bg-gray-100 text-gray-800 font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCartIcon className="w-5 h-5" />
                                Porositë
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${openPorosite ? "rotate-180" : ""}`} />
                        </button>
                        {openPorosite && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link to="/shkolla/porosite/market" className="block p-1 rounded hover:bg-gray-100">Market</Link>
                                <Link to="/shkolla/porosite/shporta" className="block p-1 rounded hover:bg-gray-100">Shporta</Link>
                                <Link to="/shkolla/porosite/historiku" className="block p-1 rounded hover:bg-gray-100">Historiku i porosive</Link>
                            </div>
                        )}
                    </div>

                    {/* Stafi with dropdown */}
                    <div>
                        <button
                            onClick={() => setOpenStafi(!openStafi)}
                            className="w-full flex justify-between items-center p-2 rounded hover:bg-gray-100 text-gray-800 font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <UsersIcon className="w-5 h-5" />
                                Stafi
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${openStafi ? "rotate-180" : ""}`} />
                        </button>
                        {openStafi && (
                            <div className="ml-6 mt-1 space-y-1">
                                <Link to="/shkolla/stafi/ndalesat" className="block p-1 rounded hover:bg-gray-100">Ndalesat</Link>
                                <Link to="/shkolla/stafi/oret-shtese" className="block p-1 rounded hover:bg-gray-100">Orët shtesë</Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
}

export default ShkollaSidebar;
