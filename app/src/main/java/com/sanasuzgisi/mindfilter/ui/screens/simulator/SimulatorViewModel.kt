package com.sanasuzgisi.mindfilter.ui.screens.simulator

import androidx.lifecycle.ViewModel
import com.sanasuzgisi.mindfilter.data.model.FeedItem
import com.sanasuzgisi.mindfilter.data.model.Topic
import com.sanasuzgisi.mindfilter.data.model.UserAction
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class SimulatorUiState(
    val selectedTopic: Topic? = null,
    val isStarted: Boolean = false,
    val originalFeed: List<FeedItem> = emptyList(),
    val filteredFeed: List<FeedItem> = emptyList(),
    val showOriginal: Boolean = true,
    val topicScores: Map<Topic, Int> = emptyMap(),
    val actionsCount: Int = 0
)

class SimulatorViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(SimulatorUiState())
    val uiState: StateFlow<SimulatorUiState> = _uiState.asStateFlow()

    private val allSamplePosts = listOf(
        FeedItem(1, Topic.SPORT, "Футбол: Қайрат жеңді!", "Алматылық Қайрат командасы соңғы ойында 3:0 есебімен жеңді.", "sport_kz", 234),
        FeedItem(2, Topic.GAME, "Жаңа ойын шықты", "GTA 6 трейлері 100 млн қаралым жинады.", "gamer", 1203),
        FeedItem(3, Topic.MUSIC, "Димаш жаңа ән шығарды", "Димаштың жаңа әні YouTube-те трендте.", "music_news", 5432),
        FeedItem(4, Topic.EDUCATION, "ҰБТ-ға қалай дайындалу керек?", "5 тиімді әдіс: жоспар, қайталау, тест.", "edu_kz", 89),
        FeedItem(5, Topic.TECHNOLOGY, "iPhone 16 шықты", "Жаңа iPhone-ның бағасы және мүмкіндіктері.", "tech", 892, isAd = true),
        FeedItem(6, Topic.SPORT, "Теннис: Елена Рыбакина", "Елена Рыбакина әлемдік рейтингте көтерілді.", "tennis", 456),
        FeedItem(7, Topic.MUSIC, "Концерт Алматыда", "Ертең Алматыда үлкен концерт болады.", "almaty_life", 123),
        FeedItem(8, Topic.EDUCATION, "Ағылшын тілін 30 күнде", "Күніне 15 минут - жеткілікті.", "english", 234, isAd = true),
        FeedItem(9, Topic.GAME, "Minecraft жаңартуы", "Жаңа биомдар қосылды.", "minecraft", 678),
        FeedItem(10, Topic.TECHNOLOGY, "Жасанды интеллект", "AI қалай жұмыс істейді? Қарапайым түсіндірме.", "ai_kz", 345),
        FeedItem(11, Topic.SPORT, "Бокс: Головкин", "GGG қайта рингке орала ма?", "boxing", 789),
        FeedItem(12, Topic.EDUCATION, "Грантқа түсу құпиялары", "ҰБТ-да жоғары балл алу жолдары.", "grant_kz", 456),
        FeedItem(13, Topic.MUSIC, "Q-pop жаңалықтары", "Ninety One жаңа клип шығарды.", "qpop", 987),
        FeedItem(14, Topic.TECHNOLOGY, "Kaspi-де жеңілдік", "Тек бүгін 50% жеңілдік!", "kaspi_shop", 12, isAd = true),
        FeedItem(15, Topic.GAME, "PUBG турнир", "Қазақстандық команда финалда.", "esports", 321)
    )

    fun selectTopic(topic: Topic) {
        _uiState.value = _uiState.value.copy(selectedTopic = topic)
    }

    fun startSimulation() {
        val selected = _uiState.value.selectedTopic ?: return
        // Original feed = mixed, shuffled
        val original = allSamplePosts.shuffled()
        // Initial scores: selected topic gets +1
        val scores = Topic.values().associateWith { if (it == selected) 1 else 0 }
        _uiState.value = _uiState.value.copy(
            isStarted = true,
            originalFeed = original,
            filteredFeed = generateFilteredFeed(scores),
            topicScores = scores,
            showOriginal = true,
            actionsCount = 0
        )
    }

    fun onUserAction(item: FeedItem, action: UserAction) {
        val currentScores = _uiState.value.topicScores.toMutableMap()
        val delta = when (action) {
            UserAction.LIKE -> 3
            UserAction.VIEW -> 1
            UserAction.SKIP -> -1
            UserAction.DISLIKE -> -2
            else -> 0
        }
        currentScores[item.topic] = (currentScores[item.topic] ?: 0) + delta
        // Ensure no negative too low
        if ((currentScores[item.topic] ?: 0) < -5) currentScores[item.topic] = -5

        _uiState.value = _uiState.value.copy(
            topicScores = currentScores,
            filteredFeed = generateFilteredFeed(currentScores),
            actionsCount = _uiState.value.actionsCount + 1,
            showOriginal = false
        )
    }

    private fun generateFilteredFeed(scores: Map<Topic, Int>): List<FeedItem> {
        // Sort by score descending, then create weighted list
        // Higher score topics appear more
        val sortedTopics = scores.entries.sortedByDescending { it.value }.map { it.key }

        // Build new feed: top topic gets 60% of feed, second 25%, rest 15%
        val result = mutableListOf<FeedItem>()
        val topTopic = sortedTopics.firstOrNull()
        val secondTopic = sortedTopics.getOrNull(1)

        // Add more items for top topics (duplicate with slight variation if needed)
        allSamplePosts.forEach { post ->
            val score = scores[post.topic] ?: 0
            val repeatCount = when {
                post.topic == topTopic && score > 2 -> 3
                post.topic == topTopic && score > 0 -> 2
                post.topic == secondTopic && score > 1 -> 2
                score < -1 -> 0 // filtered out
                else -> 1
            }
            repeat(repeatCount) { result.add(post.copy(id = result.size + 1000)) }
        }

        // If too few, add random
        if (result.size < 8) {
            result.addAll(allSamplePosts.shuffled().take(8 - result.size))
        }

        // Sort so top topic first
        return result.sortedByDescending { scores[it.topic] ?: 0 }.take(15)
    }

    fun toggleFeed() {
        _uiState.value = _uiState.value.copy(showOriginal = !_uiState.value.showOriginal)
    }

    fun reset() {
        _uiState.value = SimulatorUiState()
    }
}
