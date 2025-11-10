/**
 * Error Tracking Module
 * Базовый модуль для отслеживания ошибок
 * Поддерживает интеграцию с Sentry (опционально)
 */

(function() {
    'use strict';
    
    // Используем CONFIG если доступен
    const CONFIG = window.CONFIG || {
        errorTracking: {
            enabled: false,
            sentryDsn: '',
            logToConsole: true,
            showNotifications: true
        }
    };
    
    const ERROR_TRACKING = CONFIG.errorTracking || {};
    
    /**
     * Инициализация error tracking
     */
    function initErrorTracking() {
        try {
            // Если error tracking отключен, выходим
            if (!ERROR_TRACKING.enabled) {
                return;
            }
            
            // Инициализация Sentry (если DSN указан)
            if (ERROR_TRACKING.sentryDsn && typeof Sentry !== 'undefined') {
                Sentry.init({
                    dsn: ERROR_TRACKING.sentryDsn,
                    environment: window.location.hostname === 'localhost' ? 'development' : 'production',
                    tracesSampleRate: 1.0,
                    beforeSend(event, hint) {
                        // Фильтрация ошибок перед отправкой
                        if (event.exception) {
                            const error = hint.originalException;
                            // Игнорируем некоторые ошибки
                            if (error && error.message && error.message.includes('ResizeObserver')) {
                                return null; // Игнорируем ResizeObserver ошибки
                            }
                        }
                        return event;
                    }
                });
                console.log('Sentry initialized');
            }
            
            // Глобальный обработчик ошибок
            window.addEventListener('error', handleGlobalError);
            window.addEventListener('unhandledrejection', handleUnhandledRejection);
            
            console.log('Error tracking initialized');
        } catch (e) {
            console.error('Error initializing error tracking:', e);
        }
    }
    
    /**
     * Обработка глобальных ошибок
     */
    function handleGlobalError(event) {
        try {
            const errorInfo = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error ? event.error.stack : null,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Логирование в консоль
            if (ERROR_TRACKING.logToConsole) {
                console.error('Global error:', errorInfo);
            }
            
            // Отправка в Sentry
            if (ERROR_TRACKING.sentryDsn && typeof Sentry !== 'undefined') {
                Sentry.captureException(event.error || new Error(event.message), {
                    contexts: {
                        error: errorInfo
                    }
                });
            }
            
            // Показ уведомления пользователю (опционально)
            if (ERROR_TRACKING.showNotifications && typeof showNotification === 'function') {
                showNotification('Произошла ошибка. Пожалуйста, обновите страницу.', 'error');
            }
        } catch (e) {
            console.error('Error in handleGlobalError:', e);
        }
    }
    
    /**
     * Обработка необработанных Promise rejections
     */
    function handleUnhandledRejection(event) {
        try {
            const errorInfo = {
                reason: event.reason,
                message: event.reason ? (event.reason.message || String(event.reason)) : 'Unknown error',
                stack: event.reason && event.reason.stack ? event.reason.stack : null,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Логирование в консоль
            if (ERROR_TRACKING.logToConsole) {
                console.error('Unhandled promise rejection:', errorInfo);
            }
            
            // Отправка в Sentry
            if (ERROR_TRACKING.sentryDsn && typeof Sentry !== 'undefined') {
                Sentry.captureException(event.reason || new Error(errorInfo.message), {
                    contexts: {
                        error: errorInfo
                    }
                });
            }
            
            // Предотвращаем вывод ошибки в консоль браузера
            event.preventDefault();
        } catch (e) {
            console.error('Error in handleUnhandledRejection:', e);
        }
    }
    
    /**
     * Ручное логирование ошибки
     */
    function logError(error, context = {}) {
        try {
            const errorInfo = {
                message: error.message || String(error),
                stack: error.stack || null,
                context: context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Логирование в консоль
            if (ERROR_TRACKING.logToConsole) {
                console.error('Manual error log:', errorInfo);
            }
            
            // Отправка в Sentry
            if (ERROR_TRACKING.sentryDsn && typeof Sentry !== 'undefined') {
                Sentry.captureException(error, {
                    contexts: {
                        manual: errorInfo
                    }
                });
            }
        } catch (e) {
            console.error('Error in logError:', e);
        }
    }
    
    /**
     * Логирование информационного сообщения
     */
    function logInfo(message, context = {}) {
        try {
            if (ERROR_TRACKING.logToConsole) {
                console.info('Info:', message, context);
            }
            
            // Отправка в Sentry как breadcrumb
            if (ERROR_TRACKING.sentryDsn && typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: message,
                    level: 'info',
                    data: context
                });
            }
        } catch (e) {
            console.error('Error in logInfo:', e);
        }
    }
    
    /**
     * Логирование предупреждения
     */
    function logWarning(message, context = {}) {
        try {
            if (ERROR_TRACKING.logToConsole) {
                console.warn('Warning:', message, context);
            }
            
            // Отправка в Sentry как breadcrumb
            if (ERROR_TRACKING.sentryDsn && typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: message,
                    level: 'warning',
                    data: context
                });
            }
        } catch (e) {
            console.error('Error in logWarning:', e);
        }
    }
    
    // Экспорт функций
    window.ErrorTracking = {
        init: initErrorTracking,
        logError: logError,
        logInfo: logInfo,
        logWarning: logWarning
    };
    
    // Автоматическая инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initErrorTracking);
    } else {
        initErrorTracking();
    }
})();

