package com.socialpulse.android.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "overview_cache")
data class OverviewCacheEntity(
    @PrimaryKey val id: String = "overview",
    val json: String,
    val lastSynced: Long,
    val isEmpty: Boolean
)

@Entity(tableName = "connected_accounts")
data class ConnectedAccountEntity(
    @PrimaryKey val id: String,
    val username: String,
    val platform: String,
    val avatarUrl: String?,
    val status: String,
    val lastSyncedAt: Long?
)

@Entity(tableName = "media_cache")
data class MediaCacheEntity(
    @PrimaryKey val id: String,
    val platform: String,
    val externalId: String,
    val caption: String?,
    val postedAt: Long?,
    val thumbnailUrl: String?
)
