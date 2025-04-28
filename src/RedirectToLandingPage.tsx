import { Navigate } from "react-router-dom";;

export default function RedirectToLandingPage(){
    return <Navigate to= '/' replace />
    //replace perdoret per te parandaluar qe te vendoset 
    //redirect ne navigation history
}
