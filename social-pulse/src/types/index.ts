export type Platform = 'instagram' | 'tiktok' | 'all'
export type SearchType = 'account' | 'video' | 'niche'
export type Region = 'all' | 'kazakhstan' | 'almaty' | 'astana' | 'shymkent' | 'karagandy' | 'other'

export interface Account {
  id: string
  username: string
  displayName: string
  platform: Platform
  avatar: string
  bio?: string
  followers: number
  following?: number
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  avgViews: number
  avgLikes: number
  engagementRate: number
  lastPostDate: string
  isVerified?: boolean
  region?: Region
  regionVerified: boolean
  source: string
  lastUpdated: string
  isDemo: boolean
}

export interface Video {
  id: string
  accountId: string
  platform: Platform
  thumbnail: string
  title: string
  caption: string
  url: string
  publishedAt: string
  views: number
  likes: number
  comments: number
  shares?: number
  engagementRate: number
  hashtags: string[]
  contentType: string
  isDemo: boolean
}

export interface TrendData {
  niche: string
  accounts: Account[]
  topVideos: Video[]
  hashtags: { tag: string; count: number }[]
  commonWords: { word: string; count: number }[]
  postingFrequency: { date: string; count: number }[]
  viewsByVideo: { name: string; views: number }[]
}

export interface KPI {
  label: string
  value: number | string
  change?: number
  changeLabel?: string
  tooltip: string
  isAvailable: boolean
}

export interface AIAnalysis {
  realData: string[]
  calculated: string[]
  interpretation: string[]
}

export interface SearchResult {
  type: SearchType
  platform: Platform
  query: string
  region: Region
  accounts: Account[]
  videos: Video[]
  totalFound: number
}
