import { useEffect, useState } from "react";
import { 
  BarChart2, 
  Clock, 
  Heart, 
  Cpu, 
  CheckCircle,
  Wifi
} from "lucide-react";
import { Channel } from "../types";

interface StatsDashboardProps {
  channels: Channel[];
  favoritesCount: number;
}

export default function StatsDashboard({ channels, favoritesCount }: StatsDashboardProps) {
  const [time, setTime] = useState("");

  // Live ticking clock with high performance
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" id="stats-dashboard-bento">
      {/* Total Channels Statistics */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md flex items-center gap-4 group hover:border-slate-700 transition">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform duration-300">
          <BarChart2 className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
            Direct Channels
          </p>
          <p className="text-lg font-extrabold text-white mt-0.5 leading-none font-sans">
            {channels.length || "Loading..."}
          </p>
        </div>
      </div>

      {/* Live Ticking Glowing Clock */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md flex items-center gap-4 group hover:border-slate-700 transition">
        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform duration-300">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
            Network Time
          </p>
          <p className="text-md font-bold text-slate-100 mt-1 leading-none font-mono tracking-tight whitespace-nowrap">
            {time || "00:00:00 PM"}
          </p>
        </div>
      </div>

      {/* Favorites Stream Box */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md flex items-center gap-4 group hover:border-slate-700 transition">
        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/10 text-rose-400 group-hover:scale-105 transition-transform duration-300">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
            Pinned Streams
          </p>
          <p className="text-lg font-extrabold text-white mt-0.5 leading-none font-sans">
            {favoritesCount}
          </p>
        </div>
      </div>

      {/* Stable Bandwidth Link Status (Latency simulation indicator) */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md flex items-center gap-4 group hover:border-slate-700 transition">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
          <Wifi className="w-5 h-5 text-emerald-450 animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
            Bandwidth Status
          </p>
          <p className="text-xs font-bold text-emerald-450 mt-1.5 flex items-center gap-1.5 font-mono">
            <CheckCircle className="w-3.5 h-3.5" /> STABLE (BDIX)
          </p>
        </div>
      </div>
    </div>
  );
}
