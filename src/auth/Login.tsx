import { useContext, useState } from "react";
import { authenticationResponse, userCredentials } from "./auth.models";
import axios from "axios";
import { urlAccounts } from "../endpoints";
import AuthForm from "../AuthForm";
// import { getClaims, saveToken } from "./handleJWT";
import AuthenticationContext from "./AuthenticationContext";
import {  useNavigate } from "react-router-dom";
import { getClaims, saveToken } from "./handleJWT";

export default function Login(){
 
    const [errors, setErrors] = useState<string[]>([]);
    const {update} = useContext(AuthenticationContext);
    const navigate = useNavigate();

    async function login(credentials: userCredentials){
        try{
            setErrors([]);
            const response = await axios
            .post<authenticationResponse>(`${urlAccounts}/login`, credentials);
            saveToken(response.data);
            update(getClaims());
            navigate('/');
            console.log(credentials);
            console.log(response.data);
        }
        catch(error){
            // setErrors{error.response.data};
        }
    }

    return (
        <>
            <AuthForm model={{email: '', password: ''}}
                onSubmit={async values => await login(values)}
            />
        </>
    )
}