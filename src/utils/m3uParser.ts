import { Channel } from "../types";

/**
 * Parses an M3U playlist string into a list of Channels.
 */
export function parseM3U(m3uText: string): Channel[] {
  const lines = m3uText.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> | null = null;
  let idCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      // Parse #EXTINF line
      currentChannel = {};
      
      // Extract properties using regex
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i) || line.match(/logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i) || line.match(/category="([^"]+)"/i);
      const idMatch = line.match(/tvg-id="([^"]+)"/i);
      const countryMatch = line.match(/tvg-country="([^"]+)"/i) || line.match(/country="([^"]+)"/i);

      // Channel name is usually after the last comma of the #EXTINF line
      const commaIndex = line.lastIndexOf(",");
      let name = "Unknown Channel";
      if (commaIndex !== -1) {
        name = line.substring(commaIndex + 1).trim();
      } else {
        // Fallback name search
        const nameMatch = line.match(/tvg-name="([^"]+)"/i);
        if (nameMatch) {
          name = nameMatch[1];
        }
      }

      const rawGroup = groupMatch ? groupMatch[1] : "";
      
      // Categorize into standard categories requested by sidebar:
      // Sports, Movies, News, Kids, Music, Favorites (Favorites handled client-side), or general Entertainment
      let category = "Entertainment";
      const normalizedGroup = rawGroup.toLowerCase();
      const normalizedName = name.toLowerCase();

      if (
        normalizedGroup.includes("sport") || 
        normalizedGroup.includes("t-sports") || 
        normalizedName.includes("sport") || 
        normalizedName.includes("football") || 
        normalizedName.includes("cricket") ||
        normalizedName.includes("espn") ||
        normalizedName.includes("ten")
      ) {
        category = "Sports";
      } else if (
        normalizedGroup.includes("movie") || 
        normalizedGroup.includes("cinema") || 
        normalizedGroup.includes("film") || 
        normalizedName.includes("movie") || 
        normalizedName.includes("cinema") || 
        normalizedName.includes("hbo")
      ) {
        category = "Movies";
      } else if (
        normalizedGroup.includes("news") || 
        normalizedName.includes("news") || 
        normalizedName.includes("cnn") || 
        normalizedName.includes("bbc") || 
        normalizedName.includes("somoy") || 
        normalizedName.includes("tv24")
      ) {
        category = "News";
      } else if (
        normalizedGroup.includes("kid") || 
        normalizedGroup.includes("child") || 
        normalizedGroup.includes("cartoon") || 
        normalizedName.includes("kid") || 
        normalizedName.includes("cartoon") || 
        normalizedName.includes("disney") || 
        normalizedName.includes("nickelodeon")
      ) {
        category = "Kids";
      } else if (
        normalizedGroup.includes("music") || 
        normalizedGroup.includes("song") || 
        normalizedName.includes("music") || 
        normalizedName.includes("song") || 
        normalizedName.includes("mtv") || 
        normalizedName.includes("gann")
      ) {
        category = "Music";
      } else if (
        normalizedGroup.includes("doc") || 
        normalizedGroup.includes("science") || 
        normalizedGroup.includes("discovery") || 
        normalizedName.includes("discovery") || 
        normalizedName.includes("national geographic") || 
        normalizedName.includes("history")
      ) {
        category = "Documentary";
      } else if (
        normalizedGroup.includes("infotainment") ||
        normalizedGroup.includes("general")
      ) {
        category = "Entertainment";
      } else if (rawGroup) {
        // Capitalize raw group for aesthetic categories if it doesn't match predefined
        category = rawGroup
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      }

      currentChannel.name = name;
      currentChannel.logo = logoMatch ? logoMatch[1] : "";
      currentChannel.groupTitle = rawGroup || "Entertainment";
      currentChannel.category = category;
      currentChannel.country = countryMatch ? countryMatch[1].toUpperCase() : "BD"; // Default BD/Local
      currentChannel.isLive = true;
      currentChannel.id = idMatch ? idMatch[1] : `ch-${idCounter++}-${encodeURIComponent(name.slice(0, 10))}`;
    } else if (line.startsWith("http://") || line.startsWith("https://") || line.includes(".m3u8") || line.includes(".ts") || line.includes(".mpd")) {
      if (currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = null;
      }
    }
  }

  // Deduplicate and filter channel URLs
  const uniqueChannels: Channel[] = [];
  const urlsSeen = new Set<string>();

  for (const ch of channels) {
    if (ch.url && !urlsSeen.has(ch.url)) {
      urlsSeen.add(ch.url);
      uniqueChannels.push(ch);
    }
  }

  return uniqueChannels;
}

/**
 * Returns a small curated selection of high-quality working free-to-air m3u8 streams 
 * as fallback in case the main URL fails to fetch or loads slowly.
 */
export function getBackupStreams(): Channel[] {
  return [
    {
      id: "fallback-somoy",
      name: "Somoy TV (Live News)",
      logo: "https://www.somoynews.tv/assets/images/logo.png",
      url: "https://shstream.yuppcdn.com/shch/somoytv/somoytv_4.m3u8",
      category: "News",
      country: "BD",
      isLive: true,
      groupTitle: "News"
    },
    {
      id: "fallback-tsports",
      name: "T Sports (Live Sports)",
      logo: "https://www.tsports.com/f_assets/web/images/t-sports-logo.png",
      url: "https://tsports-live.akamaized.net/hls/live/2099307/tsports/index.m3u8",
      category: "Sports",
      country: "BD",
      isLive: true,
      groupTitle: "Sports"
    },
    {
      id: "fallback-aljazeera",
      name: "Al Jazeera English (Global News)",
      logo: "https://www.aljazeera.com/assets/images/aj-logo-lg-tok.png",
      url: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8",
      category: "News",
      country: "QA",
      isLive: true,
      groupTitle: "News"
    },
    {
      id: "fallback-classic-cinema",
      name: "Classic Movie Vault",
      logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&fit=crop",
      url: "https://cdn-us.warnermediacdn.com/classic/master.m3u8", // curating standard fallback
      category: "Movies",
      country: "US",
      isLive: true,
      groupTitle: "Movies"
    },
    {
      id: "fallback-dw",
      name: "DW English (Infotainment)",
      logo: "https://www.dw.com/tv-logos/dw_logo_desktop_grey_english.png",
      url: "https://dwamdstream102.akamaized.net/hls/live/2013926/dwstream102/index.m3u8",
      category: "Documentary",
      country: "DE",
      isLive: true,
      groupTitle: "Documentary"
    },
    {
      id: "fallback-redbull",
      name: "Red Bull TV",
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
      url: "https://edge.live.redbull.tv/redbulltv/us/master.m3u8",
      category: "Sports",
      country: "US",
      isLive: true,
      groupTitle: "Sports"
    }
  ];
}
