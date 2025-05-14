import { useContext } from "react";
import AuthenticationContext from "../auth/AuthenticationContext";
import Register from "../Register";
import KompaniRegister from "../KompaniRegister";

const RoleBasedRegister = () => {
  const { claims } = useContext(AuthenticationContext);

  const roleClaim = claims.find((claim) => claim.name === "role");
  const role = roleClaim?.value;

  if (role === "SuperAdmin" || role === "Admin") {
    return <Register />;
  }

  return <KompaniRegister />;
};

export default RoleBasedRegister;