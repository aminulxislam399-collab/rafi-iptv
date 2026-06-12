import { useState } from "react";
import { Play, Heart, Globe, BadgeAlert } from "lucide-react";
import { Channel } from "../types";

interface ChannelCardProps {
  key?: string | number;
  channel: Channel;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

export default function ChannelCard({
  channel,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
}: ChannelCardProps) {
  const [imgError, setImgError] = useState(false);

  // Derive monogram/initials for broken logos to look beautiful
  const getInitials = (name: string) => {
    return name
      .replace(/[\(\[].*?[\)\]]/g, "") // remove parentheticals
      .split(/[\s-]+/)
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  // Generate deterministic gradient based on name hash for broken logos
  const getGradientClass = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-blue-600 to-indigo-700 shadow-blue-500/10",
      "from-purple-600 to-pink-700 shadow-purple-500/10",
      "from-emerald-600 to-teal-700 shadow-emerald-500/10",
      "from-rose-600 to-orange-700 shadow-rose-500/10",
      "from-indigo-600 to-cyan-705 shadow-indigo-500/10",
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div
      onClick={() => onPlay(channel)}
      className={`group relative flex flex-col justify-between bg-slate-900/50 hover:bg-slate-800/80 border rounded-2xl p-4 transition-all duration-300 backdrop-blur-md cursor-pointer select-none ${
        isPlaying
          ? "border-blue-500/80 shadow-lg shadow-blue-500/10 bg-slate-800/60"
          : "border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-slate-950/40 hover:-translate-y-1"
      }`}
      id={`channel-card-${channel.id}`}
    >
      {/* Top Details Header */}
      <div className="flex gap-4 items-start w-full">
        {/* Logo Frame */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-contain p-1.5 transition-transform duration-500"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full flex flex-col items-center justify-center text-white font-black text-lg bg-gradient-to-br ${getGradientClass(
                channel.name
              )}`}
            >
              <span className="tracking-tight">{getInitials(channel.name)}</span>
            </div>
          )}

          {/* Glowing dot for Live */}
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        </div>

        {/* Name and Categories */}
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-950 text-slate-400 font-mono tracking-tight px-2 py-0.5 rounded-full border border-slate-800">
            {channel.category}
          </span>
          <h4
            className={`text-sm font-bold tracking-tight mt-1 px-0.5 truncate leading-snug transition-colors ${
              isPlaying ? "text-blue-400" : "text-slate-100 group-hover:text-blue-400"
            }`}
            title={channel.name}
          >
            {channel.name}
          </h4>
          <p className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-0.5 font-mono">
            <Globe className="w-3 h-3 text-slate-500" />
            <span>Country: {channel.country || "GLOBAL"}</span>
          </p>
        </div>
      </div>

      {/* Footer / Meta Controls Row */}
      <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-3">
        {/* Live Active Stream Flag */}
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase font-semibold">
            SECURE SOURCE
          </span>
        </div>

        {/* Favorite & Quick Play buttons */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleFavorite(channel.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFavorite
                ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title={isFavorite ? "Remove from Favorites" : "Pin to Favorites"}
            id={`fav-btn-${channel.id}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
          </button>
          <button
            onClick={() => onPlay(channel)}
            className={`p-1.5 rounded-lg border transition-all ${
              isPlaying
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white"
            }`}
            title="Tuning Stream"
            id={`play-btn-${channel.id}`}
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? "fill-white" : "fill-current"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
