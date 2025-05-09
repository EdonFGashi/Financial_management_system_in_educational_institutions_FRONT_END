import Home from "./pages/Home";
import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import AnimatedRoutes from "./components/AnimatedRoutes";
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";
import OretShtese from "./pages/Shkolla/stafi/OretShtese";
import Ndalesat from "./pages/Shkolla/stafi/Ndalesat";
import InventariAktual from "./pages/Shkolla/InventariAktual";
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";
import routes from "./route-config";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthenticationContext from "./auth/AuthenticationContext";
import { claim } from "./auth/auth.models";
import { getClaims } from "./auth/handleJWT";

import RegjistriProdukteve from "./pages/Kompania/produktet/regjistriProdukteve";
import configureIntercetor from "./auth/httpInterceptors";

configureIntercetor();

function App() {
  const [claims, setClaims] = useState<claim[]>([]);

  useEffect(() => {
    setClaims(getClaims());
  }, []);

  function hasRole(role: string) {
    return claims.some(
      (claim) => claim.name === "role" && claim.value === role
    );
  }

  function isAuthorized(allowedRoles: string[]) {
    return allowedRoles.some((role) => hasRole(role));
  }

  return (
    <BrowserRouter>
      <AuthenticationContext.Provider value={{ claims, update: setClaims }}>
        <div className="container">
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.allowedRoles && !isAuthorized(route.allowedRoles) ? (
                    <>You are not allowed to see this page!</>
                  ) : (
                    <route.component />
                  )
                }
              />
            ))}
          </Routes>
        </div>
      </AuthenticationContext.Provider>
    </BrowserRouter>
    // =======
    //     <Router>
    //       <AnimatedRoutes>
    //         <Routes>
    //           <Route path="/" element={<Home />} />
    //           <Route path="/signin" element={<SignIn />} />
    //           <Route path="/signup" element={<SignUp />} />
    //           // Komuna
    //           <Route path="/komuna/dashboard" element={<KomunaDashboard />} />
    //           <Route path="/komuna/porosite/lista" element={<ListaPorosive />} />
    //           <Route path="/komuna/porosite/raporte" element={<RaportetPorosi />} />
    //           // Shkolla
    //           <Route path="/shkolla/dashboard" element={<ShkollaDashboard />} />
    //           <Route path="/shkolla/porosite/market" element={<Market />} />
    //           <Route path="/shkolla/porosite/shporta" element={<Shporta />} />
    //           <Route path="/shkolla/porosite/historiku" element={<Historiku/>} />
    //           <Route path="/shkolla/stafi/menaxhimi" element={<StafiShkolles />} />
    //           <Route path="/shkolla/porosite/inventari" element={<InventariAktual />} />

    //           {/*<Route path="/shkolla/stafi/ndalesat" element={<NdalesatPage />} />*/}
    //           {/*<Route path="/shkolla/stafi/oret-shtese" element={<OretShtesePage />} />*/}
    //           // Kompania
    //           <Route path="/kompania/dashboard" element={<KompaniaDashboard />} />
    //           <Route path="/kompania/regjistri" element={<RegjistriProdukteve />} />
    //           {/* <Route path="/kompania/porosite/market" element={<Market />} />
    //           <Route path="/kompania/porosite/shporta" element={<Shporta />} /> */}
    //         </Routes>
    //       </AnimatedRoutes>
    //     </Router>
  );
}

export default App;
