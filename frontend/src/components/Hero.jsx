import { Link } from "react-router-dom";

export default function Hero() {
  const videoId = "L1JoUErVauw";

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center">
      {/* Fixed Discount and Offer Strip - Below navbar */}
      <div className="fixed top-16 left-0 w-full bg-gradient-to-r from-blue-900/90 to-black/90 py-2 z-30 overflow-hidden shadow-lg">
        <div className="flex w-max animate-marquee">
          {/* Offer 1 */}
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2 animate-pulse">⏱️</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 font-semibold">
              Summer Sale: 30% OFF
            </span>
            <span className="ml-2 text-yellow-300 text-sm animate-bounce">🔥</span>
          </div>
          
          {/* Offer 2 */}
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2">🚚</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-500 font-semibold">
              Free Shipping on $500+
            </span>
            <span className="ml-2 text-green-300 text-sm">✨</span>
          </div>
          
          {/* Offer 3 */}
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2">🆕</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-500 font-semibold">
              New Collection: Exclusive
            </span>
            <span className="ml-2 text-purple-300 text-sm animate-pulse">💎</span>
          </div>
          
          {/* Offer 4 */}
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2">⏳</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-pink-500 font-semibold">
              Limited Edition: 20% OFF
            </span>
            <span className="ml-2 text-red-300 text-sm">⏰</span>
          </div>
          
          {/* Duplicate for seamless loop */}
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2 animate-pulse">⏱️</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 font-semibold">
              Summer Sale: 30% OFF
            </span>
            <span className="ml-2 text-yellow-300 text-sm animate-bounce">🔥</span>
          </div>
          
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2">🚚</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-500 font-semibold">
              Free Shipping on $500+
            </span>
            <span className="ml-2 text-green-300 text-sm">✨</span>
          </div>
          
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2">🆕</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-500 font-semibold">
              New Collection: Exclusive
            </span>
            <span className="ml-2 text-purple-300 text-sm animate-pulse">💎</span>
          </div>
          
          <div className="flex items-center mx-6 group">
            <span className="text-xl mr-2">⏳</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-pink-500 font-semibold">
              Limited Edition: 20% OFF
            </span>
            <span className="ml-2 text-red-300 text-sm">⏰</span>
          </div>
        </div>
      </div>

      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0`}
          className="w-full h-full object-cover brightness-90"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Video"
        ></iframe>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-6 pt-16">
        {/* Heading with glow + animated underline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg relative inline-block group">
          <span className="relative z-10">Timeless Luxury</span>
          {/* Soft blue halo glow */}
          <span className="absolute inset-0 blur-lg text-blue-400 opacity-30 select-none">
            Timeless Luxury
          </span>
          {/* Underline */}
          <span className="block h-[3px] bg-gradient-to-r from-blue-400 to-blue-600 absolute left-1/2 -translate-x-1/2 bottom-[-14px] w-0 animate-underline group-hover:w-full"></span>
        </h1>

        <p className="text-lg text-gray-200 drop-shadow-md mt-8">
          Explore our handpicked collection of iconic watches that define elegance.
        </p>

        {/* Button with pulsing blue glow */}
        <Link
          to="/products"
          className="mt-6 inline-block px-8 py-3 bg-white text-black font-bold rounded-lg shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-[0 0 25px 6px_rgba(59,130,246,0.8)] hover:bg-blue-200 animate-glow-blue"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}