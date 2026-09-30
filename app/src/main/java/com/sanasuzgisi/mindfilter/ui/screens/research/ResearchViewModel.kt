package com.sanasuzgisi.mindfilter.ui.screens.research

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.room.Room
import com.sanasuzgisi.mindfilter.data.local.AppDatabase
import com.sanasuzgisi.mindfilter.data.model.ExperimentResult
import com.sanasuzgisi.mindfilter.data.repository.ExperimentRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ResearchViewModel(context: Context) : ViewModel() {
    private val db = com.sanasuzgisi.mindfilter.data.local.DatabaseProvider.getDatabase(context)
    private val repo = ExperimentRepository(db.experimentDao())

    val allResults: StateFlow<List<ExperimentResult>> = repo.allResults
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addResult(code: String, group: String, before: Int, after: Int, impulse: Int, awareness: Int, isSample: Boolean) {
        viewModelScope.launch {
            repo.insert(ExperimentResult(participantCode = code, groupName = group, screenTimeBefore = before, screenTimeAfter = after, impulseBuyingScore = impulse, awarenessScore = awareness, isSampleData = isSample))
        }
    }

    fun addSampleData() {
        viewModelScope.launch {
            val samples = listOf(
                ExperimentResult(participantCode = "P01", groupName = "Бақылау", screenTimeBefore = 210, screenTimeAfter = 200, impulseBuyingScore = 7, awarenessScore = 5, isSampleData = true),
                ExperimentResult(participantCode = "P02", groupName = "Эксперимент", screenTimeBefore = 240, screenTimeAfter = 150, impulseBuyingScore = 4, awarenessScore = 8, isSampleData = true),
                ExperimentResult(participantCode = "P03", groupName = "Эксперимент", screenTimeBefore = 180, screenTimeAfter = 120, impulseBuyingScore = 3, awarenessScore = 9, isSampleData = true),
                ExperimentResult(participantCode = "P04", groupName = "Бақылау", screenTimeBefore = 300, screenTimeAfter = 290, impulseBuyingScore = 8, awarenessScore = 4, isSampleData = true)
            )
            samples.forEach { repo.insert(it) }
        }
    }

    fun delete(r: ExperimentResult) { viewModelScope.launch { repo.delete(r) } }
    fun clearAll() { viewModelScope.launch { repo.clearAll() } }
}
