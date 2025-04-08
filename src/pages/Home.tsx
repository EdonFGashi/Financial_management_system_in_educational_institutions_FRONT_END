import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import ThreeHeroVisual from "../components/ThreeHeroVisual";
import TypewriterSubtext from "../components/TypewriterSubtext";

import AOS from "aos";
import "aos/dist/aos.css";
import "../App.css";

const messages = [
  "Mirësevini!",
  "Ne bëjmë ëndrrat realitet.",
  "Digjitalizoni financat.",
  "Thjeshtë, shpejtë dhe sigurt.",
];

function Home() {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] bg-gradient-to-r from-indigo-700 to-blue-600 overflow-hidden flex flex-col-reverse md:flex-row items-center justify-center gap-8 px-6 md:px-20 pt-12 md:pt-0">
        {/* Text Left */}
        <div className="z-10 w-full md:w-1/2 text-center md:text-left">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentMessage}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
            >
              {messages[currentMessage]}
            </motion.h1>
          </AnimatePresence>

          <TypewriterSubtext
            text="Ndërtoje të ardhmen që ke ëndërruar."
            delay={250}
          />
        </div>

        {/* 3D Visual Right */}
        <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
          <ThreeHeroVisual />
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-white" data-aos="fade-up">
        <div className="max-w-6xl mx-auto grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
          {[
            {
              title: "Komuna",
              desc: "Menaxhon buxhetin, aprovon kërkesat dhe realizon pagesat me efikasitet.",
            },
            {
              title: "Shkolla",
              desc: "Kërkesa për inventar, raportim të orëve dhe menaxhim të blerjeve në një vend.",
            },
            {
              title: "Kompania",
              desc: "Ofron produkte, gjeneron fatura dhe bashkëpunon për pagesa të sigurta.",
            },
          ].map((role, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={i * 150}
            >
              <h2 className="text-2xl font-semibold mb-4">{role.title}</h2>
              <p className="text-base leading-relaxed">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carousel */}
      <section data-aos="fade-up" className="py-12 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <Carousel />
        </div>
      </section>

      {/* CTA */}
      <section
        className="bg-indigo-700 text-white py-16 px-6 text-center"
        data-aos="fade-in"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Gati të filloni?
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto">
          Regjistrohuni ose kontaktoni ekipin tonë për më shumë informacion
          rreth sistemit.
        </p>
        <button className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition">
          Na Kontaktoni
        </button>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
