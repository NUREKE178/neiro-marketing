package com.socialpulse.android.data.api

import retrofit2.http.*
import retrofit2.Response

// Production API models matching /api/overview
data class OverviewResponse(
    val isDemo: Boolean,
    val isEmpty: Boolean? = null,
    val connectedAccount: ConnectedAccountDto? = null,
    val stats: StatsDto,
    val lastSynced: String? = null,
    val lastSyncedMinutesAgo: Int? = null,
    val tokenStatus: String,
    val expiredAccounts: List<String>? = null,
    val syncing: Boolean? = null
)

data class ConnectedAccountDto(
    val id: String,
    val username: String,
    val displayName: String? = null,
    val platform: String,
    val avatarUrl: String? = null,
    val status: String,
    val lastSyncedAt: String? = null
)

data class StatsDto(
    val trackedAccounts: TrackedAccountsStat,
    val videosAnalyzed: VideosStat,
    val saved: SavedStat,
    val reports: ReportsStat
)

data class TrackedAccountsStat(
    val count: Int,
    val connected: Int,
    val tracked: Int,
    val delta: Double? = null,
    val deltaTooltip: String? = null
)

data class VideosStat(val count: Int, val last7Days: Int)
data class SavedStat(val count: Int, val accounts: Int)
data class ReportsStat(val count: Int, val ready: Int)

data class SyncRequest(
    val userId: String? = null,
    val accountId: String? = null,
    val type: String = "METRICS"
)

data class SyncResponse(val synced: Int, val results: List<SyncResultDto>)
data class SyncResultDto(val accountId: String, val success: Boolean, val itemsSynced: Int? = null, val error: String? = null, val skipped: Boolean? = null)

interface ApiService {
    @GET("api/overview")
    suspend fun getOverview(@Query("userId") userId: String? = null): Response<OverviewResponse>

    @POST("api/sync")
    suspend fun triggerSync(@Body request: SyncRequest): Response<SyncResponse>

    @GET("api/sync")
    suspend fun getSyncJobs(): Response<Map<String, Any>>
}
