package com.sanasuzgisi.mindfilter.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.sanasuzgisi.mindfilter.data.model.DailyStat
import com.sanasuzgisi.mindfilter.data.model.ExperimentResult

@Database(
    entities = [DailyStat::class, ExperimentResult::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun dailyStatDao(): DailyStatDao
    abstract fun experimentDao(): ExperimentDao
}
