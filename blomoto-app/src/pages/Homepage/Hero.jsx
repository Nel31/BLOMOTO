import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    title: "Transformez votre entreprise avec la technologie",
    description: "Solutions innovantes pour accélérer votre croissance et optimiser vos processus d'affaires.",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=2070&q=80",
    buttonText: "Découvrir nos services"
  },
  {
    title: "Des solutions sur mesure pour votre succès",
    description: "Expertise technique et accompagnement personnalisé pour répondre à vos besoins spécifiques.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2070&q=80",
    buttonText: "En savoir plus"
  },
  {
    title: "Innovation et performance au cœur de nos services",
    description: "Technologies de pointe et méthodologies agiles pour des résultats concrets.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2070&q=80",
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
                            onClick={() => navigate('/services')}
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