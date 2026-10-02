package com.socialpulse.android.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.Dao
import androidx.room.Query
import androidx.room.Insert
import androidx.room.OnConflictStrategy

@Dao
interface OverviewDao {
    @Query("SELECT * FROM overview_cache WHERE id = 'overview'")
    suspend fun getOverview(): OverviewCacheEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveOverview(entity: OverviewCacheEntity)

    @Query("DELETE FROM overview_cache")
    suspend fun clear()
}

@Dao
interface ConnectedAccountDao {
    @Query("SELECT * FROM connected_accounts")
    suspend fun getAll(): List<ConnectedAccountEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(accounts: List<ConnectedAccountEntity>)

    @Query("DELETE FROM connected_accounts")
    suspend fun clear()
}

@Database(
    entities = [OverviewCacheEntity::class, ConnectedAccountEntity::class, MediaCacheEntity::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun overviewDao(): OverviewDao
    abstract fun connectedAccountDao(): ConnectedAccountDao
}
