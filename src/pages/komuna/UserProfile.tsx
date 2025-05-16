import { useContext, useState } from 'react';
import AuthenticationContext from '../../auth/AuthenticationContext';
import Sidebar from './Sidebar';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function UserProfile() {
    const { claims } = useContext(AuthenticationContext);
    const email = claims.find(claim => claim.name === "email")?.value;
    const [loading, setLoading] = useState(false);

    const [userInfo, setUserInfo] = useState({
        email: email || '',
        fullName: claims.find(claim => claim.name === "fullName")?.value || '',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleUserInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Add your API call here to update user info
        setLoading(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Fjalëkalimet e reja nuk përputhen!");
            return;
        }
        setLoading(true);
        // Add your API call here to update password
        setLoading(false);
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-8 relative">
                {/* Enhanced Decorative Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-10 right-10 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-200 rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-100 rounded-full opacity-20 blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-white/50 to-transparent opacity-80"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    {/* Enhanced Header */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-6">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                <UserCircleIcon className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">Profili i Përdoruesit</h1>
                                <p className="text-gray-500">{email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Personal Information Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                                <UserCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Informacionet Personale
                            </h2>
                        </div>
                        <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emaili
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={userInfo.email}
                                            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emri i plotë
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.fullName}
                                        onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ruaj ndryshimet
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Enhanced Password Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                                <KeyIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Ndrysho Fjalëkalimin
                            </h2>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fjalëkalimi aktual
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fjalëkalimi i ri
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Konfirmo fjalëkalimin e ri
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ndrysho fjalëkalimin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Add floating decoration */}
                <div className="fixed bottom-4 right-4 p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full shadow-lg animate-bounce opacity-50">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
