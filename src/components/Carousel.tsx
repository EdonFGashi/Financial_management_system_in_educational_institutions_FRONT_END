import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
  {
    src: "/images/4.jpg",
    caption: "Menaxhimi i Buxhetit në Kohë Reale",
  },
  {
    src: "/images/2.jpg",
    caption: "Kërkesa për Inventar nga Shkollat",
  },
  {
    src: "/images/3.jpg",
    caption: "Faturat e Gjeneruara nga Kompanitë",
  },
];

function Carousel() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 600,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
      arrows: false,
    };
  
    return (
      <div className="w-full">
        <Slider {...settings}>
          {images.map((item, index) => (
            <div key={index} className="relative h-[80vh] w-full">
              <img
                src={item.src}
                alt={item.caption}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-6 py-2 rounded text-white text-xl">
                {item.caption}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    );
  }
  
  export default Carousel;