package com.sanasuzgisi.mindfilter.data.repository

import com.sanasuzgisi.mindfilter.data.local.DailyStatDao
import com.sanasuzgisi.mindfilter.data.local.ExperimentDao
import com.sanasuzgisi.mindfilter.data.model.DailyStat
import com.sanasuzgisi.mindfilter.data.model.ExperimentResult
import kotlinx.coroutines.flow.Flow

class StatsRepository(private val dao: DailyStatDao) {
    val allStats: Flow<List<DailyStat>> = dao.getAllStats()

    suspend fun insert(stat: DailyStat) = dao.insert(stat)
    suspend fun delete(stat: DailyStat) = dao.delete(stat)
    suspend fun getByDate(date: String) = dao.getByDate(date)
    suspend fun clearAll() = dao.clearAll()
}

class ExperimentRepository(private val dao: ExperimentDao) {
    val allResults: Flow<List<ExperimentResult>> = dao.getAll()
    suspend fun insert(result: ExperimentResult) = dao.insert(result)
    suspend fun delete(result: ExperimentResult) = dao.delete(result)
    suspend fun clearAll() = dao.clearAll()
}
