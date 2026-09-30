package com.sanasuzgisi.mindfilter.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "mindfilter_prefs")

class PreferencesManager(private val context: Context) {

    // Skills progress - 6 skills
    private fun skillKey(id: Int) = booleanPreferencesKey("skill_$id")
    private val onboardingKey = booleanPreferencesKey("onboarding_done")

    fun isSkillCompleted(id: Int): Flow<Boolean> {
        return context.dataStore.data.map { prefs ->
            prefs[skillKey(id)] ?: false
        }
    }

    suspend fun setSkillCompleted(id: Int, completed: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[skillKey(id)] = completed
        }
    }

    fun getAllSkillsFlow(): Flow<Map<Int, Boolean>> {
        return context.dataStore.data.map { prefs ->
            (1..6).associateWith { id -> prefs[skillKey(id)] ?: false }
        }
    }

    suspend fun clearAllSkills() {
        context.dataStore.edit { prefs ->
            (1..6).forEach { id ->
                prefs[skillKey(id)] = false
            }
        }
    }

    // Onboarding
    val isOnboardingDone: Flow<Boolean> = context.dataStore.data.map { it[onboardingKey] ?: false }

    suspend fun setOnboardingDone(done: Boolean) {
        context.dataStore.edit { it[onboardingKey] = done }
    }
}
