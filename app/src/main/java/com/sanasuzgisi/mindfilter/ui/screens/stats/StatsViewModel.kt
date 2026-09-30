package com.sanasuzgisi.mindfilter.ui.screens.stats

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.room.Room
import com.sanasuzgisi.mindfilter.data.local.AppDatabase
import com.sanasuzgisi.mindfilter.data.model.DailyStat
import com.sanasuzgisi.mindfilter.data.repository.StatsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class StatsUiState(
    val averageMinutes: Int = 0,
    val totalMinutes: Int = 0,
    val comparisonText: String = ""
)

class StatsViewModel(context: Context) : ViewModel() {
    private val db = com.sanasuzgisi.mindfilter.data.local.DatabaseProvider.getDatabase(context)
    private val repository = StatsRepository(db.dailyStatDao())

    val allStats: StateFlow<List<DailyStat>> = repository.allStats
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _uiState = MutableStateFlow(StatsUiState())
    val uiState: StateFlow<StatsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            allStats.collect { list ->
                if (list.isNotEmpty()) {
                    val total = list.sumOf { it.minutes }
                    val avg = total / list.size
                    val comparison = if (list.size >= 2) {
                        val last = list[0].minutes
                        val prev = list[1].minutes
                        when {
                            last < prev -> "📉 Кешеге қарағанда ${prev - last} минут аз. Жарайсың!"
                            last > prev -> "📈 Кешеге қарағанда ${last - prev} минут көп. Ертең азайтуға тырысып көр."
                            else -> "➖ Кешегідей. Тұрақтылық жақсы."
                        }
                    } else "Алғашқы жазбаң! Күн сайын қосып отыр."
                    _uiState.value = StatsUiState(avg, total, comparison)
                } else {
                    _uiState.value = StatsUiState()
                }
            }
        }
    }

    fun addStat(minutes: Int, note: String) {
        viewModelScope.launch {
            val now = Date()
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val dateStr = sdf.format(now)
            // Check existing for today - replace
            val existing = repository.getByDate(dateStr)
            val stat = DailyStat(
                id = existing?.id ?: 0,
                dateMillis = now.time,
                dateString = dateStr,
                minutes = minutes,
                note = note
            )
            repository.insert(stat)
        }
    }

    fun delete(stat: DailyStat) {
        viewModelScope.launch { repository.delete(stat) }
    }

    fun clearAll() {
        viewModelScope.launch { repository.clearAll() }
    }
}
