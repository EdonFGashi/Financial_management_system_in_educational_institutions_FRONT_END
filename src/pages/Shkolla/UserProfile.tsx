import { useContext, useState, useEffect } from 'react';
import AuthenticationContext from '../../auth/AuthenticationContext';
import ShkollaSidebar from './Sidebar';
import { UserCircleIcon, KeyIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { urlAccounts } from '../../endpoints';
import axiosInstance from '../../api/axiosInstance';
import { UserInfoDto, ChangePasswordDto, ApiResponse } from '../../interfaces/auth.models';
import { urlListAdresa } from '../../endpoints';
import { urlListShkolla } from '../../endpoints';
import Toast from '../../components/Toast';
import Swal from 'sweetalert2';

// Interface for address data
interface AdresaDto {
    id: number;
    rruga: string;
    qyteti: string;
    shteti: string;
    kodiPostal: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for school data
interface ShkollaDto {
    id: number;
    emriShkolles: string;
    drejtori: string;
    nrNxenesve: number;
    AdresaId: number;
    buxhetiAktual: number;
    buxhetiShfrytezuar: number;
    autoNdarja: boolean;
    UserId: string;
    createdAt: Date;
    updatedAt: Date;
    Person?: {
        Emri: string;
        Mbiemri: string;
        NumriPersonal: string;
        DataLindjes: Date;
        Gjinia: string;
        AdresaId: number;
        Adresa?: AdresaDto;
    };
    User?: {
        Id: string;
        UserName: string;
        Email: string;
        KomunaId: number;
    };
}

export default function UserProfile() {
    const { claims } = useContext(AuthenticationContext);
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfoDto>({
        email: '',
        fullName: '',
    });
    const [addressInfo, setAddressInfo] = useState<{
        id: number | null;
        rruga: string;
        qyteti: string;
        shteti: string;
        kodiPostal: string;
    }>({
        id: null,
        rruga: '',
        qyteti: '',
        shteti: '',
        kodiPostal: ''
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [toastInfo, setToastInfo] = useState<{message: string; type: "success" | "error"} | null>(null);

    // Show toast function
    const showToast = (message: string, type: "success" | "error") => {
        setToastInfo({ message, type });
    };

    // Fetch user info and address info on component mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<UserInfoDto>>(`${urlAccounts}/me`);
                if (response.data.succeeded) {
                    setUserInfo({
                        email: response.data.data.email,
                        fullName: response.data.data.fullName
                    });
                }
            } catch (error: any) {
                console.error('Failed to fetch user info:', error);
                showToast(error.response?.data?.message || 'Gabim gjatë marrjes së të dhënave', 'error');
            }
        };

        fetchUserInfo();
        fetchSchoolAndAddressInfo();
    }, []);

    // Fetch school and address information - revised to match by email
    const fetchSchoolAndAddressInfo = async () => {
        try {
            // First get the current user's info to get the email
            const userResponse = await axiosInstance.get<ApiResponse<any>>(`${urlAccounts}/me`);
            
            if (!userResponse.data.succeeded) {
                console.error('Failed to fetch user info');
                return;
            }
            
            const currentUserEmail = userResponse.data.data.email;
            
            // Get the schools data
            const schoolResponse = await axiosInstance.get<ApiResponse<any>>(`${urlListShkolla}/get-all`);
            
            if (!schoolResponse.data.succeeded || !schoolResponse.data.data || schoolResponse.data.data.length === 0) {
                console.error('No school data available');
                return;
            }
            
            // Find the school that matches the current user email
            const matchingSchool = schoolResponse.data.data.find(
                (school: any) => school.user?.email === currentUserEmail
            );
            
            if (!matchingSchool) {
                console.error(`No matching school found for email: ${currentUserEmail}`);
                return;
            }
            
            // Check if school has an adresaId
            if (matchingSchool.adresaId) {
                // Set address ID in state right away (even without full data) to enable the save button
                setAddressInfo(prevState => ({
                    ...prevState,
                    id: matchingSchool.adresaId
                }));
                
                try {
                    // Fetch the address data using the adresaId from the school
                    const addressResponse = await axiosInstance.get<ApiResponse<AdresaDto>>(
                        `${urlListAdresa}/${matchingSchool.adresaId}`
                    );
                    
                    if (addressResponse.data.succeeded && addressResponse.data.data) {
                        const address = addressResponse.data.data;
                        
                        setAddressInfo({
                            id: address.id,
                            rruga: address.rruga || '',
                            qyteti: address.qyteti || '',
                            shteti: address.shteti || '',
                            kodiPostal: address.kodiPostal || ''
                        });
                    }
                } catch (addressError: any) {
                    console.error('Failed to fetch address info:', addressError);
                    // Even if there's an error fetching address data, we still have the ID
                    // which enables the save button
                }
            } 
            // If no adresaId on school, check if there's person.adresa data
            else if (matchingSchool.person?.adresa) {
                const personAddress = matchingSchool.person.adresa;
                
                setAddressInfo({
                    id: personAddress.id,
                    rruga: personAddress.rruga || '',
                    qyteti: personAddress.qyteti || '',
                    shteti: personAddress.shteti || '',
                    kodiPostal: personAddress.kodiPostal || ''
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch user/school info:', error);
        }
    };

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

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!addressInfo.id) {
            // Try fetching school data again without showing debug info
            await fetchSchoolAndAddressInfo();
            
            if (!addressInfo.id) {
                showToast('Adresa nuk u gjet. Ju lutemi rifreskoni faqen.', 'error');
                return;
            }
        }

        const result = await Swal.fire({
            title: 'Konfirmoni ndryshimet',
            text: 'A jeni të sigurt që dëshironi të përditësoni të dhënat e adresës?',
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
            const addressData = {
                rruga: addressInfo.rruga,
                qyteti: addressInfo.qyteti, // Keep sending this even if not in the form
                shteti: addressInfo.shteti, // Keep sending this even if not in the form
                kodiPostal: addressInfo.kodiPostal
            };

            const response = await axiosInstance.put<ApiResponse<AdresaDto>>(
                `${urlListAdresa}/${addressInfo.id}`,
                addressData
            );

            if (response.data.succeeded) {
                showToast('Të dhënat e adresës u përditësuan me sukses', 'success');
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Failed to update address info:', error);
            showToast(error.response?.data?.message || 'Gabim gjatë përditësimit të adresës', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            <ShkollaSidebar />
            <div className="flex-1 min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white p-8 relative">
                {/* Decorative Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-10 right-10 w-72 h-72 bg-green-100 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-200 rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-lime-100 rounded-full opacity-20 blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-white/50 to-transparent opacity-80"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    {/* Updated Header */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-6">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                                <UserCircleIcon className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">Profili i Përdoruesit</h1>
                                <p className="text-gray-500">{userInfo.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Personal Information Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                                <UserCircleIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
                                            value={userInfo.email || ''}
                                            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emri i plotë i shkollës
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.fullName || ''}
                                        onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ruaj ndryshimet
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Address Information Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                                <MapPinIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Informacionet e Adresës
                            </h2>
                        </div>
                        
                        <form onSubmit={handleAddressSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rruga
                                    </label>
                                    <input
                                        type="text"
                                        value={addressInfo.rruga}
                                        onChange={(e) => setAddressInfo({...addressInfo, rruga: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                        placeholder="Emri i rrugës"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kodi Postar
                                    </label>
                                    <input
                                        type="text"
                                        value={addressInfo.kodiPostal}
                                        onChange={(e) => setAddressInfo({...addressInfo, kodiPostal: e.target.value})}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                        placeholder="Kodi postar"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading} /* Removed the addressInfo.id check */
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ruaj adresën
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Enhanced Password Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                                <KeyIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                                >
                                    Ndrysho fjalëkalimin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Floating decoration */}
                <div className="fixed bottom-4 right-4 p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-lg animate-bounce opacity-50">
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
