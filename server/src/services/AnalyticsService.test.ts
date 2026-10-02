import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAccountStats } from "./AnalyticsService.js";

test("sums known values and ignores nulls (does not treat null as 0)", () => {
  const stats = computeAccountStats([
    { views: 100, likes: 10, comments: 1 },
    { views: null, likes: 5, comments: null }, // provider didn't report views/comments for this one
    { views: 200, likes: null, comments: 3 },
  ]);

  assert.equal(stats.totalViews, 300, "sums only the two videos that reported views");
  assert.equal(stats.totalLikes, 15);
  assert.equal(stats.totalComments, 4);
  assert.equal(stats.videoCount, 3);
  assert.equal(stats.videosWithViews, 2, "only 2 of 3 videos had a views figure");
  assert.equal(stats.avgViews, 150, "average is over the known values, not videoCount");
});

test("returns null (not 0) when no video reported a metric at all", () => {
  const stats = computeAccountStats([
    { views: null, likes: null, comments: null },
    { views: null, likes: null, comments: null },
  ]);

  assert.equal(stats.totalViews, null);
  assert.equal(stats.totalLikes, null);
  assert.equal(stats.avgViews, null);
  assert.equal(stats.engagementRate, null);
});

test("engagementRate is null when views is unknown, even if likes/comments are known", () => {
  const stats = computeAccountStats([{ views: null, likes: 50, comments: 5 }]);
  assert.equal(stats.engagementRate, null);
});

test("a video that explicitly reports 0 views is counted as known, not excluded", () => {
  const stats = computeAccountStats([{ views: 0, likes: 0, comments: 0 }]);
  assert.equal(stats.totalViews, 0);
  assert.equal(stats.videosWithViews, 1);
});

test("empty video list", () => {
  const stats = computeAccountStats([]);
  assert.equal(stats.totalViews, null);
  assert.equal(stats.videoCount, 0);
  assert.equal(stats.videosWithViews, 0);
});
