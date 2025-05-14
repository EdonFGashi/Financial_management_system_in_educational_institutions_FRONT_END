import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ThreeHeroVisual from "../components/ThreeHeroVisual";
import { BuildingLibraryIcon, AcademicCapIcon, BuildingOffice2Icon, DocumentCheckIcon, PencilSquareIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

import AOS from "aos";
import "aos/dist/aos.css";
import "../App.css";

const messages = [
  "Mirësevini!",
  "Digjitalizoni financat.",
  "Thjeshtë, shpejtë dhe sigurtë.",
];

function Home() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const fullSubtext = "Menaxhoni financat e institucioneve arsimore në mënyrë efikase!";

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;
    let isDeleting = false;

    const type = () => {
      setIsTyping(true);
      
      if (!isDeleting && currentIndex <= fullSubtext.length) {
        setDisplayText(fullSubtext.slice(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(type, 50);
      } else if (!isDeleting && currentIndex > fullSubtext.length) {
        isDeleting = true;
        timeoutId = setTimeout(type, 2000); // Pause at the end
      } else if (isDeleting && currentIndex > 0) {
        currentIndex--;
        setDisplayText(fullSubtext.slice(0, currentIndex));
        timeoutId = setTimeout(type, 30);
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        timeoutId = setTimeout(type, 1000); // Pause before restarting
      }
    };

    type();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] bg-gradient-to-r from-indigo-700 to-blue-600 overflow-hidden flex flex-col-reverse md:flex-row items-center justify-center gap-8 px-6 md:px-20 pt-12 md:pt-0">
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

          <p className="text-white/80 text-xl sm:text-2xl mt-4 font-medium">
            {displayText}
            <span className="inline-block w-2 ml-1">
              {isTyping ? "|" : ""}
            </span>
          </p>
        </div>

        {/* 3D Visual Right */}
        <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
          <ThreeHeroVisual />
        </div>
      </section>      {/* Animated Roles Showcase Section */}
      <section className="relative w-full bg-white overflow-hidden py-24" id="roles-showcase">
        <div className="max-w-7xl mx-auto px-4">          {[{            title: "Projektet e Komunës",
            desc: "Komuna mund të menaxhojë buxhetin, të aprovojë kërkesa, të monitorojë shpenzimet dhe të realizojë pagesa në mënyrë të centralizuar dhe transparente.",
            bg: "from-indigo-600 to-blue-500",
            Icon: BuildingLibraryIcon,
            SecondaryIcon: DocumentCheckIcon,
            animation: "writing",
          }, {
            title: "Menaxhimi i Shkollës",
            desc: "Shkollat mund të kërkojnë inventar, të raportojnë orët, të menaxhojnë blerjet dhe të ndjekin historikun e shpenzimeve në një platformë të vetme.",
            bg: "from-green-500 to-emerald-400",
            Icon: AcademicCapIcon,
            SecondaryIcon: PencilSquareIcon,
            animation: "teaching",
          }, {
            title: "Shitjet e Kompanisë",
            desc: "Kompanitë mund të ofrojnë produkte, të gjenerojnë fatura dhe të bashkëpunojnë për pagesa të sigurta dhe të shpejta me institucionet publike.",
            bg: "from-red-600 to-rose-500",
            Icon: BuildingOffice2Icon,
            SecondaryIcon: ShoppingCartIcon,
            animation: "selling",
          }].map((role, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className={`w-full min-h-[60vh] flex flex-col md:flex-row items-center justify-between bg-gradient-to-br ${role.bg} rounded-3xl shadow-2xl mb-12 p-12 relative overflow-hidden`}
            >              <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
                <div className="relative w-32 h-32 mb-8">
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.2 }}
                  >
                    <role.Icon className="w-full h-full text-white" />
                  </motion.div>
                    {/* Custom animations for each role */}
                  {role.animation === "writing" && (
                    <>
                      <motion.div
                        className="absolute -right-4 -bottom-4"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ 
                          x: [-20, 20, -20],
                          y: [0, -10, 0],
                          rotate: [0, 5, 0, -5, 0],
                          opacity: 1
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <role.SecondaryIcon className="w-12 h-12 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        initial={{ boxShadow: "0 0 0 0 rgba(255,255,255,0)" }}
                        animate={{ 
                          boxShadow: [
                            "0 0 0 0 rgba(255,255,255,0)",
                            "0 0 0 10px rgba(255,255,255,0.1)",
                            "0 0 0 20px rgba(255,255,255,0)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </>
                  )}
                  
                  {role.animation === "teaching" && (
                    <>
                      <motion.div
                        className="absolute -right-4 -bottom-4"
                        initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1],
                          rotate: [0, 15, -15, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <role.SecondaryIcon className="w-12 h-12 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="absolute -left-2 top-0 w-full h-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: [0, 0.5, 0],
                          scale: [0.8, 1.2, 0.8],
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <AcademicCapIcon className="w-8 h-8 text-white/30" />
                      </motion.div>
                    </>
                  )}
                  
                  {role.animation === "selling" && (
                    <>
                      <motion.div
                        className="absolute -right-4 -bottom-4"
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ 
                          y: [-10, 0, -10],
                          x: [0, 10, 0, -10, 0],
                          rotate: [0, 10, 0, -10, 0],
                          opacity: 1
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <role.SecondaryIcon className="w-12 h-12 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 border-2 border-white/20 rounded-full"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.2, 0.5, 0.2],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </>
                  )}
                </div>
                
                <motion.h2
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 + 0.3 }}
                  className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg"
                >
                  {role.title}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 + 0.4 }}
                  className="text-xl md:text-2xl text-white/90 leading-relaxed"
                >
                  {role.desc}
                </motion.p>
              </div>
            </motion.div>
          ))}
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
