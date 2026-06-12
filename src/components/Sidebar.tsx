import { 
  Tv, 
  Trophy, 
  Film, 
  Newspaper, 
  Baby, 
  Music as MusicIcon, 
  Heart, 
  History, 
  Flame, 
  X, 
  Home, 
  Clock, 
  Menu 
} from "lucide-react";
import { Channel } from "../types";

interface SidebarProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  channels: Channel[];
  favorites: string[];
  historyCount: number;
  isOpen: boolean; // For mobile slideout
  onClose: () => void;
}

export default function Sidebar({
  currentFilter,
  onFilterChange,
  channels,
  favorites,
  historyCount,
  isOpen,
  onClose,
}: SidebarProps) {
  // Compute counts dynamically
  const getCategoryCount = (category: string) => {
    if (category === "all") return channels.length;
    if (category === "favorites") return favorites.length;
    if (category === "history") return historyCount;
    return channels.filter((ch) => ch.category === category).length;
  };

  const navItems = [
    { id: "all", label: "All Channels", icon: Home },
    { id: "Sports", label: "Sports Live", icon: Trophy, color: "text-amber-400" },
    { id: "Movies", label: "Movies & Cinema", icon: Film, color: "text-purple-400" },
    { id: "News", label: "Breaking News", icon: Newspaper, color: "text-rose-400" },
    { id: "Kids", label: "Children & Kids", icon: Baby, color: "text-sky-400" },
    { id: "Music", label: "Music & Beats", icon: MusicIcon, color: "text-emerald-400" },
    { id: "favorites", label: "Favorites Feed", icon: Heart, color: "text-red-500" },
    { id: "history", label: "Recently Watched", icon: History, color: "text-teal-400" },
  ];

  const handleItemClick = (filterId: string) => {
    onFilterChange(filterId);
    onClose(); // close mobile sidebar if clicked
  };

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-50 transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="side-nav-bar"
      >
        {/* Header Branding */}
        <div className="p-6 border-b border-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-white font-sans bg-clip-text">
                Rafi <span className="text-blue-500">- IPTV</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                Ultra Premium Live
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            id="mobile-nav-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories / Nav List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Live Categories & Feeds
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const count = getCategoryCount(item.id);
            const isActive = currentFilter === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left border transition-all duration-200 group/item ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/15 to-indigo-600/5 border-blue-500/30 text-blue-400 font-semibold"
                    : "bg-transparent border-transparent text-slate-400 hover:bg-slate-850 hover:text-slate-200 hover:border-slate-800"
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-500" : item.color || "text-slate-500"} transition-colors`} />
                  <span className="text-xs tracking-tight font-sans text-slate-200/90 group-hover/item:text-white">
                    {item.label}
                  </span>
                </div>
                
                {/* Dynamically computed statistics tag badges */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  isActive 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "bg-slate-950 text-slate-500 group-hover/item:text-slate-350 border border-slate-900"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info box inside sidebar */}
        <div className="p-6 border-t border-slate-950 bg-slate-950/40">
          <div className="flex items-center gap-3 p-3 bg-slate-950/90 rounded-xl border border-slate-850">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <div>
              <p className="text-[10px] text-slate-300 font-bold font-mono tracking-tight flex items-center gap-1">
                STABLE CONNECTION
              </p>
              <p className="text-[9px] text-slate-500 font-medium">BDIX Optimized Player</p>
            </div>
          </div>
          <p className="text-[9.5px] text-center mt-3 text-slate-600 font-sans tracking-tight">
            Vite Engine • HLS Codec Live
          </p>
        </div>
      </aside>
    </>
  );
}
