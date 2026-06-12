import { useEffect, useState } from "react";
import { Play, Flame, Tv, Calendar, Star } from "lucide-react";
import { Channel } from "../types";

interface BannerSliderProps {
  channels: Channel[];
  onPlayChannel: (channel: Channel) => void;
}

export default function BannerSlider({ channels, onPlayChannel }: BannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "ICC T20 Cricket & Football Live",
      tagline: "SPORTS EVENT DIRECT",
      description: "Experience zero-lag, ultra high definition premium sports streaming. Tune in to cricket matches, Premier League football tournaments, and local athletic feeds natively optimized.",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&h=500&q=85",
      badge: "LIVE HD SPORTS",
      categoryKeyword: "Sports"
    },
    {
      title: "Blockbuster Action Cinema",
      tagline: "PREMIUM HOLLYWOOD FEED",
      description: "Non-stop action, romantic dramas, and classical thriller movies compiled into 24/7 curated multiplex networks. Sit back and watch high bitrate cinema broadcasts.",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&h=500&q=85",
      badge: "24/7 CINEMA MOVIES",
      categoryKeyword: "Movies"
    },
    {
      title: "24/7 Breaking News Coverage",
      tagline: "GLOBAL NEWS NETWORKS",
      description: "Fast-breaking news, investigative reporting, economic analysis, and talk-shows directly aggregated from lead local and world channels such as Somoy TV, DW, and Al Jazeera.",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=500&q=85",
      badge: "STREAM NEWS REEL",
      categoryKeyword: "News"
    }
  ];

  // Auto-play slides every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleWatchNow = (categoryKeyword: string) => {
    // Find the first channel in the playlist matching that category to play instantly
    const target = channels.find(ch => ch.category.toLowerCase() === categoryKeyword.toLowerCase()) 
      || channels[0];
    if (target) {
      onPlayChannel(target);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[340px] md:h-[400px]">
      {slides.map((slide, index) => {
        const isCurrent = index === activeIndex;

        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 flex items-center ${
              isCurrent 
                ? "opacity-100 scale-100 z-10" 
                : "opacity-0 scale-105 pointer-events-none -z-10"
            }`}
          >
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Dark glass backdrop overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />

            {/* Slider Content */}
            <div className="relative p-8 md:p-14 max-w-xl z-20 flex flex-col justify-center">
              <span className="flex items-center gap-2 text-rose-500 font-mono text-xs font-bold tracking-widest uppercase mb-3">
                <Flame className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                <span>{slide.tagline}</span>
              </span>

              <h2 className="text-2xl md:text-4xl font-extrabold text-blue-50 text-wrap leading-tight tracking-tight font-sans">
                {slide.title}
              </h2>

              <p className="text-slate-350 text-xs md:text-sm mt-3 leading-relaxed hidden sm:block">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-4 mt-6 items-center">
                <button
                  onClick={() => handleWatchNow(slide.categoryKeyword)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition duration-300 transform hover:scale-[1.03] shadow-lg shadow-blue-500/20 shadow-indigo-500/10 cursor-pointer"
                  id={`featured-watch-${index}`}
                >
                  <Play className="w-4 h-4 fill-current" /> Watch Now
                </button>

                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 text-blue-400 font-mono text-[10px] uppercase font-bold px-3 py-2 rounded-xl backdrop-blur-sm shadow-md">
                  <Tv className="w-3.5 h-3.5" />
                  <span>{slide.badge}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Manual Dots Nav in bottom right */}
      <div className="absolute bottom-6 right-8 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-8 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-500"
            }`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
