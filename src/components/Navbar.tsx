import { Link, useLocation } from "react-router-dom";
import Authorized from "../auth/Authorized";
import { BanknotesIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import { logout } from "../auth/handleJWT";
import { useContext } from "react";
import AuthenticationContext from "../auth/AuthenticationContext";

function Navbar() {
  const location = useLocation();

  const {update, claims} = useContext(AuthenticationContext);
  function getUserEmail(): string {
    return claims.filter(x => x.name === "email")[0]?.value;
  }

  const navLinks = [
    { to: "/", label: "Ballina" },
    { to: "/komuna/dashboard", label: "Komuna" },
  ];

  const authorizedLinks = [
    { to: "/shkolla/dashboard", label: "Shkolla" },
    { to: "/kompania/dashboard", label: "Kompanite" },
    { to: "/perdoruesit", label: "Perdoruesit" }
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

      {/* Links */}
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


          {/* Authorized Links (only visible to admin) */}
        <Authorized
          // role="admin"
          authorized={
            <>
              {authorizedLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-lg font-medium transition duration-200 ${isActive(link.to)} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-black hover:after:w-full after:transition-all after:duration-300`}
                >
                  {link.label}
                </Link>
              ))}
              <span className="nav-link">Hello, {getUserEmail()}</span>
              <Button 
              onClick={() =>{
                logout();
                update([]);
              }}
              className="nav-link btn btn-link"
              >Log Out</Button>
            </>
          }
          notAuthorized={<>
            <Link
          to="/register"
          className="px-5 py-2 bg-black text-white rounded-xl font-medium shadow-md hover:bg-gray-800 transition"
        >
          Register
        </Link>
            <Link
          to="/signin"
          className="px-5 py-2 bg-black text-white rounded-xl font-medium shadow-md hover:bg-gray-800 transition"
        >
          Log In
        </Link>
          </>}
        />

        {/* Login Button */}
        {/* <Link
          to="/signin"
          className="px-5 py-2 bg-black text-white rounded-xl font-medium shadow-md hover:bg-gray-800 transition"
        >
          Log In
        </Link> */}
      </div>
    </nav>
  );
}

export default Navbar;
