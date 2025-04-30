import { useEffect, useState } from "react";

//video 17
export default function Pagination( props: paginationProps) {
  const [linkModels, setLinkModels] = useState<linkModel[]>([]);

  //funnksioni kur klikohet nje faqe (page)
  function selectPage(link: linkModel) {
    if (link.page === props.currentPage) {
      return; //nese jemi ne ate page ku po klikojme, nuk kthen asgje
    }

    if (!link.enabled) {
      return; //nese linku nuk eshte enabled, nuk kthen asgje
    }

    props.onChange(link.page); //perndryshe i tregohet komponentes prind se ne cilen page klikuar (sepse onChange e kemi si parameter)
  }

  function getClass(link: linkModel) {
    if (link.active) {
      return "active pointer";
    }

    if (!link.enabled) {
      return "disabled";
    }

    return "pointer";
  }

  useEffect(() => {
    // e perdorim useEffect sepse deshirojme qe te ekzekutohet menjehere pasi komponenta te behet load
    //kodi per butonat e paginizmit

    const previousPageEnabled = props.currentPage !== 1; //kontrollojme se a eshte butoni enabled, nese nuk esht ne faqen 1 (dmth eshte 2, 3...) Previous butoni eshte enabled
    const previousPage = props.currentPage - 1; // nxjerrim faqen e kaluar, faqja e kaluar eshte current - 1
    const links: linkModel[] = []; //nje liste ku i vendosim butonat (linqet) bashk me karakteristikat e butonave (atributet e caktuara ne interfacen linkModel)

    //kodi per butonin 'Previous'
    links.push({
      text: "Previous", //emri i butonit do te jete previous
      enabled: previousPageEnabled, //do te jete enabled varesoisht se a eshte ne faqen e pare apo jo
      page: previousPage, //do te pointoje ne faqen mbrapa (previous)
      active: false, // nuk do te jete aktiv kurre, sepse ky buton nuk reprezenton nje faqe, vetem pointon tek nje faqe
    });

    //pastaj do te iterojme nga 1 deri tek totali i faqeve
    for (let i = 1; i <= props.totalAmountOfPages; i++) {
      //merremi vetem me butonat qe jane brenda intervalit te radios (+-radio)
      if (
        i >= props.currentPage - props.radio &&
        i <= props.currentPage + props.radio
      ) {
        links.push({
          text: `${i}`, //emri i butonit do te jete numri rendor i unaze
          active: props.currentPage === i, //do te jete aktiv nese currentPage eshte aktive (nese current page esht i)
          enabled: true, //do te jete enabled (i klikueshem)
          page: i, //do te pointoje te faqja me numrin i
        });
      }
    }
    console.log(props.radio);
    console.log(props.currentPage);
    //kodi per butonin 'Next'
    const nextPageEnabled =
      props.currentPage !== props.totalAmountOfPages &&
      props.totalAmountOfPages > 0; //faqja 'Next' esht enabled nese nuk jemi ne faqen e fundit dhe nese numri total i faqeve eshte > 0
    const nextPage = props.currentPage + 1; //faqja e 'Next' eshte current + 1

    links.push({
      text: "Next",
      page: nextPage,
      enabled: nextPageEnabled,
      active: false,
    });

    setLinkModels(links); //e bejme ndryshimin ne linkModels per te ndrruar faqja
  }, [props.currentPage, props.totalAmountOfPages, props.radio]); //disa dependencies tek useEffecti

  return (
    //UI i butonave te paginizmit
    <nav>
      <ul className="pagination justify-content-center">
        {linkModels.map(
          (
            link //i nxjerrim butonat nga lista
          ) => (
            <li
              key={link.text}
              onClick={() => selectPage(link)}
              className={`page-item cursor ${getClass(link)}`}
            >
              <span className="page-link">{link.text}</span>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

interface linkModel {
  //per reprezentimin e te dhenave te scilit buton qe kemi ne paginizem
  page: number; //faqja ku butoni po pointon, nese klikohet
  enabled: boolean; //sepse mund te kemi butona qe jane disabled
  text: string; //permbajtja e butonit
  active: boolean; //nese klienti eshte ne ate faqe
}

interface paginationProps {
  currentPage: number; //faqja aktuale ku klienti gjendet
  totalAmountOfPages: number; // numri total i faqeve
  radio: number; //numri i faqeve qe shfaqen per klikim
  //(psh, nese e ka vleren 2 dhe jemi ne faqen 5, atehere di te shfaqen +-2 , pra 3, 4, 5, 6, 7)
  onChange(page: number): void; //kur klienti klikon njerin nga butonat e paginizmit
}

Pagination.defaultProps = {
  radio: 3
};
