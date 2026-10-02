/** The only shape AnalyticsService actually needs — satisfied by both NormalizedVideo and the DB's VideoRecord. */
export interface VideoMetrics {
  views: number | null;
  likes: number | null;
  comments: number | null;
}

export interface AccountStats {
  totalViews: number | null;
  totalLikes: number | null;
  totalComments: number | null;
  avgViews: number | null;
  /** (likes+comments)/views, as a percentage string with 2 decimals, or null if views is unknown/zero. */
  engagementRate: string | null;
  videoCount: number;
  /** How many of the videos actually had a views figure — lets the UI say "12 of 24 videos have view data". */
  videosWithViews: number;
}

/**
 * Sums only the videos that actually reported a value for that metric —
 * null fields are excluded, not treated as 0. Returns null (not 0) when
 * none of the videos reported the metric at all, since "0 across N unknown
 * values" would misrepresent unknown as zero.
 */
function sumKnown(videos: VideoMetrics[], key: "views" | "likes" | "comments"): { sum: number; known: number } {
  let sum = 0;
  let known = 0;
  for (const v of videos) {
    const value = v[key];
    if (value !== null) {
      sum += value;
      known += 1;
    }
  }
  return { sum, known };
}

export function computeAccountStats(videos: VideoMetrics[]): AccountStats {
  const views = sumKnown(videos, "views");
  const likes = sumKnown(videos, "likes");
  const comments = sumKnown(videos, "comments");

  const totalViews = views.known > 0 ? views.sum : null;
  const totalLikes = likes.known > 0 ? likes.sum : null;
  const totalComments = comments.known > 0 ? comments.sum : null;
  const avgViews = views.known > 0 ? Math.round(views.sum / views.known) : null;

  const engagementRate =
    totalViews && totalViews > 0
      ? (((((totalLikes ?? 0) + (totalComments ?? 0)) / totalViews) * 100).toFixed(2))
      : null;

  return {
    totalViews,
    totalLikes,
    totalComments,
    avgViews,
    engagementRate,
    videoCount: videos.length,
    videosWithViews: views.known,
  };
}
