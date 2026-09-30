package com.socialpulse.android.data.model

enum class Platform(val display: String, val emoji: String) {
    INSTAGRAM("Instagram", "📸"),
    TIKTOK("TikTok", "🎵"),
    ALL("All", "🌐")
}

enum class SearchType { ACCOUNT, VIDEO, NICHE }
enum class Region(val display: String) {
    ALL("Барлық өңірлер"),
    KAZAKHSTAN("Қазақстан"),
    ALMATY("Алматы"),
    ASTANA("Астана"),
    SHYMKENT("Шымкент"),
    KARAGANDY("Қарағанды"),
    OTHER("Басқа")
}

data class Account(
    val id: String,
    val username: String,
    val displayName: String,
    val platform: Platform,
    val avatar: String,
    val bio: String,
    val followers: Int,
    val totalVideos: Int,
    val totalViews: Int,
    val totalLikes: Int,
    val totalComments: Int,
    val avgViews: Int,
    val avgLikes: Int,
    val engagementRate: Double,
    val lastPostDate: String,
    val region: Region,
    val regionVerified: Boolean,
    val source: String,
    val isDemo: Boolean = true
)

data class Video(
    val id: String,
    val accountId: String,
    val platform: Platform,
    val title: String,
    val caption: String,
    val views: Int,
    val likes: Int,
    val comments: Int,
    val shares: Int,
    val engagementRate: Double,
    val publishedAt: String,
    val hashtags: List<String>,
    val isDemo: Boolean = true
)

object MockData {
    val accounts = listOf(
        Account("1", "almaty_toys", "Алматы Ойыншықтары", Platform.INSTAGRAM, "https://i.pravatar.cc/150?img=1", "Балаларға арналған ең жақсы ойыншықтар 🧸 Алматыда жеткізу", 45200, 127, 892000, 124500, 3400, 7023, 980, 4.2, "2024-09-28", Region.ALMATY, true, "Instagram API (demo)"),
        Account("2", "toy_world_kz", "Toy World Kazakhstan", Platform.TIKTOK, "https://i.pravatar.cc/150?img=2", "Ойыншықтарға шолу, распаковка 🎁", 128000, 342, 3420000, 567000, 12300, 10000, 1657, 5.8, "2024-09-29", Region.KAZAKHSTAN, false, "TikTok API (demo)"),
        Account("3", "balalar_alemi", "Балалар Әлемі", Platform.INSTAGRAM, "https://i.pravatar.cc/150?img=3", "Балалар тауарлары дүкені", 23100, 89, 445000, 45200, 1200, 5000, 507, 3.1, "2024-09-25", Region.ASTANA, true, "Instagram API (demo)"),
        Account("4", "coffee_almaty", "Coffee Almaty ☕", Platform.INSTAGRAM, "https://i.pravatar.cc/150?img=4", "Алматыдағы ең дәмді кофе", 89200, 210, 1200000, 234000, 5600, 5714, 1114, 6.2, "2024-09-30", Region.ALMATY, true, "Instagram API (demo)"),
        Account("5", "beauty_kz", "Beauty Kazakhstan", Platform.TIKTOK, "https://i.pravatar.cc/150?img=5", "Косметика, уход, обзоры", 201000, 523, 8900000, 1200000, 34000, 17017, 2294, 7.1, "2024-09-30", Region.KAZAKHSTAN, false, "TikTok API (demo)")
    )

    val videos = listOf(
        Video("v1", "1", Platform.INSTAGRAM, "Жаңа LEGO жинағы!", "Балаңызға арналған LEGO! #ойыншық #almaty #lego", 12300, 890, 45, 12, 7.7, "2024-09-28", listOf("ойыншық", "almaty", "lego")),
        Video("v2", "2", Platform.TIKTOK, "Ойыншық распаковка", "Бүгінгі распаковка 😍 #распаковка #ойыншық #тренд", 45200, 3200, 123, 234, 7.8, "2024-09-29", listOf("распаковка", "ойыншық")),
        Video("v3", "1", Platform.INSTAGRAM, "Балалар ойыншықтары -30%", "Тек бүгін -30%! #жеңілдік #ойыншық", 8900, 450, 23, 5, 5.3, "2024-09-27", listOf("жеңілдік", "ойыншық")),
        Video("v4", "4", Platform.INSTAGRAM, "Latte art", "Бүгінгі латте арт ☕ #coffee #almaty", 15600, 2100, 89, 34, 14.0, "2024-09-30", listOf("coffee", "almaty")),
        Video("v5", "5", Platform.TIKTOK, "Косметика обзор", "Бұл крем жұмыс істей ме? #косметика #beauty", 89200, 7800, 342, 123, 9.2, "2024-09-29", listOf("косметика", "beauty"))
    )

    val hashtags = listOf(
        "ойыншық" to 342,
        "балалар" to 231,
        "almaty" to 189,
        "игрушки" to 156,
        "распаковка" to 98
    )

    val postingFrequency = listOf(
        "24" to 3, "25" to 5, "26" to 2, "27" to 7, "28" to 4, "29" to 6, "30" to 8
    )
}

fun formatNumber(num: Int): String {
    return when {
        num >= 1000000 -> "${num / 1000000}.${(num % 1000000) / 100000}M"
        num >= 1000 -> "${num / 1000}.${(num % 1000) / 100}K"
        else -> num.toString()
    }
}
