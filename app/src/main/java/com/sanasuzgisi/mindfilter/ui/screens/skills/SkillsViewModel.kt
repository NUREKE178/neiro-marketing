package com.sanasuzgisi.mindfilter.ui.screens.skills

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sanasuzgisi.mindfilter.data.local.PreferencesManager
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SkillsViewModel(context: Context) : ViewModel() {
    private val prefs = PreferencesManager(context)

    val skillsProgress = prefs.getAllSkillsFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    fun toggleSkill(id: Int, current: Boolean) {
        viewModelScope.launch {
            prefs.setSkillCompleted(id, !current)
        }
    }

    fun clearAll() {
        viewModelScope.launch {
            prefs.clearAllSkills()
        }
    }
}
