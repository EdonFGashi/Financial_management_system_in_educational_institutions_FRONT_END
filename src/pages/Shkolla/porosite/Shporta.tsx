import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import { TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

function Shporta() {
    // Artikuj statikë në shportë
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: "Banka shkollore",
            price: 25,
            quantity: 2,
            image: "https://via.placeholder.com/150?text=Banka"
        },
        {
            id: 2,
            name: "Shkumës whiteboard",
            price: 3.5,
            quantity: 5,
            image: "https://via.placeholder.com/150?text=Shkumes"
        },
        {
            id: 3,
            name: "Laptop edukativ",
            price: 450,
            quantity: 1,
            image: "https://via.placeholder.com/150?text=Laptop"
        }
    ]);

    const [availableBudget] = useState(75000);

    // Ruaj shportën në localStorage
    useEffect(() => {
        localStorage.setItem('shkollaCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Funksione për menaxhimin e shportës
    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const remainingBudget = availableBudget - calculateTotal();

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            {/* Sidebar Statik - i njëjtë si në Market */}
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            {/* Përmbajtja kryesore me margin për sidebar */}
            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shporta e Porosive</h1>
                            <p className="text-base sm:text-lg text-green-100">
                                Shikoni dhe menaxhoni produktet në shportën tuaj
                            </p>
                        </div>
                        <Link
                            to="/shkolla/porosite/market"
                            className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>Kthehu në Market</span>
                        </Link>
                    </div>
                </div>

                {/* Përmbajtja */}
                <div className="px-4 sm:px-6 md:px-12 py-8">
                    {/* Buxheti dhe Totali */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Buxheti në Dispozicion</h3>
                            <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                €{remainingBudget.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Totali i Shportës</h3>
                            <p className="text-2xl font-bold text-gray-800">
                                €{calculateTotal().toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {cartItems.reduce((total, item) => total + item.quantity, 0)} artikuj
                            </p>
                        </div>
                    </div>

                    {/* Lista e produkteve */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        {cartItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Shporta juaj është e zbrazët
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded-lg" />

                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                                                <p className="text-green-600 font-semibold">€{item.price.toFixed(2)}</p>
                                                <p className="text-sm text-gray-500">Total: €{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Butoni i porosisë */}
                    {cartItems.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => alert(`Porosia u krye me sukses! Totali: €${calculateTotal().toFixed(2)}`)}
                                disabled={remainingBudget < 0}
                                className={`px-6 py-3 rounded-lg font-medium ${
                                    remainingBudget < 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {remainingBudget < 0 ? 'Buxheti nuk mjafton' : 'Krye Porosinë'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Shporta;