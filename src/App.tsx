import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import AnimatedRoutes from "./components/AnimatedRoutes";
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";
import InventariAktual from "./pages/Shkolla/porosite/InventariAktual";
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";
import routes from "./route-config";
import { useEffect, useState } from "react";
import { claim } from "./auth/auth.models";
import AuthenticationContext from "./auth/AuthenticationContext";
import { getClaims } from "./auth/handleJWT";

import RegjistriProdukteve from "./pages/Kompania/produktet/regjistriProdukteve" 


function App() {

  //meqe esht komponenta prind e tere komponentave tjera, nga ketu po deshirojme qe ti shperndajme claims te klienteve tone
  //na duhet nje useState variabel sepse po deshirojme qe sa here te ndryshojme claims, te ndryshoje edhe UI (sepse komponentete si Authorized do ta perditesojne UI)
  //ketu na vijne claims te userit
  const [claims, setClaims] = useState<claim[]>([
    // { name: "email", value: "edon@live.com" },
    // { name: "role", value: "admin" },
  ]);

  //i merr claims kur aplikacioni ngarkohet (edhe nese bejme refresh prap i kemi tokenin)
  useEffect(() => {
    setClaims(getClaims())
  }, [])

  function isAdmin() {
    return (
      claims.findIndex(
        (claim) => claim.name === "role" && claim.value === "admin"
      ) > -1
    );
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
                  //MBROJTJA E NJE ROUTE
                  route.isAdmin && !isAdmin()  ? (//nese pathi eshte i mbrojtur dhe nese roli nuk esht admin atehere shfaq 'You are not allowed to see this page'
                    <>You are not allowed to see this page !</>
                  ) : (
                    <route.component />//perndryshe nese roli esht admin ose pathi nuk eshte i mbrojtur atehere  shfaq komponeten
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
