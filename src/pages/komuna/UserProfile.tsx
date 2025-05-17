import { useContext, useState, useEffect } from 'react';
import AuthenticationContext from '../../auth/AuthenticationContext';
import Sidebar from './Sidebar';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { urlAccounts } from '../../endpoints';
import axiosInstance from '../../api/axiosInstance';
import { UserInfoDto, ChangePasswordDto, ApiResponse } from '../../interfaces/auth.models';
import Toast from '../../components/Toast';
import Swal from 'sweetalert2';

export default function UserProfile() {
    const { claims } = useContext(AuthenticationContext);
    const [loading, setLoading] = useState(false);

    const [userInfo, setUserInfo] = useState<UserInfoDto>({
        email: '',
        fullName: '',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Add error states
    const [error, setError] = useState('');
    const [toastInfo, setToastInfo] = useState<{message: string; type: "success" | "error"} | null>(null);

    // Show toast function
    const showToast = (message: string, type: "success" | "error") => {
        setToastInfo({ message, type });
    };

    // Fetch user info on component mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<UserInfoDto>>(`${urlAccounts}/me`);
                if (response.data.succeeded) {
                    setUserInfo({
                        email: response.data.data.email,
                        fullName: response.data.data.fullName || ''
                    });
                }
            } catch (error: any) {
                console.error('Failed to fetch user info:', error);
                showToast(error.response?.data?.message || 'Gabim gjatë marrjes së të dhënave', 'error');
            }
        };

        fetchUserInfo();
    }, []);

    const handleUserInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const result = await Swal.fire({
            title: 'Konfirmoni ndryshimet',
            text: 'A jeni të sigurt që dëshironi të përditësoni të dhënat personale?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Po, përditëso',
            cancelButtonText: 'Anulo',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post<ApiResponse<string>>(
                `${urlAccounts}/update-profile`,
                userInfo
            );

            if (response.data.succeeded) {
                showToast('Të dhënat u përditësuan me sukses', 'success');
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Failed to update user info:', error);
            showToast(error.response?.data?.message || 'Gabim gjatë përditësimit të të dhënave', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            Swal.fire({
                title: 'Gabim',
                text: 'Fjalëkalimet e reja nuk përputhen!',
                icon: 'error',
                confirmButtonText: 'Në rregull'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Konfirmoni ndryshimin e fjalëkalimit',
            text: 'A jeni të sigurt që dëshironi të ndryshoni fjalëkalimin?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Po, ndrysho',
            cancelButtonText: 'Anulo',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        setError('');

        try {
            const passwordData: ChangePasswordDto = {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmNewPassword: passwords.confirmPassword
            };

            const response = await axiosInstance.post<ApiResponse<string>>(
                `${urlAccounts}/change-password`,
                passwordData
            );

            if (response.data.succeeded) {
                showToast('Fjalëkalimi u ndryshua me sukses', 'success');
                setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Gabim gjatë ndryshimit të fjalëkalimit', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 p-8 relative">
                {/* Enhanced Decorative Elements with more blue tones */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200 rounded-full opacity-25 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-blue-50/70 to-transparent opacity-80"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    {/* Updated Header with blueish gradient */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <UserCircleIcon className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-blue-900 mb-1">Profili i Përdoruesit</h1>
                                <p className="text-blue-600">{userInfo.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Personal Information Form with blueish accents */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-100 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                                <UserCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Informacionet Personale
                            </h2>
                        </div>
                        <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Emaili
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={userInfo.email || ''}
                                            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                                            className="block w-full rounded-lg border border-blue-200 px-4 py-3 bg-blue-50/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Emri i plotë
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.fullName || ''}
                                        onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                                        className="block w-full rounded-lg border border-blue-200 px-4 py-3 bg-blue-50/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ruaj ndryshimet
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Enhanced Password Form with blueish accents */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-100 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                                <KeyIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Ndrysho Fjalëkalimin
                            </h2>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Fjalëkalimi aktual
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                        className="block w-full rounded-lg border border-blue-200 px-4 py-3 bg-blue-50/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Fjalëkalimi i ri
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                        className="block w-full rounded-lg border border-blue-200 px-4 py-3 bg-blue-50/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">
                                        Konfirmo fjalëkalimin e ri
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                        className="block w-full rounded-lg border border-blue-200 px-4 py-3 bg-blue-50/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ndrysho fjalëkalimin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Add floating decoration with blue gradient */}
                <div className="fixed bottom-4 right-4 p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg animate-bounce opacity-50">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                </div>

                {/* Toast Notification */}
                {toastInfo && (
                    <div className="fixed top-4 right-4 z-50">
                        <Toast
                            message={toastInfo.message}
                            type={toastInfo.type}
                            onClose={() => setToastInfo(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
