"use client"

// No need to import the font, we'll use CSS classes instead

const HeroSection = ({ openTopUpModal, scrollToFeaturedGames }) => {
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
  return (
    <>
      
      <section className="relative flex h-[600px] items-center justify-center bg-[url('/images/hero-bg.jpg')] bg-cover bg-center p-5 text-center text-white before:absolute before:inset-0 before:bg-black/70">
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