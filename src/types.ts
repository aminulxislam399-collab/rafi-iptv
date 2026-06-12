export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  country: string;
  isLive: boolean;
  groupTitle: string;
}

export interface PlaybackHistory {
  channelId: string;
  timestamp: number;
}
