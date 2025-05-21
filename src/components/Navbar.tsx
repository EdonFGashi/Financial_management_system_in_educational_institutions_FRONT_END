import { Link, useLocation, useNavigate } from "react-router-dom";
import Authorized from "../auth/Authorized";
import { BanknotesIcon, BriefcaseIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import { logout } from "../auth/handleJWT";
import { useContext } from "react";
import AuthenticationContext from "../auth/AuthenticationContext";
import Swal from 'sweetalert2';
import { Label } from "@headlessui/react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {update, claims} = useContext(AuthenticationContext);

  function getUserEmail(): string {
    return claims.filter(x => x.name === "email")[0]?.value;
  }

  const handleLogout = () => {
    Swal.fire({
      title: 'Dëshironi të dilni?',
      text: "Ju do të çkyçeni nga sistemi!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Po, dil!',
      cancelButtonText: 'Anulo'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        update([]);
        navigate('/');
        Swal.fire(
          'Çkyçur!',
          'Ju keni dalë me sukses nga sistemi.',
          'success'
        );
      }
    });
  };

  const navLinks = [
    { to: "/", label: "Ballina" },
  ];

  const authorizedLinks = [
    {to: "/register", label: "Regjistro", roles:["SuperAdmin","admin", "Komunë", "Admin"]},
    { to: "/komuna/dashboard", label: "Komuna" , roles: ["SuperAdmin", "Komunë", "Admin", "komune"]},
    { to: "/shkolla/dashboard", label: "Shkolla" , roles: ["SuperAdmin","admin", "Shkolla","Admin"]},
    { to: "/kompania/dashboard", label: "Kompanite" , roles: ["SuperAdmin", "Admin", "Kompania"]},
    { to: "/perdoruesit", label: "Perdoruesit" ,  roles: ["SuperAdmin", "Admin" ]}

  ];


  const isActive = (path: string) =>
    location.pathname === path
      ? "text-black font-semibold underline underline-offset-4"
      : "text-black";

  return (
    <nav className="bg-white px-6 py-4 shadow-md flex items-center justify-between border-b border-gray-200">
      {/* Brand */}
      <Link
        to="/"
        className="text-2xl font-extrabold tracking-wide text-black hover:opacity-90 transition"
      >
        Financa<span className="text-gray-400">Edu</span>
      </Link>

      <div className="flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative text-lg font-medium transition duration-200 ${isActive(
              link.to
            )} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-black hover:after:w-full after:transition-all after:duration-300`}
          >
            {link.label}
          </Link>
        ))}     

{authorizedLinks.map((link) => (
     
     <Authorized
       key={link.to}
       allowedRoles={link.roles}
       authorized={
         <>
         <Link
           to={link.to}
           className={`relative text-lg font-medium transition duration-200 ${isActive(link.to)} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-black hover:after:w-full after:transition-all after:duration-300`}
         >
           {link.label}
         </Link>

         </>
       }

     />
   ))}


        <Authorized
          authorized={
            <>
                {/* Updated email display */}
         <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <UserCircleIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {getUserEmail()}
                </span>
              </div>

              {/* Updated logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
                Çkyçu
              </button>
              
              
            </>
          }
          notAuthorized={
            <div className="flex items-center space-x-4">
              <Link
                to="/register"
                className="px-6 py-2.5 bg-white text-black border-2 border-black rounded-lg font-medium 
                hover:bg-black hover:text-white transition-all duration-200 ease-in-out transform 
                hover:scale-105 active:scale-95 shadow-sm"
              >
                Regjistrohu
              </Link>
              <Link
                to="/signin"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium 
                hover:bg-indigo-700 transition-all duration-200 ease-in-out transform 
                hover:scale-105 active:scale-95 shadow-md"
              >
                Kyçu
              </Link>
            </div>
          }
        />
      </div>
    </nav>
  );
}

export default Navbar;
