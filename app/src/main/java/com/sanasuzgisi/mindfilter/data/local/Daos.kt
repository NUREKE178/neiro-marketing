package com.sanasuzgisi.mindfilter.data.local

import androidx.room.*
import com.sanasuzgisi.mindfilter.data.model.DailyStat
import com.sanasuzgisi.mindfilter.data.model.ExperimentResult
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyStatDao {
    @Query("SELECT * FROM daily_stats ORDER BY dateMillis DESC")
    fun getAllStats(): Flow<List<DailyStat>>

    @Query("SELECT * FROM daily_stats WHERE dateString = :date LIMIT 1")
    suspend fun getByDate(date: String): DailyStat?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(stat: DailyStat)

    @Delete
    suspend fun delete(stat: DailyStat)

    @Query("DELETE FROM daily_stats")
    suspend fun clearAll()
}

@Dao
interface ExperimentDao {
    @Query("SELECT * FROM experiment_results ORDER BY id DESC")
    fun getAll(): Flow<List<ExperimentResult>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(result: ExperimentResult)

    @Delete
    suspend fun delete(result: ExperimentResult)

    @Query("DELETE FROM experiment_results")
    suspend fun clearAll()
}
