import React, { useState, useEffect } from 'react';
import { UserCircleIcon, KeyIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Button from '../../components/Button';
import KompaniaSidebar from './Sidebar';
import Swal from 'sweetalert2';
import { urlKompania, urlListAdresa } from '../../endpoints';
import axiosInstance from '../../api/axiosInstance';
import { urlAccounts } from '../../endpoints';
import Toast from '../../components/Toast';

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

// Interface for user data
interface UserInfoDto {
  email: string;
  fullName: string;
  companyName?: string;
}

// Interface for Kompania data structure based on API response
interface KompaniaDto {
  id: number;
  emri: string;
  pronariId: number;
  person?: {
    numriPersonal: number;
    emri: string;
    mbiemri: string;
    nacionaliteti?: string | null;
    adresaId: number;
    adresa?: AdresaDto;
    gjinia: string;
    dataLindjes: string;
  };
  sherbimi: string;
  nrXhirologaris: number;
  adresaId?: number;
  adresa?: AdresaDto | null;
  userId: string;
  user?: {
    fullName?: string | null;
    komunaId: number;
    komuna?: any;
    email: string;
    userName: string;
    // ...other user properties
  };
  createdAt: string;
  updatedAt?: string | null;
}

const UserProfile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfoDto>({
    email: '',
    fullName: '',
    companyName: '',
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
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [kompaniaInfo, setKompaniaInfo] = useState<KompaniaDto | null>(null);

  // Show toast function
  const showToast = (message: string, type: "success" | "error") => {
    setToastInfo({ message, type });
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get<{data: UserInfoDto, succeeded: boolean}>(`${urlAccounts}/me`);
        if (response.data.succeeded) {
          setUserInfo({
            email: response.data.data.email || '',
            fullName: response.data.data.fullName || '',
            companyName: response.data.data.companyName || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        showToast('Gabim gjatë marrjes së të dhënave të përdoruesit', 'error');
      }
    };

    fetchUserInfo();
    fetchKompaniaAndAddressInfo();
  }, []);

  const fetchKompaniaAndAddressInfo = async () => {
    try {
      // First get the current user's info to get the email
      const userResponse = await axiosInstance.get<{data: UserInfoDto, succeeded: boolean}>(`${urlAccounts}/me`);
      
      if (!userResponse.data.succeeded) {
        showToast('Gabim gjatë marrjes së të dhënave të përdoruesit', 'error');
        return;
      }
      
      const currentUserEmail = userResponse.data.data.email;
      console.log("Current user email:", currentUserEmail);
      
      // Get all kompania data
      const kompaniaResponse = await axiosInstance.get<{
        data: KompaniaDto[], 
        succeeded: boolean,
        message: string,
        statusCode: number
      }>(`${urlKompania}`);
      
      if (!kompaniaResponse.data.succeeded || !kompaniaResponse.data.data) {
        showToast('Nuk u gjetën të dhëna për kompaninë', 'error');
        return;
      }
      
      console.log("All kompania records:", kompaniaResponse.data.data);
      
      // Find the kompania that matches the current user email
      const matchingKompania = kompaniaResponse.data.data.find(
        (kompania: KompaniaDto) => 
          kompania.user?.email === currentUserEmail || 
          kompania.user?.userName === currentUserEmail
      );
      
      if (!matchingKompania) {
        console.error(`No matching kompania found for email: ${currentUserEmail}`);
        showToast(`Nuk u gjet asnjë kompani për emailin: ${currentUserEmail}`, 'error');
        return;
      }
      
      console.log("Found matching kompania:", matchingKompania);
      
      // Store the kompania data for later use
      setKompaniaInfo(matchingKompania);
      
      // Set user info from kompania data
      setUserInfo({
        email: matchingKompania.user?.email || currentUserEmail,
        fullName: matchingKompania.emri || '',
        companyName: matchingKompania.emri || ''
      });
      
      // Get address ID from the matching kompania record
      let adresaId: number | null = null;
      
      // First check if kompania has adresaId directly
      if (matchingKompania.adresaId) {
        adresaId = matchingKompania.adresaId;
        console.log("Found kompania address ID:", adresaId);
      } 
      // Then check if there's an address ID in the person property
      else if (matchingKompania.person?.adresaId) {
        adresaId = matchingKompania.person.adresaId;
        console.log("Found person address ID:", adresaId);
      }
      
      if (!adresaId) {
        console.warn("No address ID found for the kompania");
        return;
      }
      
      // Set the address ID in state right away
      setAddressInfo(prevState => ({
        ...prevState,
        id: adresaId
      }));
      
      // Try to get address data from kompania record first
      let addressData: AdresaDto | null = null;
      if (matchingKompania.adresa) {
        addressData = matchingKompania.adresa;
      } else if (matchingKompania.person?.adresa) {
        addressData = matchingKompania.person.adresa;
      }
      
      // If we don't have address data yet, fetch it using the ID
      if (!addressData && adresaId) {
        try {
          const addressResponse = await axiosInstance.get<{
            data: AdresaDto, 
            succeeded: boolean,
            message: string
          }>(`${urlListAdresa}/${adresaId}`);
          
          if (addressResponse.data.succeeded) {
            addressData = addressResponse.data.data;
            console.log("Fetched address data:", addressData);
          }
        } catch (addressError) {
          console.error('Failed to fetch address info:', addressError);
          showToast('Gabim gjatë marrjes së informacionit të adresës', 'error');
        }
      }
      
      // Update address info with fetched data
      if (addressData) {
        setAddressInfo({
          id: adresaId,
          rruga: addressData.rruga || '',
          qyteti: addressData.qyteti || '',
          shteti: addressData.shteti || '',
          kodiPostal: addressData.kodiPostal || ''
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch kompania/address info:', error);
      showToast(error.response?.data?.message || 'Gabim gjatë marrjes së të dhënave', 'error');
    }
  };

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Konfirmoni ndryshimet',
      text: 'A jeni të sigurt që dëshironi të përditësoni të dhënat e kompanisë?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Po, përditëso',
      cancelButtonText: 'Anulo',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    
    try {
      // First update user account info
      const accountResponse = await axiosInstance.post<{succeeded: boolean, message: string}>(
        `${urlAccounts}/update-profile`,
        {
          email: userInfo.email,
          fullName: userInfo.fullName
        }
      );

      if (!accountResponse.data.succeeded) {
        throw new Error(accountResponse.data.message);
      }

      // If we have kompania data, update the kompania name if needed
      if (kompaniaInfo && kompaniaInfo.id) {
        try {
          // Preserve all existing kompania data and only update what's changed
          const kompaniaUpdateData = {
            emri: userInfo.fullName,
            pronariId: kompaniaInfo.pronariId,
            sherbimi: kompaniaInfo.sherbimi,
            nrXhirologaris: kompaniaInfo.nrXhirologaris,
            adresaId: kompaniaInfo.adresaId || addressInfo.id // Use address ID if available
          };

          const kompaniaResponse = await axiosInstance.put<{succeeded: boolean, message: string}>(
            `${urlKompania}/${kompaniaInfo.id}`,
            kompaniaUpdateData
          );

          if (!kompaniaResponse.data.succeeded) {
            console.warn('Kompania update failed:', kompaniaResponse.data.message);
            throw new Error(kompaniaResponse.data.message);
          }
        } catch (kompaniaError: any) {
          console.error('Failed to update kompania:', kompaniaError);
          throw new Error(kompaniaError.response?.data?.message || 'Gabim gjatë përditësimit të kompanisë');
        }
      } else {
        console.warn('No kompania info available for update');
      }

      showToast('Të dhënat u përditësuan me sukses', 'success');
    } catch (error: any) {
      console.error('Failed to update user info:', error);
      showToast(error.message || 'Gabim gjatë përditësimit të të dhënave', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressInfo.id) {
      showToast('Adresa nuk u gjet. Ju lutemi rifreskoni faqen.', 'error');
      return;
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
    
    try {
      // Create the payload for address update with all required fields
      // Keep the existing qyteti and shteti values, only update rruga and kodiPostal
      const addressData = {
        rruga: addressInfo.rruga,
        qyteti: addressInfo.qyteti, // Keep existing value, user can't change this
        shteti: addressInfo.shteti, // Keep existing value, user can't change this
        kodiPostal: addressInfo.kodiPostal
      };

      console.log(`Updating address with ID: ${addressInfo.id}`, addressData);
      
      const response = await axiosInstance.put<{data: AdresaDto, succeeded: boolean, message: string}>(
        `${urlListAdresa}/${addressInfo.id}`,
        addressData
      );

      if (response.data.succeeded) {
        showToast('Të dhënat e adresës u përditësuan me sukses', 'success');
        
        // Also update the local kompania info if needed
        if (kompaniaInfo) {
          // Update the address in the kompania info to keep it in sync
          if (kompaniaInfo.adresa) {
            kompaniaInfo.adresa = {
              ...kompaniaInfo.adresa,
              ...addressData
            };
          }
          if (kompaniaInfo.person?.adresa) {
            kompaniaInfo.person.adresa = {
              ...kompaniaInfo.person.adresa,
              ...addressData
            };
          }
          setKompaniaInfo({...kompaniaInfo});
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Failed to update address:', error);
      showToast(error.response?.data?.message || 'Gabim gjatë përditësimit të adresës', 'error');
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
    
    try {
      const passwordData = {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmNewPassword: passwords.confirmPassword
      };

      const response = await axiosInstance.post<{succeeded: boolean, message: string}>(
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
      console.error('Failed to change password:', error);
      showToast(error.response?.data?.message || 'Gabim gjatë ndryshimit të fjalëkalimit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <KompaniaSidebar />
      <div className="flex-1 min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-white p-8 relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-red-100 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-rose-200 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-100 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-white/50 to-transparent opacity-80"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <UserCircleIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Profili i Kompanisë</h1>
                <p className="text-gray-500">{userInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Company Information Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-md">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
                Informacionet e Kompanisë
              </h2>
            </div>
            <form onSubmit={handleUserInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emaili
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emri i plotë i kompanisë
                  </label>
                  <input
                    type="text"
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                >
                  {loading ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                </button>
              </div>
            </form>
          </div>

          {/* Address Information Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-md">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="Kodi postar"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qyteti
                  </label>
                  <input
                    type="text"
                    value={addressInfo.qyteti}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                    placeholder="Qyteti"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shteti
                  </label>
                  <input
                    type="text"
                    value={addressInfo.shteti}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                    placeholder="Shteti"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !addressInfo.id}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                >
                  {loading ? "Duke ruajtur..." : "Ruaj adresën"}
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-md">
                <KeyIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-sm"
                >
                  {loading ? "Duke ruajtur..." : "Ndrysho fjalëkalimin"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Floating decoration */}
        <div className="fixed bottom-4 right-4 p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-lg animate-bounce opacity-50">
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
};

export default UserProfile;
