/**
 * Configuration file for Stanislav Karamin Portfolio
 * Централизованное хранение конфигурационных констант
 */

const CONFIG = {
    // Analytics
    analytics: {
        yandex: {
            id: 'ea9e94e7d4dc4023b0b19cf40f44b574',
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
        },
        google: {
            id: 'G-RRWNG4DZE1'
        },
        statsEndpoint: '' // TODO: настроить API endpoint для статистики
    },
    
    // Site Information
    site: {
        url: 'https://ksp-hub.github.io/Stanislav-Karamin-Portfolio/',
        title: 'Станислав Карамин - Программист-аналитик | Data Analyst Portfolio',
        description: 'Программист-аналитик (Python, SQL, BI, Статистика). Портфолио проектов по анализу данных, Python, SQL и визуализации.',
        author: 'Stanislav Karamin',
        language: 'ru',
        defaultLanguage: 'ru',
        supportedLanguages: ['ru', 'en']
    },
    
    // Projects Configuration
    projects: {
        itemsPerPage: 12,
        sortOrder: 'desc', // 'asc' or 'desc' (by date)
        defaultCategory: 'all',
        defaultStatus: 'all'
    },
    
    // Project Views Counter
    views: {
        cooldownMs: 1 * 60 * 1000, // 1 minute cooldown between views
        storageKey: 'portfolio_project_views',
        lastViewedKey: 'portfolio_project_views_last_viewed'
    },
    
    // Image Loading
    images: {
        placeholder: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f0f0f0\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение загружается...%3C/text%3E%3C/svg%3E',
        errorPlaceholder: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f8f8f8\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23ccc\' font-family=\'sans-serif\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение недоступно%3C/text%3E%3C/svg%3E',
        lazyLoadThreshold: '100px' // Intersection Observer rootMargin
    },
    
    // Performance
    performance: {
        debounceDelay: 300, // ms
        scrollRevealDelay: 100, // ms
        animationDuration: 300 // ms
    },
    
    // Error Tracking
    errorTracking: {
        enabled: false, // Set to true to enable error tracking
        sentryDsn: '', // TODO: Add Sentry DSN if using Sentry
        logToConsole: true,
        showNotifications: true
    },
    
    // Localization
    i18n: {
        defaultLocale: 'ru',
        fallbackLocale: 'en',
        locales: {
            ru: {
                name: 'Русский',
                code: 'ru',
                hreflang: 'ru'
            },
            en: {
                name: 'English',
                code: 'en',
                hreflang: 'en'
            }
        }
    },
    
    // SEO
    seo: {
        verification: {
            yandex: 'y0__xDh9IuSARigozsgkpWr-hTs5_GKdLkgPNVh0o2nZobjRM-2hg',
            google: 'G-RRWNG4DZE1'
        },
        ogImage: 'https://raw.githubusercontent.com/KSP-Hub/assets/c9a08d816996bafee8e1acbb36ade5d8bd90bbb5/image/KSP-Profile-Photo3B.webp',
        ogImageWidth: 1200,
        ogImageHeight: 630
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}

