import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function formatPercent(current: number, previous: number): string {
  if (previous === 0) return '+0%'
  const change = ((current - previous) / previous) * 100
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

export function calculateEngagementRate(likes: number, comments: number, shares: number = 0, views: number): number {
  if (views === 0) return 0
  return ((likes + comments + shares) / views) * 100
}

export function calculateAccountEngagement(likes: number, comments: number, followers: number): number {
  if (followers === 0) return 0
  return ((likes + comments) / followers) * 100
}

export function detectPlatform(input: string): 'instagram' | 'tiktok' | 'unknown' {
  const lower = input.toLowerCase()
  if (lower.includes('instagram.com') || lower.startsWith('@') && !lower.includes('tiktok')) {
    // heuristic: if contains instagram or @ without tiktok
    if (lower.includes('tiktok')) return 'tiktok'
    return 'instagram'
  }
  if (lower.includes('tiktok.com') || lower.includes('tiktok')) return 'tiktok'
  return 'unknown'
}

export function detectSearchType(input: string): 'account' | 'video' | 'niche' {
  const trimmed = input.trim()
  if (trimmed.startsWith('http') && (trimmed.includes('/p/') || trimmed.includes('/reel/') || trimmed.includes('/video/'))) {
    return 'video'
  }
  if (trimmed.startsWith('@') || trimmed.includes('instagram.com/') || trimmed.includes('tiktok.com/@')) {
    return 'account'
  }
  return 'niche'
}

export function getDemoBadge() {
  return 'DEMO DATA — нақты аккаунт статистикасы емес'
}
