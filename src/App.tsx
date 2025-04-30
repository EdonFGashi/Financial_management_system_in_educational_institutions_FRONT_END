// import { useEffect, useState } from "react";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import AuthenticationContext from "./auth/AuthenticationContext";
// import { claim } from "./auth/auth.models";
// import { getClaims } from "./auth/handleJWT";
// import routes from "./route-config";


// function App() {

//   //meqe esht komponenta prind e tere komponentave tjera, nga ketu po deshirojme qe ti shperndajme claims te klienteve tone
//   //na duhet nje useState variabel sepse po deshirojme qe sa here te ndryshojme claims, te ndryshoje edhe UI (sepse komponentete si Authorized do ta perditesojne UI)
//   //ketu na vijne claims te userit
//   const [claims, setClaims] = useState<claim[]>([
//     // { name: "email", value: "edon@live.com" },
//     // { name: "role", value: "admin" },
//   ]);

//   //i merr claims kur aplikacioni ngarkohet (edhe nese bejme refresh prap i kemi tokenin)
//   useEffect(() => {
//     setClaims(getClaims())
//   }, [])

//   function isAdmin() {
//     return (
//       claims.findIndex(
//         (claim) => claim.name === "role" && claim.value === "admin"
//       ) > -1
//     );
//   }

//   return (
//     <BrowserRouter>
//     <AuthenticationContext.Provider value={{ claims, update: setClaims }}>
//     <div className="container">

//       <Routes>
//       {routes.map((route) => (
//               <Route
//                 key={route.path}
//                 path={route.path}
//                 element={
//                   //MBROJTJA E NJE ROUTE
//                   route.isAdmin && !isAdmin()  ? (//nese pathi eshte i mbrojtur dhe nese roli nuk esht admin atehere shfaq 'You are not allowed to see this page'
//                     <>You are not allowed to see this page !</>
//                   ) : (
//                     <route.component />//perndryshe nese roli esht admin ose pathi nuk eshte i mbrojtur atehere  shfaq komponeten
//                   )
//                 }
//               />
//             ))}

//       </Routes>
//     </div>
    
//     </AuthenticationContext.Provider>
//     </BrowserRouter>
//   );
// }

// export default App;


import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthenticationContext from "./auth/AuthenticationContext";
import { claim } from "./auth/auth.models";
import { getClaims } from "./auth/handleJWT";
import routes from "./route-config";

function App() {
  const [claims, setClaims] = useState<claim[]>([]);

  useEffect(() => {
    setClaims(getClaims());
  }, []);

  function hasRole(role: string) {
    return claims.some((claim) => claim.name === "role" && claim.value === role);
  }

  function isAuthorized(allowedRoles: string[]) {
    return allowedRoles.some(role => hasRole(role));
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
  );
}

export default App;
