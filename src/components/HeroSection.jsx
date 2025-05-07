"use client"

import { useState, useEffect } from 'react';

const HeroSection = ({ openTopUpModal, scrollToFeaturedGames }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const backgroundImages = [
    '/images/hero-bg.jpg',
    '/images/hero2-bg.jpg',
    '/images/hero3-bg.jpg',
    '/images/hero4-bg.jpg'
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Just update the slide index without slide direction for auto-transition (fade effect)
      setCurrentSlide((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
    }, 10000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  
  const [slideDirection, setSlideDirection] = useState(null);
  
  const goToPrevSlide = () => {
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev === 0 ? backgroundImages.length - 1 : prev - 1));
    
    // Reset direction after animation completes
    setTimeout(() => {
      setSlideDirection(null);
    }, 700);
  };
  
  const goToNextSlide = () => {
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
    
    // Reset direction after animation completes
    setTimeout(() => {
      setSlideDirection(null);
    }, 700);
  };
  
  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      
      <section id="default-carousel" className="relative h-[600px]">
        {/* Carousel wrapper */}
        {backgroundImages.map((bgImage, index) => (
          <div 
            key={index}
            className={`absolute inset-0 flex h-full w-full items-center justify-center bg-cover bg-center p-5 text-center text-white transition-all duration-700 ease-in-out ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            } ${
              slideDirection === 'left' && currentSlide === index ? 'translate-x-0' : 
              slideDirection === 'left' && (currentSlide === index - 1 || (currentSlide === backgroundImages.length - 1 && index === 0)) ? 'translate-x-full' :
              slideDirection === 'right' && currentSlide === index ? 'translate-x-0' :
              slideDirection === 'right' && (currentSlide === index + 1 || (currentSlide === 0 && index === backgroundImages.length - 1)) ? '-translate-x-full' : ''
            }`}
            style={{ 
              backgroundImage: `url(${bgImage})`,
            }}
          >
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="relative z-10 max-w-4xl" style={{ fontFamily: '"Noto Sans Khmer", sans-serif' }}>
              <h1 className="mb-8 text-5xl font-bold leading-relaxed shadow-text">
                បញ្ចូលទឹកប្រាក់ក្នុងហ្គេមរបស់អ្នកភ្លាមៗ
              </h1>
              <p className="mb-8 text-xl">
                សេវាកម្មបញ្ចូលទឹកប្រាក់ហ្គេមលឿន សុវត្ថិភាព និងតម្លៃសមរម្យជាងគេក្នុងប្រទេសកម្ពុជា
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                <button
                  onClick={() => openTopUpModal()}
                  className="cursor-pointer rounded-full bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] border-0 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-[#4cc9f0]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4cc9f0]/40"
                >
                  បញ្ចូលទឹកប្រាក់
                </button>
                <button
                  onClick={scrollToFeaturedGames}
                  className="cursor-pointer rounded-full border-2 border-white bg-transparent px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  មើលប្រូម៉ូសិន
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Removed slider indicators as requested */}
        
        {/* Slider controls */}
        <button 
          type="button" 
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" 
          onClick={goToPrevSlide}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
            <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>
        <button 
          type="button" 
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" 
          onClick={goToNextSlide}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
            <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
        
        <style jsx>{`
          .shadow-text {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
        `}</style>
      </section>
    </>
  );
};

export default HeroSection;