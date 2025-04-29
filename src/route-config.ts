/*
* Auth Routes
*/
import RedirectToLandingPage from "./RedirectToLandingPage";
import Signup from "./AuthForm";
import Register from "./Register";
import Login from "./auth/Login";


/*
* Home routes
*/
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";

/*
*Komuna routes
*/

import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";

/*
* Shkolla routes
*/
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";

/*
* Kompania routes
*/
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";
import RegjistriProdukteve from "./pages/Kompania/produktet/regjistriProdukteve";
import ListaPorosiveKompani from "./pages/Kompania/porosite/listaPorosive";
import RaportiPorosiveKompani from "./pages/Kompania/porosite/raportiPorosive";

const routes = [
    { path: "/", component: Home },
  { path: "/signin", component: Login },
  // { path: "/signup", component: SignUp },
  { path: "/register", component: Register },

  // Komuna
  { path: "/komuna/dashboard", component: KomunaDashboard, isAdmin: true},
  { path: "/komuna/porosite/lista", component: ListaPorosive, isAdmin: false},
  { path: "/komuna/porosite/raporte", component: RaportetPorosi ,isAdmin: true},

  // Shkolla
  { path: "/shkolla/dashboard", component: ShkollaDashboard, isAdmin: true },
  { path: "/shkolla/porosite/market", component: Market , isAdmin: true},
  { path: "/shkolla/porosite/shporta", component: Shporta , isAdmin: true},
  { path: "/shkolla/porosite/historiku", component: Historiku , isAdmin: true},
  { path: "/shkolla/stafi/menaxhimi", component: StafiShkolles , isAdmin: true},
  // { path: "/shkolla/stafi/ndalesat", component: NdalesatPage },
  // { path: "/shkolla/stafi/oret-shtese", component: OretShtesePage },

  // Kompania
  { path: "/kompania/dashboard", component: KompaniaDashboard, isAdmin: false },
  { path: "/kompania/regjistri", component: RegjistriProdukteve, isAdmin: false },
  { path: "/kompania/porosite/lista", component: ListaPorosiveKompani, isAdmin: false },
  { path: "/kompania/porosite/raporte", component: RaportiPorosiveKompani, isAdmin: false },
  
  

  {path: '*', component: RedirectToLandingPage}
    
];

export default routes;