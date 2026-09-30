"use client"
import { create } from 'zustand'

interface SearchState {
  query: string
  platform: 'all' | 'instagram' | 'tiktok'
  region: string
  searchType: 'account' | 'video' | 'niche'
  setQuery: (q: string) => void
  setPlatform: (p: 'all' | 'instagram' | 'tiktok') => void
  setRegion: (r: string) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  platform: 'all',
  region: 'Алматы',
  searchType: 'niche',
  setQuery: (query) => set({ query }),
  setPlatform: (platform) => set({ platform }),
  setRegion: (region) => set({ region }),
}))
