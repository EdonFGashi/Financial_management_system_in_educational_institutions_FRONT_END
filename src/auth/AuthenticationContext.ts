import React from 'react';
import {claim} from './auth.models';

//do te krijojme nje context qe do na mundesoje ti lexojme claims qe ka nje user dhe ti perditesojme claims te reja per user
//claims jane informacione te userit: emri, emaili...
 const AuthenticationContext = React.createContext<{
    claims: claim[];
    update(claims: claim[]): void//na mundeson qe ti perditesojme claims permes ketij contexti, dmth qe nese ka nje claim te ri mund ta bartim ne tere aplikacionin
 }>({claims: [], update: () => {}});//vlerat by default te ketij contexti, nje array e zbrazet e claims dhe funksioni update qe nuk ben asgje

export default AuthenticationContext;

