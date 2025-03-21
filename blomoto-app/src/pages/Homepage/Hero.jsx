import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import slide1 from '../../assets/1.png'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    title: "De la qualité! BLOMOTO",
    description: "Avec BLOMOTO, l’exigence devient la norme, et la qualité, une promesse tenue.",
    image: slide1,
    buttonText: "Découvrir nos services"
  },
  {
    title: "Avec BLOMOTO votre mécanicien est trouvé",
    description: "Fini le stress des pannes imprévues ! Avec BLOMOTO, trouvez rapidement un mécanicien de confiance, où que vous soyez.",
    image: "https://i0.wp.com/valorisation-commerce.com/wp-content/uploads/2021/02/garage.jpg?fit=1920%2C1280&ssl=1",
    buttonText: "En savoir plus"
  },
  {
    title: "Prennez votre rendez-vous avec BLOMOTO",
    description: "Besoin d’un entretien ou d’une réparation ? Avec BLOMOTO, réservez votre rendez-vous en quelques clics et trouvez un mécanicien qualifié près de chez vous",
    image: "https://www.ads77.fr/ressources/images/68ceb099ded9.jpg",
    buttonText: "Commencer maintenant"
  }
];

function Hero() {
  const navigate = useNavigate();

  return (
      <section className="relative h-[600px] md:h-[700px] w-full overflow-hidden">
        <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            speed={1000}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="h-full w-full"
        >
          {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-full w-full">
                  {/* Background Image with Overlay */}
                  <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${slide.image})`,
                      }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-50" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                          {slide.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-delay">
                          {slide.description}
                        </p>
                        <button
                            onClick={() => navigate('/service-list')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 transform hover:scale-105 animate-fade-in-delay-2"
                        >
                          {slide.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom styles for Swiper */}
        <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
        }

        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }

        .swiper-pagination-bullet-active {
          opacity: 1;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
      </section>
  );
}

export default Hero;