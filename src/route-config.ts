import RedirectToLandingPage from "./RedirectToLandingPage";
import Home from "./pages/Home";
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";

const routes = [
    { path: "/", component: Home },
  { path: "/signin", component: SignIn },
  { path: "/signup", component: SignUp },

  // Komuna
  { path: "/komuna/dashboard", component: KomunaDashboard, isAdmin: true},
  { path: "/komuna/porosite/lista", component: ListaPorosive, isAdmin: true},
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
  { path: "/kompania/dashboard", component: KompaniaDashboard, isAdmin: true },
  // { path: "/kompania/porosite/market", component: Market },
  // { path: "/kompania/porosite/shporta", component: Shporta },

  {path: '*', component: RedirectToLandingPage}
    
];

export default routes;