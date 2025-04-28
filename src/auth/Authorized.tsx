import { ReactElement, useContext, useEffect, useState } from "react";
import AuthenticationContext from "./AuthenticationContext";

export default function Authorized(props: authorizedProps) {
  //useState variabel qe percjell nese klienti eshte i autorizuar ose jo
  //fillimisht do caktohet me true ose false, por me vone do te jete me komplekse
  const [isAuthorized, setIsAuthorized] = useState(true);
  const { claims } = useContext(AuthenticationContext);

  useEffect(() => {
    if (props.role) {
      //nese useri e ka nje rol te caktuar ne claimin role te tij atehere:
      const index = claims.findIndex(
        //index e kthen indeksin e claimit ne arrayn a claims (nese kthen -1 dmth qe nuk ka asnje claim)
        (claim) => claim.name === "role" && claim.value === props.role
      ); //ne listen e claims kerko per claimin 'role' dhe nese vlera e atij claim-i eshte vlera e derguar ne property (psh, role='admin'). Kete ruaje ne variablen index
      setIsAuthorized(index > -1); //nese useri e ka index > -1 e bejme te autorizuar ndersa nese e ka indexin == -1 dmth qe nuk e ka claimin e kerkuar ne if(props.role) dhe rrjedhimisht edhe nuk eshte i autorizuar ne kete instance te kesaj komponente
    } else {
      // nese nuk ka rol te definuar ne claim, atehere esht e mjaftueshme qe te jete i autentikuar, per te qene i autorizuar (sepse ai mund te jete i autentikuar, por te mos jete admin)
      //dhe po e autorizojme nese ka qfaredo te dhene ne claims te tij (claims.length > 0)(dmth qe eshte i autentikuar)
      //dhe e autorizojme sepse veqse eshte i autentikuar edhe nese nuk e ka rolin te cilin kerkohet
      setIsAuthorized(claims.length > 0);
    }
  }, [claims, props.role]);
  return (
    <>
      {/* nese klienti eshte i autorizuar do ti shfaqet permbajtja e caktuar per te autorizuar, perndryshe do ti shfaqet permbajtja per jo te autorizuar */}
      {isAuthorized ? props.authorized : props.notAuthorized}
    </>
  );
}

interface authorizedProps {
  authorized: ReactElement; //qka do te shoh klinenti nese eshte i autorizuar
  notAuthorized?: ReactElement; // qka do te shohe klienti nese nuk esht i autorizuar
  role?: string; //na mundeson qe ta specifikojme qe klienti psh duhet te jete admin ne menyre qe te shohe diqka
}
