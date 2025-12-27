/**
 * Stanislav Karamin Portfolio - Main JavaScript
 * Optimized and improved version
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    
    // Use CONFIG from config.js if available, otherwise use defaults
    const CONFIG = window.CONFIG || {
        images: {
            placeholder: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f0f0f0\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение загружается...%3C/text%3E%3C/svg%3E',
            errorPlaceholder: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f8f8f8\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23ccc\' font-family=\'sans-serif\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение недоступно%3C/text%3E%3C/svg%3E',
            lazyLoadThreshold: '100px'
        },
        errorTracking: {
            enabled: false,
            logToConsole: true,
            showNotifications: true
        }
    };

    // ============================================
    // Utility Functions
    // ============================================
    
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Handle image load error with fallback and user notification
     * @param {HTMLImageElement} img - Image element
     * @param {string} altText - Alt text for the image
     * @param {boolean} showNotification - Whether to show notification to user
     */
    function handleImageError(img, altText = 'Изображение', showNotification = false) {
        try {
            // Set error placeholder from config
            const errorPlaceholder = CONFIG.images?.errorPlaceholder || 
                'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f8f8f8\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23ccc\' font-family=\'sans-serif\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение недоступно%3C/text%3E%3C/svg%3E';
            
            img.src = errorPlaceholder;
            img.alt = `${altText} (недоступно)`;
            img.classList.add('image-error');
            
            // Log error if enabled
            if (CONFIG.errorTracking?.logToConsole) {
                console.warn(`Image failed to load: ${img.src}`, {
                    alt: altText,
                    originalSrc: img.dataset.originalSrc || 'unknown'
                });
            }
            
            // Show notification if enabled
            if (showNotification && CONFIG.errorTracking?.showNotifications && typeof showNotification === 'function') {
                showNotification(`Изображение "${altText}" не удалось загрузить`);
            }
        } catch (e) {
            console.error('Error in handleImageError:', e);
        }
    }
    
    /**
     * Setup image with loading placeholder and error handling
     * @param {HTMLImageElement} img - Image element
     * @param {string} src - Image source URL
     * @param {string} alt - Alt text
     * @param {boolean} showNotification - Whether to show notification on error
     */
    function setupImage(img, src, alt = '', showNotification = false) {
        try {
            // Store original source
            img.dataset.originalSrc = src;
            
            // Set loading placeholder
            const placeholder = CONFIG.images?.placeholder || 
                'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f0f0f0\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение загружается...%3C/text%3E%3C/svg%3E';
            
            img.src = placeholder;
            img.alt = alt;
            img.classList.add('image-loading');
            
            // Create new image to preload
            const preloadImg = new Image();
            preloadImg.onload = function() {
                img.src = src;
                img.alt = alt;
                img.classList.remove('image-loading');
                img.classList.add('image-loaded');
            };
            preloadImg.onerror = function() {
                handleImageError(img, alt, showNotification);
            };
            preloadImg.src = src;
        } catch (e) {
            console.error('Error in setupImage:', e);
            handleImageError(img, alt, showNotification);
        }
    }
    
    /**
     * Setup lazy loading for image using Intersection Observer
     * @param {HTMLImageElement} img - Image element
     * @param {string} src - Image source URL
     * @param {string} alt - Alt text
     */
    function setupLazyImage(img, src, alt = '') {
        try {
            // Store original source in data attribute
            img.dataset.src = src;
            img.alt = alt;
            img.classList.add('image-lazy');
            
            // Set loading placeholder
            const placeholder = CONFIG.images?.placeholder || 
                'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f0f0f0\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EИзображение загружается...%3C/text%3E%3C/svg%3E';
            img.src = placeholder;
            
            // Use Intersection Observer if available
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const image = entry.target;
                            const imageSrc = image.dataset.src;
                            
                            if (imageSrc) {
                                setupImage(image, imageSrc, image.alt, false);
                                observer.unobserve(image);
                            }
                        }
                    });
                }, {
                    rootMargin: CONFIG.images?.lazyLoadThreshold || '100px'
                });
                
                observer.observe(img);
            } else {
                // Fallback: load immediately if Intersection Observer not supported
                setupImage(img, src, alt, false);
            }
        } catch (e) {
            console.error('Error in setupLazyImage:', e);
            // Fallback: try to load image normally
            setupImage(img, src, alt, false);
        }
    }

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ============================================
    // Projects Data
    // ============================================
    
    const projectsData = [
        {
            id: 18,
            title: 'Standalone Assistant 2025 for CV development in Python',
            description: 'Создан полностью автономный инструмент для помощи в написании кода на Python для задач компьютерного зрения.',
            fullDescription: 'Проект направлен на создание автономного инструмента для разработчиков и исследователей в сфере компьютерного зрения. Ассистент помогает автоматически создавать и оптимизировать код на Python, используя специализированные библиотеки и технологии глубокого обучения. Инструмент разработан с открытым исходным кодом и ориентирован на работу без санкционной зависимости, обеспечивая высокую производительность и интеграцию с основными инструментами разработчика, такими как VS Code.',
            tasks: 'Подготовка: Анализ существующих решений, аналогичных Cursor AI, выявление преимуществ и недостатков. → Настройка и доработка: Настройка ассистента под конкретную аппаратную конфигурацию, проверка производительности и необходимой оптимизации. → Минимально жизнеспособный продукт (MVP): Достижение ключевых показателей качества и документации результатов',
            technologies: ['Python', 'OpenCv', 'NumPy', 'SciPy', 'Tkinter'],
            category: 'ai',
            difficulty: 'advanced',
            date: '2025-11-09',
            image: 'https://raw.githubusercontent.com/KSP-Hub/My-CV-Engineering-Projects/dbb576114f9ca0e6010b9e5f84dd49c21d36e764/CV-000-ai-assistant/images/CV-000-Ai-Assistant-Image-1000.gif',
            link: 'https://raw.githubusercontent.com/KSP-Hub/assets/https/github.dev/karamin-stanislav/karamin-stanislav/image/404orig.gif',
            repo: 'https://github.com/KSP-Hub/My-CV-Engineering-Projects/tree/main/CV-000-ai-assistant',
            hours: 98,
            status: 'done',
            features: ['Автономная работа без зависимости', 'Высокая производительность на GPU', 'Оптимизация под стандартные рабочие станции', 'Работа с большими объёмами данных', 'Свободный интерфейс с возможностью локализации'],
            results: [
                'Полностью автономный AI инструмент для помощи в написании кода для задач технического (компьютерного) зрения, лишённый зависимости от санкционных ограничений',
                'Эффективная поддержка разработчиков и исследователей',
                'Высокопроизводительная локальная инфраструктура для экспериментов',
                'Документированная методология настройки и эксплуатации'
            ]
        },
        {
            id: 17,
            title: 'Style Transfer между изображениями',
            description: 'Перенос художественного стиля между изображениями с использованием нейросетей',
            fullDescription: 'Реализация алгоритма Neural Style Transfer для переноса художественного стиля с одного изображения на другое. Изучение feature extraction из предобученных VGG сетей и оптимизации content и style loss.',
            tasks: 'Загрузить предобученную VGG сеть → Реализовать content и style loss → Настроить оптимизацию → Визуализировать процесс переноса → Эксперименты с различными стилями',
            technologies: ['Python', 'PyTorch', 'Style Transfer', 'VGG', 'Optimization', 'Artistic'],
            category: 'dl',
            difficulty: 'advanced',
            date: '2026-02-09',
            image: '',
            link: '',
            repo: '',
            hours: 35,
            status: 'backlog',
            features: ['Neural Style Transfer', 'Content/Style разделение', 'Визуализация процесса', 'Эксперименты с параметрами'],
            results: [
                'Рабочий алгоритм переноса стиля с настраиваемыми параметрами',
                'Библиотека предобученных стилей для быстрого применения',
                'Оптимизация для обработки изображений высокого разрешения'
            ]
        },
        {
            id: 16,
            title: 'Сегментация изображений U-Net',
            description: 'Семантическая сегментация медицинских изображений с архитектурой U-Net',
            fullDescription: 'Реализация U-Net архитектуры для задач семантической сегментации медицинских изображений. Применение к данным сегментации легких на рентгеновских снимках. Изучение метрик IoU, Dice coefficient и техник обработки медицинских данных.',
            tasks: 'Подготовить медицинский датасет → Реализовать U-Net архитектуру → Настроить loss функции (Dice, BCE) → Обучить модель → Валидация и метрики → Визуализация сегментации',
            technologies: ['Python', 'PyTorch', 'U-Net', 'Medical Imaging', 'Segmentation', 'MONAI'],
            category: 'dl',
            difficulty: 'advanced',
            date: '2026-01-26',
            image: '',
            link: '',
            repo: '',
            hours: 40,
            status: 'backlog',
            features: ['Semantic segmentation', 'Medical imaging', 'Custom loss functions', 'Metrics analysis', '3D визуализация'],
            results: [
                'Сегментация с IoU >0.85 на тестовых медицинских данных',
                'Адаптация архитектуры под специфику медицинских изображений',
                'Сравнение различных loss функций для segmentation задач'
            ]
        },
        {
            id: 15,
            title: 'Детекция объектов с YOLO',
            description: 'Реализация реального детектора объектов с использованием YOLO архитектуры',
            fullDescription: 'Практическая работа с современными архитектурами детекции объектов. Настройка YOLO для обнаружения и классификации объектов в реальном времени. Обучение на custom датасете, оптимизация для различных hardware.',
            tasks: 'Настроить YOLO окружение → Подготовить/разметить датасет → Конфигурирование модели → Обучение и валидация → Тестирование на видео → Оптимизация производительности',
            technologies: ['Python', 'PyTorch', 'YOLO', 'OpenCV', 'Object Detection', 'Ultralytics'],
            category: 'cv',
            difficulty: 'advanced',
            date: '2026-01-12',
            image: '',
            link: '',
            repo: '',
            hours: 45,
            status: 'backlog',
            features: ['Real-time детекция', 'Multi-class классификация', 'Обработка видео', 'Производительность >30 FPS', 'Custom датасет'],
            results: [
                'Детектор объектов с mAP >0.75 на custom датасете',
                'Real-time обработка видео потока с веб-камеры',
                'Сравнение YOLO версий по скорости/точности для различных use cases'
            ]
        },
        {
            id: 14,
            title: 'Transfer Learning для классификации изображений',
            description: 'Использование предобученных моделей для решения конкретной задачи классификации',
            fullDescription: 'Применение transfer learning с использованием предобученных моделей (ResNet, VGG) для классификации изображений из специализированного датасета. Fine-tuning последних слоев под конкретную задачу, изучение техник аугментации данных.',
            tasks: 'Выбрать датасет (CIFAR-10/Cats&Dogs) → Загрузить предобученную модель → Заморозить/разморозить слои → Настроить аугментацию данных → Обучить с fine-tuning → Оценить качество',
            technologies: ['Python', 'PyTorch', 'Transfer Learning', 'ResNet', 'Data Augmentation', 'Torchvision'],
            category: 'dl',
            difficulty: 'intermediate',
            date: '2025-12-29',
            image: '',
            link: '',
            repo: '',
            hours: 35,
            status: 'backlog',
            features: ['Fine-tuning предобученных моделей', 'Расширенная аугментация данных', 'Сравнение подходов', 'Визуализация предсказаний'],
            results: [
                'Модель с точностью >90% на custom датасете',
                'Сравнение эффективности различных предобученных архитектур',
                'Оптимизированный пайплайн fine-tuning для быстрого прототипирования'
            ]
        },
        {
            id: 13,
            title: 'Классификация рукописных цифр CNN',
            description: 'Создание сверточной нейросети для классификации MNIST датасета',
            fullDescription: 'Практическое введение в PyTorch: построение и обучение сверточной нейронной сети для распознавания рукописных цифр. Изучение основ архитектуры CNN, функций потерь, оптимизаторов и техник регуляризации.',
            tasks: 'Загрузить и подготовить MNIST датасет → Создать архитектуру CNN → Настроить training loop → Реализовать валидацию → Визуализировать метрики → Проанализировать ошибки',
            technologies: ['Python', 'PyTorch', 'CNN', 'MNIST', 'Matplotlib', 'Torchvision'],
            category: 'dl',
            difficulty: 'intermediate',
            date: '2025-12-15',
            image: '',
            link: '',
            repo: '',
            hours: 30,
            status: 'backlog',
            features: ['Custom CNN архитектура', 'Визуализация обучения', 'Анализ метрик', 'Регуляризация', 'Инференс на новых данных'],
            results: [
                'CNN модель с точностью >98% на тестовой выборке',
                'Визуализация feature maps и фильтров сети',
                'Сравнение различных архитектур и гиперпараметров'
            ]
        },
        {
            id: 12,
            title: 'Фильтры и обработка изображений',
            description: 'Реализация классических фильтров и методов обработки изображений',
            fullDescription: 'Создание комплексной библиотеки фильтров для обработки изображений: размытие, повышение резкости, детекция краев, цветовые преобразования. Изучение математических основ операторов Собеля, Лапласа и Кэнни.',
            tasks: 'Реализовать Gaussian/Median blur → Добавить детекторы краев (Sobel, Canny, Laplacian) → Создать цветовые фильтры (сепия, grayscale, инверсия) → Реализовать гистограммную эквализацию → Собрать интерфейс для применения фильтров',
            technologies: ['Python', 'OpenCV', 'NumPy', 'Matplotlib', 'Image Processing'],
            category: 'cv',
            difficulty: 'beginner',
            date: '2025-12-01',
            image: '',
            link: '',
            repo: '',
            hours: 25,
            status: 'backlog',
            features: ['8+ типов фильтров', 'Интерактивный интерфейс', 'Сравнение алгоритмов', 'Гистограммный анализ'],
            results: [
                'Библиотека из 10+ фильтров обработки изображений',
                'Сравнительный анализ эффективности детекторов краев',
                'Интерактивный демо-интерфейс для тестирования фильтров'
            ]
        },
        {
            id: 11,
            title: 'Распознавание QR-кодов',
            description: 'Детекция и декодирование QR-кодов на изображениях и в реальном времени',
            fullDescription: 'Реализация системы распознавания QR-кодов с использованием библиотеки PyZBar и OpenCV. Проект включает обработку изображений с различными искажениями, углами поворота и условиями освещения.',
            tasks: 'Установить и настроить PyZBar → Реализовать детектор QR-кодов → Добавить обработку перспективы → Создать веб-интерфейс для загрузки изображений → Протестировать на реальных данных',
            technologies: ['Python', 'OpenCV', 'PyZBar', 'QRCode', 'Flask'],
            category: 'cv',
            difficulty: 'beginner',
            date: '2025-11-24',
            image: '',
            link: '',
            repo: '',
            hours: 20,
            status: 'ongoing',
            features: ['Детекция QR-кодов под углом', 'Обработка перспективных искажений', 'Веб-интерфейс для загрузки', 'Декодирование различных форматов'],
            results: [
                'Система распознавания с точностью >90% на реальных изображениях',
                'Веб-интерфейс для тестирования на пользовательских изображениях',
                'Обработка QR-кодов с различных ракурсов и расстояний'
            ]
        },
        {
            id: 10,
            title: 'Детекция лиц с помощью OpenCV',
            description: 'Обнаружение и выделение лиц на изображениях с использованием каскадов Хаара',
            fullDescription: 'Практическое знакомство с OpenCV: реализация детектора лиц с использованием предобученных каскадов Хаара. Проект включает консольное и веб-приложение на Flask для обработки изображений, визуализацию результатов с bounding boxes, гибкую настройку параметров детекции и оценку точности (~85-100%). Проект также поддерживает запуск через Docker и имеет настроенный CI/CD пайплайн.',
            tasks: 'Настроить окружение OpenCV → Загрузить Haar cascades → Реализовать пайплайн детекции → Визуализировать результаты → Протестировать на различных изображениях → Оценить точность → Реализация веб-интерфейса с Flask → Создание Docker-образа для развертывания → Настройка CI/CD пайплайна',
            technologies: ['Python', 'OpenCV', 'Haar Cascades', 'NumPy', 'Matplotlib', 'Flask', 'Docker', 'PyInstaller'],
            category: 'cv',
            difficulty: 'beginner',
            date: '2025-11-17',
            image: 'https://raw.githubusercontent.com/KSP-Hub/My-CV-Engineering-Projects/dbb576114f9ca0e6010b9e5f84dd49c21d36e764/CV-010_face_detection/assets/output_python_jupyter_web.gif',
            link: 'https://github.com/KSP-Hub/My-CV-Engineering-Projects/releases/tag/CV-010-v1.0.0',
            repo: 'https://github.com/KSP-Hub/My-CV-Engineering-Projects/tree/main/CV-010_face_detection',
            hours: 20,
            status: 'done',
            features: ['Детекция одиночных и множественных лиц', 'Визуализация bounding boxes', 'Оценка точности детекции', 'Обработка различных ракурсов', 'Поддержка веб-интерфейса через Flask', 'Возможность настройки параметров детекции (scale_factor, min_neighbors)', 'Реализована обработка ошибок и валидация входных данных'],
            results: [
                'Рабочий детектор лиц с точностью ~85% на тестовых изображениях',
                'Оптимизированный пайплайн обработки изображений',
                'Сравнение различных каскадов для разных условий освещения'
                'Точность детекции составляет 100% на изображениях хорошего качества'
                'Проект включает не только консольное, но и веб-приложение на Flask'
                'Реализована поддержка конфигурационных параметров через config.json'
                'Добавлена поддержка Docker для упрощенного развертывания'
            ]
        },
        {
            id: 9,
            title: 'Создание функционального веб-портфолио',
            description: 'Адаптивное веб-портфолио с современным дизайном и масштабируемой архитектурой',
            fullDescription: 'Современное портфолио с адаптивным дизайном, системой фильтрации проектов и интеграцией аналитики. Включает оптимизированную структуру для быстрой загрузки и SEO.',
            tasks: 'Создать функциональное, но простое веб-портфолио с эстетичным дизайном и минимализмом. Реализовать масштабируемую архитектуру и автономное решение без необходимости поддержки.',
            technologies: ['HTML', 'CSS', 'JavaScript', 'Markdown', 'GitHub Pages'],
            category: 'web',
            difficulty: 'высокая',
            date: '2025-10-31',
            image: 'https://raw.githubusercontent.com/KSP-Hub/assets/https/github.dev/karamin-stanislav/karamin-stanislav/image/screencapture-ksp-hub-github-io-Stanislav-Karamin-Portfolio%20Website-2025-10-30-15_04_13.png',
            link: 'https://github.com/KSP-Hub/Stanislav-Karamin-Portfolio',
            repo: 'https://github.com/KSP-Hub/Stanislav-Karamin-Portfolio',
            hours: 160,
            status: 'done',
            features: ['Адаптивный дизайн', 'Система фильтрации', 'Интеграция аналитики', 'SEO оптимизация'],
            results: [
                'Создан полностью адаптивный дизайн для всех устройств',
                'Реализована система фильтрации проектов с debounce оптимизацией',
                'Достигнута оценка 100/100 по SEO и доступности',
                'Интегрированы Yandex.Metrica и Google Analytics с согласием пользователя',
                'Уровень проработки проекта позволяет характеризовать его как идеальный. Отмечена внимательность к деталям: корректно задан масштаб страницы (35 %).',
            ]
        },
        {
            id: 8,
            title: 'API & Анализ Сообщества ВКонтакте - V2',
            description: 'Анализ постов сообщества ВК с помощью SQL-запросов и визуализации данных',
            fullDescription: 'Анализ постов сообщества ВК с помощью SQL-запросов и визуализации данных, чтобы понять, что больше всего влияет на количество лайков',
            tasks: 'Собрать таблицу с датой постов и количеством лайков. Ответить: "Что больше всего влияет на количество лайков". Результат: таблица CSV и SQL-запросы с необходимыми объяснениями и выводами. Оптимизировать старую Старую  V1 (сложная навигация и читаемость)',
            technologies: ['VK', 'API', 'PostgreSQL', 'Dbeaver', 'SQL', 'Window Functions', 'Common Table Expression', 'CTE'],
            category: 'data-analysis',
            difficulty: 'advanced',
            date: '2025-10-19',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20251021T1103_Adventum_20251021T1103_Task_postgres_Script2Optimized-page-all---.gif',
            link: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/main/20251009T1748%20-%20Script2-Optimized-SQL-CSV.rar',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 40,
            status: 'done',
            features: ['Оптимизация SQL-запросов', 'Улучшенная навигация', 'Анализ данных', 'Визуализация результатов'],
            results: [
                'Качественный результат 2: Получен ответ на вопрос: "Что больше всего влияет на количество лайков"',
                'Количественный результат: Таблица CSV и SQL-запросы с необходимыми объяснениями и выводами',
                'Качественный результат 2: Улучшена навигация и читаемость'
            ]
        },
        {
            id: 7,
            title: 'Анализ платформы Netflix',
            description: 'Комплексный анализ датасета фильмов и сериалов Netflix',
            fullDescription: 'Глубокий анализ датасета Netflix с более чем 8000 фильмов и сериалов. Включает анализ тенденций контента, оценку популярности жанров и временные тренды.',
            tasks: 'Проанализировать датасет с более чем 8000 фильмов и сериалов на платформе Netflix. Выявить закономерности и тенденции в контенте.',
            technologies: ['Anaconda', 'Python', 'Markdown', 'Jupyter'],
            category: 'data-analysis',
            difficulty: 'intermediate',
            date: '2025-10-07',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20251007%20ДЗ_02_Домашняя%20работа%20python%20Netflix%20С.П.%20Карамин---.gif',
            link: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20251007%20ДЗ_02_Домашняя%20работа%20python%20С.П.%20Карамин.ipynb',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 25,
            status: 'done',
            features: ['Анализ временных рядов', 'Визуализация данных', 'Статистический анализ', 'Интерактивные отчеты'],
            results: [
                'Проанализировано более 8000 фильмов и сериалов',
                'Выявлены наиболее популярные жанры и тренды контента',
                'Созданы визуализации для представления данных'
            ]
        },
        {
            id: 6,
            title: 'Аналитический отчет и визуализация. Объемы продаж за год в кофейной сети',
            description: 'Дашборд бизнес-аналитики для анализа продаж кофейной сети',
            fullDescription: 'Аналитический отчет и визуализация объема продаж кофе в 2024-2025 годах в кофейной сети. Офлайн-торговля. Подготовка дашборда для руководства, отвечающего на ключевые бизнес-вопросы.',
            tasks: 'Изучить продажи за последний период и подготовить дашборд для руководства, который ответит на ключевые бизнес-вопросы.',
            technologies: ['BI', 'Yandex', 'Datalens', 'CSV', 'Data Visualization', 'SQL'],
            category: 'visualization',
            difficulty: 'intermediate',
            date: '2025-10-05',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20251005%20ДЗ_01.%20DataSet%20Coffe%20Sales%20DashBoard_DOC---.png',
            link: 'https://datalens.yandex/v1k9iwk4lxt8g',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 20,
            status: 'done',
            results: [
                'Создан интерактивный дашборд с ключевыми метриками продаж',
                'Выявлены сезонные тренды и пиковые периоды продаж',
                'Подготовлены рекомендации для оптимизации ассортимента'
            ]
        },
        {
            id: 5,
            title: 'Анализ данных и визуализация в крупном интернет-магазине',
            description: 'Дашборд анализа продаж электронной коммерции за период 2007-2025',
            fullDescription: 'Анализ данных и визуализация продаж в крупном интернет-магазине за период 2007-2025. E-commerce. Подготовка дашборда для руководства с анализом продаж.',
            tasks: 'Проанализировать продажи в крупном интернет-магазине за 2007-2025 и подготовить дашборд для руководства.',
            technologies: ['BI', 'Yandex', 'DataLens', 'CSV', 'ClickHouse', 'Data Visualization', 'SQL'],
            category: 'visualization',
            difficulty: 'advanced',
            date: '2025-10-02',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20250928%20ЛБ5%2C%20DataLens%20Dashboard%20—%20Карамин%20С.П.%20РЕШЕНИЕ%20online%20store%20sales%20for%202007-2025----.png',
            link: 'https://datalens.yandex/28ci2emzzssen',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 30,
            status: 'done',
            results: [
                'Проанализировано 18 лет данных о продажах (2007-2025)',
                'Создан комплексный дашборд с динамическими фильтрами',
                'Выявлены долгосрочные тренды и сезонность продаж',
                'Оптимизированы SQL-запросы для работы с большими объемами данных'
            ]
        },
        {
            id: 4,
            title: 'SQL-запросы для анализа транзакций электронной коммерции',
            description: 'Анализ транзакций электронной коммерции с помощью SQL и генерация отчетов',
            fullDescription: 'Анализ транзакций электронной коммерции с использованием SQL-запросов. Включает анализ транзакций и доставку отчета в формате .docx.',
            tasks: 'Проанализировать транзакции электронной коммерции. Доставить отчет в формате .docx.',
            technologies: ['PostgreSQL', 'DBeaver', 'SQL', 'Common Table Expression', 'CTE'],
            category: 'data-analysis',
            difficulty: 'intermediate',
            date: '2025-09-28',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20250928%20ЛБ4.%20E-commerce-transactions-dataset%20—%20РЕШЕНИЕ.%20С.%20П.%20Карамин_page_all---.gif',
            link: 'https://raw.githubusercontent.com/karamin-stanislav/Tasks-Solutions-Data-Analysis/main/20250928%20%D0%9B%D0%914%20E-commerce-transactions-dataset%20%E2%80%94%20%D0%A0%D0%95%D0%A8%D0%95%D0%9D%D0%98%D0%95.%20%D0%A1.%20%D0%9F.%20%D0%9A%D0%B0%D1%80%D0%B0%D0%BC%D0%B8%D0%BD.docx',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 15,
            status: 'done'
        },
        {
            id: 3,
            title: 'Основы статистики в Excel',
            description: 'Комплексный статистический анализ продаж компании за 2021-2023 годы',
            fullDescription: 'Комплексный статистический анализ продаж компании за 2021-2023 годы, включая тренды и гипотезы. Использование теории вероятностей, регрессии, корреляции и визуализации данных.',
            tasks: 'Провести комплексный статистический анализ продаж компании за 2021-2023 годы, выявить тренды и проверить гипотезы.',
            technologies: ['Excel', 'Statistics', 'Probability Theory', 'Hypothesis', 'Regression', 'Correlation', 'Data Visualization', 'Microsoft'],
            category: 'data-analysis',
            difficulty: 'advanced',
            date: '2025-09-26',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20250926%20ЛБ3.%20Excel.%20С.П.%20Карамин%20РЕШЕНИЕ---.gif',
            link: 'https://raw.githubusercontent.com/karamin-stanislav/Tasks-Solutions-Data-Analysis/main/20250926%20%D0%9B%D0%913.%20Excel.%20%D0%A1.%D0%9F.%20%D0%9A%D0%B0%D1%80%D0%B0%D0%BC%D0%B8%D0%BD%20%D0%A0%D0%95%D0%A8%D0%95%D0%9D%D0%98%D0%95.xlsx',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 18,
            status: 'done'
        },
        {
            id: 2,
            title: 'Анализ данных в Jupyter Notebook на Python',
            description: 'Задачи анализа данных с использованием pandas, numpy и matplotlib',
            fullDescription: 'Анализ данных в Jupyter Notebook с использованием Python. Задача 1: создание Series, очистка DataFrame, анализ данных. Задача 2: исследование заемщиков с использованием pandas, numpy, matplotlib.',
            tasks: 'Задача 1: создать Series, очистить DataFrame, проанализировать данные. Задача 2: исследовать заемщиков с использованием pandas, numpy, matplotlib.',
            technologies: ['Anaconda', 'Python', 'Jupyter', 'Pandas', 'Numpy', 'Matplotlib'],
            category: 'data-analysis',
            difficulty: 'intermediate',
            date: '2025-09-15',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20250915%20ЛБ2.%20Основы%20анализа%20данных%20в%20Python.%20РЕШЕНИЕ.%20С.%20П.%20Карамин.%2007.10.2025_page-0001_1_5sek---.gif',
            link: 'https://raw.githubusercontent.com/karamin-stanislav/Tasks-Solutions-Data-Analysis/main/20250915%20%D0%9B%D0%912.%20%D0%9E%D1%81%D0%BD%D0%BE%D0%B2%D1%8B%20%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%20%D0%B2%20Python.%20%D0%A0%D0%95%D0%A8%D0%95%D0%9D%D0%98%D0%95.%20%D0%A1.%20%D0%9F.%20%D0%9A%D0%B0%D1%80%D0%B0%D0%BC%D0%B8%D0%BD.%2007.10.2025.ipynb',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 12,
            status: 'done'
        },
        {
            id: 1,
            title: 'Сбор, обработка и структурирование данных в Jupyter Notebook на Python',
            description: 'Работа с модулями openpyxl и docx для обработки данных',
            fullDescription: 'Сбор, обработка и структурирование данных в Jupyter Notebook с использованием Python. Работа с модулями "openpyxl, docx" для обработки документов.',
            tasks: 'Работа с модулями "openpyxl, docx" в Jupyter notebook для сбора, обработки и структурирования данных.',
            technologies: ['Anaconda', 'Python', 'Jupyter', 'Openpyxl', 'Docx'],
            category: 'data-analysis',
            difficulty: 'beginner',
            date: '2025-09-09',
            image: 'https://raw.githubusercontent.com/KSP-Hub/Tasks-Solutions-Data-Analysis/refs/heads/main/20250909%20ЛБ1.%20Сбор%2C%20обработка%20и%20структурирование%20данных%20С.%20П.%20Карамин%202025%20РЕШЕНИЕ_page_all_1_5sek---.gif',
            link: 'https://raw.githubusercontent.com/karamin-stanislav/Tasks-Solutions-Data-Analysis/main/20250909%20%D0%9B%D0%90%D0%911.%20%D0%A1%D0%B1%D0%BE%D1%80%2C%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0%20%D0%B8%20%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%82%D1%83%D1%80%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%20%D0%A1.%20%D0%9F.%20%D0%9A%D0%B0%D1%80%D0%B0%D0%BC%D0%B8%D0%BD%202025%20%D0%A0%D0%95%D0%A8%D0%95%D0%9D%D0%98%D0%95.ipynb',
            repo: 'https://github.com/KSP-Hub/Tasks-Solutions-Data-Analysis',
            hours: 8,
            status: 'done'
        }
    ];

    // ============================================
    // Projects Filter System
    // ============================================
    
    class ProjectsFilter {
        constructor() {
            this.activeFilters = {
                category: 'all',
                status: 'all',
                technologies: []
            };
            this.debouncedRender = debounce(() => this.renderProjects(), 150);
            this.projectsPerPage = 12; // Количество проектов на странице
            this.currentPage = 1;
        }

        init() {
            this.renderTechFilters();
            this.renderProjects();
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                this.bindEvents();
            });
        }

        renderTechFilters() {
            const techContainer = document.getElementById('tech-filters');
            if (!techContainer) return;

            // Preserve the "Все технологии" tag if it exists
            const allTechTag = techContainer.querySelector('[data-tech="all"]');
            const allTechTagHTML = allTechTag ? allTechTag.outerHTML : '';

            const allTech = new Set();
            projectsData.forEach(project => {
                project.technologies.forEach(tech => allTech.add(tech));
            });

            const sortedTech = Array.from(allTech).sort((a, b) => 
                a.localeCompare(b, undefined, { sensitivity: 'base' })
            );

            // Rebuild container with "Все технологии" first, then other technologies
            techContainer.innerHTML = allTechTagHTML + sortedTech.map(tech => 
                `<div class="tech-tag" data-tech="${escapeHtml(tech.toLowerCase())}" role="button" tabindex="0" aria-label="Filter by ${escapeHtml(tech)}" aria-pressed="false">${escapeHtml(tech)}</div>`
            ).join('');
        }

        bindEvents() {
            // Category filters
            document.querySelectorAll('[data-category]').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleCategoryClick(e.currentTarget);
                });
                tag.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleCategoryClick(e.currentTarget);
                    }
                });
            });

            // Status filters
            document.querySelectorAll('[data-status]').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleStatusClick(e.currentTarget);
                });
                tag.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleStatusClick(e.currentTarget);
                    }
                });
            });

            // Technology filters - event delegation
            const techContainer = document.getElementById('tech-filters');
            if (techContainer) {
                techContainer.addEventListener('click', (e) => {
                    const tag = e.target.closest('[data-tech]');
                    if (tag) {
                        e.preventDefault();
                        this.handleTechClick(tag);
                    }
                });
                techContainer.addEventListener('keydown', (e) => {
                    const tag = e.target.closest('[data-tech]');
                    if (tag && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        this.handleTechClick(tag);
                    }
                });
            }
        }

        handleCategoryClick(tag) {
            document.querySelectorAll('[data-category]').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-pressed', 'false');
            });
            tag.classList.add('active');
            tag.setAttribute('aria-pressed', 'true');
            this.activeFilters.category = tag.dataset.category;
            this.currentPage = 1; // Сброс страницы при изменении фильтра
            this.debouncedRender();
            this.updateFilterStats();
            
            // Track event
            trackEvent('Filters', 'category_filter', tag.dataset.category);
        }

        handleStatusClick(tag) {
            const status = tag.dataset.status;
            
            // Deactivate all status filters
            document.querySelectorAll('[data-status]').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-pressed', 'false');
            });
            
            // Activate the clicked status
            tag.classList.add('active');
            tag.setAttribute('aria-pressed', 'true');
            this.activeFilters.status = status;
            this.currentPage = 1; // Сброс страницы при изменении фильтра
            
            this.debouncedRender();
            this.updateFilterStats();
            
            // Track event
            trackEvent('Filters', 'status_filter', status);
        }

        handleTechClick(tag) {
            const tech = tag.dataset.tech;
            
            // If clicking "all", clear all technologies and activate only "all"
            if (tech === 'all') {
                document.querySelectorAll('[data-tech]').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-pressed', 'false');
                });
                tag.classList.add('active');
                tag.setAttribute('aria-pressed', 'true');
                this.activeFilters.technologies = [];
            } else {
                // Deactivate "all" if it's active
                const allTechTag = document.querySelector('[data-tech="all"]');
                if (allTechTag) {
                    allTechTag.classList.remove('active');
                    allTechTag.setAttribute('aria-pressed', 'false');
                }
                
                // Toggle the clicked technology
                const isActive = tag.classList.contains('active');
                tag.classList.toggle('active');
                tag.setAttribute('aria-pressed', !isActive ? 'true' : 'false');
                
                if (!isActive) {
                    this.activeFilters.technologies.push(tech);
                } else {
                    this.activeFilters.technologies = this.activeFilters.technologies.filter(t => t !== tech);
                }
                
                // If no technologies are selected, activate "all"
                if (this.activeFilters.technologies.length === 0) {
                    if (allTechTag) {
                        allTechTag.classList.add('active');
                        allTechTag.setAttribute('aria-pressed', 'true');
                    }
                }
            }
            
            this.currentPage = 1; // Сброс страницы при изменении фильтра
            this.debouncedRender();
            this.updateFilterStats();
            
            // Track event
            trackEvent('Filters', 'tech_filter', tech);
        }

        filterProjects() {
            const filtered = projectsData.filter(project => {
                // Category filter
                if (this.activeFilters.category !== 'all' && project.category !== this.activeFilters.category) {
                    return false;
                }

                // Status filter
                if (this.activeFilters.status !== 'all') {
                    // Нормализуем статус проекта: приводим к нижнему регистру и обрезаем пробелы
                    const projectStatus = (project.status || 'done').toLowerCase().trim();
                    // Нормализуем фильтр: приводим к нижнему регистру и обрезаем пробелы
                    const filterStatus = this.activeFilters.status.toLowerCase().trim();
                    if (projectStatus !== filterStatus) {
                        return false;
                    }
                }

                // Technology filter
                if (this.activeFilters.technologies.length > 0) {
                    const hasMatchingTech = this.activeFilters.technologies.some(tech => 
                        project.technologies.some(pTech => pTech.toLowerCase().includes(tech))
                    );
                    if (!hasMatchingTech) return false;
                }

                return true;
            });
            
            // Сортировка по дате (новые сверху)
            return filtered.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // От новых к старым
            });
        }

        renderProjects(resetPage = true) {
            const filteredProjects = this.filterProjects();
            const grid = document.getElementById('projects-grid-compact');
            if (!grid) return;

            // Сброс на первую страницу при изменении фильтров (но не при загрузке "Показать еще")
            if (resetPage) {
                this.currentPage = 1;
            }

            // Пагинация: получаем проекты для текущей страницы
            const totalProjects = filteredProjects.length;
            const totalPages = Math.ceil(totalProjects / this.projectsPerPage);
            const startIndex = (this.currentPage - 1) * this.projectsPerPage;
            const endIndex = startIndex + this.projectsPerPage;
            const projectsToShow = filteredProjects.slice(startIndex, endIndex);

            // Если проекты не найдены, показать сообщение
            if (filteredProjects.length === 0) {
                grid.innerHTML = `
                    <div class="no-projects-message" role="alert" aria-live="polite">
                        <i class="fas fa-search" aria-hidden="true"></i>
                        <h3>Проекты не найдены</h3>
                        <p>Попробуйте изменить параметры фильтрации</p>
                    </div>
                `;
                this.renderPagination(0, 0);
                hideLoadingIndicator();
                return;
            }

            grid.innerHTML = projectsToShow.map(project => {
                const title = escapeHtml(project.title);
                const desc = escapeHtml(project.description);
                const tech = project.technologies.map(t => escapeHtml(t));
                const hasHours = project.hours && project.hours > 0;
                // Нормализуем статус: приводим к нижнему регистру
                const status = (project.status || 'done').toLowerCase().trim();
                // Для CSS классов используем статус как есть (без пробелов)
                const statusClass = `status-${status}`;
                const statusMap = {
                    'backlog': 'Backlog',
                    'ongoing': 'Ongoing',
                    'done': 'Done'
                };
                const statusText = statusMap[status] || 'Done';
                
                return `
                    <div class="project-card-compact ${statusClass}" 
                         data-project-id="${project.id}"
                         onclick="openProjectModal(${project.id})" 
                         role="button" 
                         tabindex="0" 
                         aria-label="View project details: ${title}"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProjectModal(${project.id})}">
                        <div class="project-header-mini">
                            <h3 class="project-title-mini">${title}</h3>
                            <div class="project-meta-header">
                                <div class="project-status-mini status-${status}" title="${statusText}"><span>${statusText}</span></div>
                                ${hasHours ? `<div class="project-hours-mini" title="Человеко-часы"><i class="fas fa-clock" aria-hidden="true"></i><span>${project.hours} ч</span></div>` : ''}
                            </div>
                        </div>
                        <div class="project-tech-mini">
                            ${tech.slice(0, 3).map(t => `<span class="tech-badge-mini">${t}</span>`).join('')}
                            ${tech.length > 3 ? `<span class="tech-badge-mini">+${tech.length - 3}</span>` : ''}
                        </div>
                        <div class="project-preview-mini">${desc}</div>
                        <div class="project-meta-mini">
                            <div class="project-date-mini">${new Date(project.date).toLocaleDateString('ru-RU')}</div>
                            <div class="project-id-views-group">
                                <div class="project-id-badge" title="Project ID">No. ${project.id}</div>
                                <div class="project-views-mini" title="Количество просмотров">
                                    <i class="fas fa-eye" aria-hidden="true"></i>
                                    <span data-views-count="${project.id}">${getProjectViews(project.id)}</span>
                                </div>
                            </div>
                            <div class="click-hint">Click for details →</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Announce to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Showing ${projectsToShow.length} of ${totalProjects} project${totalProjects !== 1 ? 's' : ''}`;
            grid.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);

            // Рендеринг пагинации
            this.renderPagination(totalProjects, totalPages);
            
            // Hide loading indicator
            hideLoadingIndicator();
            
            // КРИТИЧНО: Нормализуем данные ПЕРЕД обновлением счетчиков
            // Это гарантирует, что мы работаем с правильными данными
            normalizeProjectViewsData();
            
            // Обновляем счетчики просмотров в карточках после рендеринга
            // Используем requestAnimationFrame + setTimeout для гарантии, что DOM полностью обновлен
            // Это гарантирует, что счетчики всегда отображают актуальные значения из localStorage
            requestAnimationFrame(() => {
                setTimeout(() => {
                    updateProjectViewsInCards();
                }, 0);
            });
        }

        renderPagination(totalProjects, totalPages) {
            // Удаляем старую пагинацию, если есть
            const oldPagination = document.getElementById('projects-pagination');
            if (oldPagination) {
                oldPagination.remove();
            }

            // Если проектов меньше или равно projectsPerPage, пагинация не нужна
            if (totalProjects <= this.projectsPerPage) {
                return;
            }

            const grid = document.getElementById('projects-grid-compact');
            if (!grid || !grid.parentElement) return;

            const pagination = document.createElement('div');
            pagination.id = 'projects-pagination';
            pagination.className = 'projects-pagination';
            pagination.setAttribute('role', 'navigation');
            pagination.setAttribute('aria-label', 'Навигация по страницам проектов');

            const hasMore = this.currentPage < totalPages;
            
            if (hasMore) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.textContent = `Показать еще (${totalProjects - (this.currentPage * this.projectsPerPage)} из ${totalProjects})`;
                loadMoreBtn.setAttribute('aria-label', `Загрузить еще ${this.projectsPerPage} проектов`);
                loadMoreBtn.onclick = () => this.loadMoreProjects();
                pagination.appendChild(loadMoreBtn);
            }

            // Информация о странице
            const pageInfo = document.createElement('div');
            pageInfo.className = 'pagination-info';
            pageInfo.textContent = `Показано ${Math.min(this.currentPage * this.projectsPerPage, totalProjects)} из ${totalProjects} проектов`;
            pagination.appendChild(pageInfo);

            grid.parentElement.insertBefore(pagination, grid.nextSibling);
        }

        loadMoreProjects() {
            const filteredProjects = this.filterProjects();
            const totalProjects = filteredProjects.length;
            const totalPages = Math.ceil(totalProjects / this.projectsPerPage);

            if (this.currentPage >= totalPages) return;

            this.currentPage++;
            const startIndex = (this.currentPage - 1) * this.projectsPerPage;
            const endIndex = startIndex + this.projectsPerPage;
            const projectsToAdd = filteredProjects.slice(startIndex, endIndex);

            const grid = document.getElementById('projects-grid-compact');
            if (!grid) return;

            // Добавляем новые проекты к существующим
            const newProjectsHTML = projectsToAdd.map(project => {
                const title = escapeHtml(project.title);
                const desc = escapeHtml(project.description);
                const tech = project.technologies.map(t => escapeHtml(t));
                const hasHours = project.hours && project.hours > 0;
                // Нормализуем статус: приводим к нижнему регистру
                const status = (project.status || 'done').toLowerCase().trim();
                // Для CSS классов используем статус как есть (без пробелов)
                const statusClass = `status-${status}`;
                const statusMap = {
                    'backlog': 'Backlog',
                    'ongoing': 'Ongoing',
                    'done': 'Done'
                };
                const statusText = statusMap[status] || 'Done';
                
                return `
                    <div class="project-card-compact ${statusClass}" 
                         data-project-id="${project.id}"
                         onclick="openProjectModal(${project.id})" 
                         role="button" 
                         tabindex="0" 
                         aria-label="View project details: ${title}"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProjectModal(${project.id})}">
                        <div class="project-header-mini">
                            <h3 class="project-title-mini">${title}</h3>
                            <div class="project-meta-header">
                                <div class="project-status-mini status-${status}" title="${statusText}"><span>${statusText}</span></div>
                                ${hasHours ? `<div class="project-hours-mini" title="Человеко-часы"><i class="fas fa-clock" aria-hidden="true"></i><span>${project.hours} ч</span></div>` : ''}
                            </div>
                        </div>
                        <div class="project-tech-mini">
                            ${tech.slice(0, 3).map(t => `<span class="tech-badge-mini">${t}</span>`).join('')}
                            ${tech.length > 3 ? `<span class="tech-badge-mini">+${tech.length - 3}</span>` : ''}
                        </div>
                        <div class="project-preview-mini">${desc}</div>
                        <div class="project-meta-mini">
                            <div class="project-date-mini">${new Date(project.date).toLocaleDateString('ru-RU')}</div>
                            <div class="project-id-views-group">
                                <div class="project-id-badge" title="Project ID">No. ${project.id}</div>
                                <div class="project-views-mini" title="Количество просмотров">
                                    <i class="fas fa-eye" aria-hidden="true"></i>
                                    <span data-views-count="${project.id}">${getProjectViews(project.id)}</span>
                                </div>
                            </div>
                            <div class="click-hint">Click for details →</div>
                        </div>
                    </div>
                `;
            }).join('');

            grid.insertAdjacentHTML('beforeend', newProjectsHTML);

            // КРИТИЧНО: Обновляем счетчики просмотров в новых карточках
            // Нормализуем данные и обновляем отображение для гарантии единого подсчета
            // Используем requestAnimationFrame + setTimeout для гарантии, что DOM полностью обновлен
            // Нормализация происходит внутри updateProjectViewsInCards()
            requestAnimationFrame(() => {
                setTimeout(() => {
                    updateProjectViewsInCards();
                }, 0);
            });

            // Обновляем пагинацию
            this.renderPagination(totalProjects, totalPages);

            // Обновляем статистику
            this.updateFilterStats();

            // Плавная прокрутка к новым проектам
            const newProjects = grid.querySelectorAll('.project-card-compact');
            if (newProjects.length > 0) {
                const firstNewProject = newProjects[newProjects.length - projectsToAdd.length];
                if (firstNewProject) {
                    firstNewProject.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }

        updateFilterStats() {
            const stats = document.getElementById('filter-stats');
            if (!stats) return;

            const filteredCount = this.filterProjects().length;
            const totalCount = projectsData.length;
            const shownCount = Math.min(this.currentPage * this.projectsPerPage, filteredCount);
            
            // Убираем класс error если он был
            stats.classList.remove('error');
            
            if (filteredCount === 0) {
                stats.textContent = `Проекты не найдены`;
                stats.classList.add('show', 'error');
                stats.setAttribute('aria-live', 'assertive');
            } else if (filteredCount === totalCount && shownCount >= filteredCount) {
                stats.textContent = `Всего проектов: ${totalCount}`;
                stats.classList.add('show');
                stats.setAttribute('aria-live', 'polite');
            } else if (shownCount >= filteredCount) {
                stats.textContent = `Найдено: ${filteredCount} из ${totalCount}`;
                stats.classList.add('show');
                stats.setAttribute('aria-live', 'polite');
            } else {
                stats.textContent = `Показано: ${shownCount} из ${filteredCount} (всего: ${totalCount})`;
                stats.classList.add('show');
                stats.setAttribute('aria-live', 'polite');
            }
        }
    }

    // ============================================
    // Modal Functions
    // ============================================
    
    window.openProjectModal = function(projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found:', projectId);
            return;
        }
        
        // Увеличиваем счетчик просмотров
        incrementProjectViews(projectId);
        
        const modal = document.getElementById('projectModal');
        if (!modal) return;
        
        try {
            // Fill modal data
            const titleEl = document.getElementById('project-modal-title');
            const descEl = document.getElementById('project-modal-desc');
            const tasksEl = document.getElementById('project-modal-tasks');
            const dateEl = document.getElementById('project-modal-date');
            const categoryEl = document.getElementById('project-modal-category');
            const techCountEl = document.getElementById('project-modal-tech-count');
            const linkEl = document.getElementById('project-modal-link');
            
            // Category mapping
            const categoryMap = {
                'data-analysis': 'Анализ данных',
                'visualization': 'Визуализация',
                'web': 'Веб-разработка',
                'cv': 'Компьютерное зрение',
                'dl': 'Глубокое обучение',
                'ai': 'Искусственный интеллект'
            };
            
            // Difficulty mapping
            const difficultyMap = {
                'beginner': 'Начальный',
                'intermediate': 'Средний',
                'advanced': 'Высокий',
                'высокая': 'Высокая',
                'средняя': 'Средняя',
                'низкая': 'Низкая',
                'начальный': 'Начальный',
                'средний': 'Средний',
                'высокий': 'Высокий'
            };
            
            if (titleEl) titleEl.textContent = project.title;
            if (descEl) descEl.textContent = project.fullDescription;
            if (tasksEl) tasksEl.textContent = project.tasks;
            if (dateEl) dateEl.textContent = new Date(project.date).toLocaleDateString('ru-RU');
            if (categoryEl) categoryEl.textContent = categoryMap[project.category] || project.category;
            if (techCountEl) techCountEl.textContent = project.technologies.length;
            
            // Difficulty section
            const difficultyEl = document.getElementById('project-modal-difficulty');
            if (difficultyEl) {
                if (project.difficulty && project.difficulty.trim() !== '') {
                    difficultyEl.textContent = difficultyMap[project.difficulty.toLowerCase()] || project.difficulty;
                } else {
                    difficultyEl.textContent = 'н/д';
                }
            }
            
            // Hours section
            const hoursEl = document.getElementById('project-modal-hours');
            if (hoursEl) {
                if (project.hours && project.hours > 0) {
                    hoursEl.textContent = project.hours;
                } else {
                    hoursEl.textContent = 'н/д';
                }
            }
            
            if (linkEl) {
                if (project.link && project.link.trim() !== '') {
                linkEl.href = project.link;
                    linkEl.classList.remove('project-link-hidden');
                linkEl.setAttribute('aria-label', `Open project: ${project.title}`);
                } else {
                    linkEl.classList.add('project-link-hidden');
                }
            }
            
            // Repo link
            const repoEl = document.getElementById('project-modal-repo');
            if (repoEl) {
                if (project.repo && project.repo.trim() !== '') {
                    repoEl.href = project.repo;
                    repoEl.classList.remove('project-link-hidden');
                    repoEl.setAttribute('aria-label', `View repository: ${project.title}`);
                } else {
                    repoEl.classList.add('project-link-hidden');
                }
            }
            
            // Image handling
            const imageEl = document.getElementById('project-modal-image');
            if (imageEl) {
                if (project.image && project.image.trim() !== '') {
                    imageEl.src = project.image;
                    imageEl.alt = project.title;
                    imageEl.classList.remove('project-link-hidden');
                } else {
                    imageEl.classList.add('project-link-hidden');
                }
            }
            
            // Results section
            const resultsSection = document.getElementById('project-modal-results-section');
            const resultsList = document.getElementById('project-modal-results');
            if (project.results && Array.isArray(project.results) && project.results.length > 0) {
                if (resultsList) {
                    resultsList.innerHTML = project.results.map(result => 
                        `<li class="result-item">
                            <i class="fas fa-check-circle result-icon" aria-hidden="true"></i>
                            <span class="result-text">${escapeHtml(result)}</span>
                        </li>`
                    ).join('');
                }
                if (resultsSection) {
                    resultsSection.classList.remove('modal-section-hidden');
                    resultsSection.classList.add('modal-section-visible');
                }
            } else {
                if (resultsSection) {
                    resultsSection.classList.add('modal-section-hidden');
                    resultsSection.classList.remove('modal-section-visible');
                }
            }
            
            // Features section
            const featuresSection = document.getElementById('project-modal-features-section');
            const featuresList = document.getElementById('project-modal-features');
            if (project.features && Array.isArray(project.features) && project.features.length > 0) {
                if (featuresList) {
                    featuresList.innerHTML = project.features.map(feature => 
                        `<li>${escapeHtml(feature)}</li>`
                    ).join('');
                }
                if (featuresSection) {
                    featuresSection.classList.remove('modal-section-hidden');
                    featuresSection.classList.add('modal-section-visible');
                }
            } else {
                if (featuresSection) {
                    featuresSection.classList.add('modal-section-hidden');
                    featuresSection.classList.remove('modal-section-visible');
                }
            }
            
            // Metrics section
            const metricsSection = document.getElementById('project-modal-metrics-section');
            const metricsText = document.getElementById('project-modal-metrics');
            if (project.metrics) {
                // Use custom metrics if provided
                if (metricsText) {
                    metricsText.textContent = project.metrics;
                }
                if (metricsSection) {
                    metricsSection.classList.remove('modal-section-hidden');
                    metricsSection.classList.add('modal-section-visible');
                }
            } else if (project.results && Array.isArray(project.results) && project.results.length > 0) {
                // Auto-generate metrics based on results count
                if (metricsText) {
                    metricsText.textContent = `Проект включает ${project.results.length} ключевых результата, демонстрирующих измеримое воздействие на бизнес-процессы и пользовательский опыт.`;
                }
                if (metricsSection) {
                    metricsSection.classList.remove('modal-section-hidden');
                    metricsSection.classList.add('modal-section-visible');
                }
            } else {
                if (metricsSection) {
                    metricsSection.classList.add('modal-section-hidden');
                    metricsSection.classList.remove('modal-section-visible');
                }
            }
            
            // Technologies in header
            const techEl = document.getElementById('project-modal-tech');
            if (techEl) {
                techEl.innerHTML = project.technologies.map(tech => 
                    `<span class="tech-badge-mini" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">${escapeHtml(tech)}</span>`
                ).join('');
            }
            
            // Image with improved error handling and lazy loading
            const modalImage = document.getElementById('project-modal-image');
            if (modalImage) {
                if (project.image && project.image.trim() !== '') {
                    // Use lazy loading for modal images (GIF support)
                    setupLazyImage(modalImage, project.image, project.title);
                modalImage.onclick = () => openImageModal(project.image, project.title);
                    modalImage.style.display = 'block';
                    modalImage.style.cursor = 'pointer';
                    modalImage.title = 'Нажмите для просмотра в полном размере';
                } else {
                    modalImage.style.display = 'none';
                }
            }
            
            // Repository link
            const repoLink = document.getElementById('project-modal-repo');
            if (repoLink) {
                if (project.repo && project.repo.trim() !== '' && project.repo !== project.link) {
                    repoLink.href = project.repo;
                    repoLink.style.display = 'flex';
                    repoLink.setAttribute('aria-label', `View source code for ${project.title}`);
                } else {
                    repoLink.style.display = 'none';
                }
            }
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus trap for accessibility
            trapFocus(modal);
            
            // Focus management for accessibility
            const closeBtn = document.getElementById('project-modal-close');
            if (closeBtn) {
                closeBtn.focus();
            }
            
            // Update ARIA attributes
            modal.setAttribute('aria-hidden', 'false');
            
            // Track event
            trackEvent('Projects', 'open_modal', project.title);
        } catch (error) {
            console.error('Error opening project modal:', error);
            showNotification('Ошибка при открытии проекта. Попробуйте еще раз.', 'error');
        }
    };

    function closeProjectModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            // Remove focus trap
            removeFocusTrap();
            
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Track event
            trackEvent('Projects', 'close_modal', '');
        }
    }

    // ============================================
    // Image Modal Functions
    // ============================================
    
    function openImageModal(imageSrc, imageTitle) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        const modalCaption = document.getElementById('modal-caption');
        
        if (!modal || !modalImg) return;
        
        modalImg.src = imageSrc;
        modalImg.alt = imageTitle || 'Project preview';
        if (modalCaption) modalCaption.textContent = imageTitle || '';
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Error handling
        modalImg.onerror = function() {
            this.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
            this.alt = 'Image not available';
        };
        
        // Focus management
        const closeBtn = document.getElementById('modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeImageModal() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // ============================================
    // Scroll Reveal Animation
    // ============================================
    
    function initScrollReveal() {
        const sections = document.querySelectorAll('section.reveal');
        if (!sections.length) return;

        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            sections.forEach(s => s.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            rootMargin: '0px 0px -10% 0px', 
            threshold: 0.1 
        });

        sections.forEach(section => observer.observe(section));
    }

    // ============================================
    // Analytics Consent Management
    // ============================================
    
    function initAnalyticsConsent() {
        const GA_ID = 'G-RRWNG4DZE1';

        function showBanner() {
            const banner = document.getElementById('consent-banner');
            if (banner) {
                banner.style.display = 'block';
                banner.setAttribute('aria-hidden', 'false');
            }
        }

        function hideBanner() {
            const banner = document.getElementById('consent-banner');
            if (banner) {
                banner.style.display = 'none';
                banner.setAttribute('aria-hidden', 'true');
            }
        }

        function loadGA() {
            try {
                const s = document.createElement('script');
                s.async = true;
                s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
                document.head.appendChild(s);
                
                window.dataLayer = window.dataLayer || [];
                function gtag() { 
                    window.dataLayer.push(arguments); 
                }
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', GA_ID);
            } catch(e) {
                console.error('Error loading Google Analytics:', e);
            }
        }

        function initConsent() {
            const stored = localStorage.getItem('analyticsConsent');
            if (stored === 'accepted') {
                loadGA();
                return;
            }
            if (stored === 'declined') {
                return;
            }
            showBanner();
            
            const accept = document.getElementById('consent-accept');
            const decline = document.getElementById('consent-decline');
            
            if (accept) {
                accept.addEventListener('click', () => {
                    localStorage.setItem('analyticsConsent', 'accepted');
                    hideBanner();
                    loadGA();
                });
            }
            
            if (decline) {
                decline.addEventListener('click', () => {
                    localStorage.setItem('analyticsConsent', 'declined');
                    hideBanner();
                });
            }
        }

        initConsent();
    }

    // ============================================
    // Analytics Stats (Optional)
    // ============================================
    // NOTE: This feature requires a backend API endpoint to fetch analytics data.
    // For a static GitHub Pages site, you would need to:
    // 1. Set up a backend API (e.g., serverless function) that queries Google Analytics/Yandex.Metrica APIs
    // 2. Update GA_STATS_ENDPOINT with your API endpoint URL
    // 3. Ensure the API returns JSON in format: { totalUsers, sessions, pageviews }
    // Currently disabled because no backend endpoint is configured.
    
    function initAnalyticsStats() {
        // ============================================
        // Analytics API Endpoint Configuration
        // ============================================
        // INSTRUCTIONS FOR CONFIGURING ANALYTICS API:
        // 
        // For a static GitHub Pages site, you need to set up a backend API endpoint:
        // 
        // Option 1: Serverless Function (Recommended)
        //   - Use services like Vercel, Netlify Functions, or AWS Lambda
        //   - Create an API endpoint that queries Google Analytics/Yandex.Metrica APIs
        //   - The endpoint should return JSON in format: 
        //     {
        //       "yandex": { "visitors": 0, "views": 0, "totalUsers": 0 },
        //       "google": { "users": 0, "sessions": 0, "pageviews": 0 }
        //     }
        // 
        // Option 2: Third-party Analytics Service
        //   - Use services like Plausible, Simple Analytics, or similar
        //   - Configure their API endpoint here
        // 
        // Option 3: Manual Updates
        //   - Leave endpoint empty and update stats manually in HTML if needed
        // 
        // Example endpoint URL:
        //   const GA_STATS_ENDPOINT = 'https://your-api.vercel.app/api/analytics/stats';
        //   const GA_STATS_ENDPOINT = 'https://your-api.netlify.app/.netlify/functions/analytics';
        // 
        // SECURITY NOTE:
        //   - Never expose API keys or authentication tokens in client-side code
        //   - Use environment variables in your backend/serverless function
        //   - Implement rate limiting and CORS properly on your backend
        // 
        // CURRENT STATUS: Disabled (no endpoint configured)
        // ============================================
        const GA_STATS_ENDPOINT = '';
        
        async function updateMonthly() {
            if (!GA_STATS_ENDPOINT) {
                // Feature disabled - no endpoint configured
                // To enable: set GA_STATS_ENDPOINT to your analytics API endpoint URL
                return;
            }
            
            try {
                const res = await fetch(GA_STATS_ENDPOINT, { 
                    cache: 'no-store',
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (!res.ok) {
                    console.warn('Analytics API request failed:', res.status, res.statusText);
                    return;
                }
                
                const data = await res.json();
                const totalUsers = data.totalUsers ?? null;
                const sessions = data.sessions ?? null;
                const views = data.pageviews ?? sessions;

                const set = (id, val) => {
                    const el = document.getElementById(id);
                    if (el && val != null) el.textContent = String(val);
                };
                
                set('ga-users', totalUsers);
                set('ga-views', views);
                set('ga-total-users', totalUsers);
                set('ym-visitors', totalUsers);
                set('ym-views', views);
                set('ym-total-users', totalUsers);
            } catch(e) {
                // Silently fail - stats are optional
            }
        }

        updateMonthly();
        setInterval(updateMonthly, 300000); // Update every 5 minutes
    }

    // ============================================
    // Projects Hours Statistics
    // ============================================
    
    function updateTotalHours() {
        const totalHours = projectsData.reduce((sum, project) => {
            return sum + (project.hours || 0);
        }, 0);
        
        const hoursElement = document.getElementById('total-hours');
        if (hoursElement) {
            hoursElement.textContent = totalHours;
        }
    }

    // ============================================
    // Project Views Counter (КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ)
    // ============================================
    
    // Единый ключ для хранения счетчиков просмотров в localStorage
    // КРИТИЧНО: Используется ОДИНАКОВЫЙ ключ для ВСЕХ тем - это гарантирует единый подсчет
    // НЕ создавать отдельные ключи для светлой/темной темы!
    const PROJECT_VIEWS_KEY = 'portfolio_project_views';
    
    /**
     * Нормализовать и очистить данные просмотров в localStorage
     * КРИТИЧНО: JSON.stringify всегда конвертирует ключи в строки, поэтому используем строковые ключи
     * Нормализует все ключи в строковый формат для гарантии единого подсчета для всех тем
     */
    function normalizeProjectViewsData() {
        try {
            // Нормализуем данные просмотров
            const views = localStorage.getItem(PROJECT_VIEWS_KEY);
            if (views) {
                try {
                    const viewsObj = JSON.parse(views);
                    const normalizedViews = {};
                    
                    // Проходим по всем ключам и нормализуем их
                    // КРИТИЧНО: JSON всегда использует строковые ключи, поэтому нормализуем к строкам
                    for (const key in viewsObj) {
                        if (viewsObj.hasOwnProperty(key)) {
                            const numKey = parseInt(key, 10);
                            if (!isNaN(numKey) && numKey > 0) {
                                // Используем строковый ключ (так как JSON всегда строки)
                                const keyStr = String(numKey);
                                const value = viewsObj[key];
                                
                                // Нормализуем значение - должно быть числом >= 0
                                if (typeof value === 'number' && value >= 0) {
                                    normalizedViews[keyStr] = value;
                                } else if (typeof value === 'string') {
                                    const parsedValue = parseInt(value, 10);
                                    if (!isNaN(parsedValue) && parsedValue >= 0) {
                                        normalizedViews[keyStr] = parsedValue;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Сохраняем нормализованные данные (все ключи - строки)
                    localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify(normalizedViews));
                } catch (e) {
                    console.warn('Error normalizing views data, resetting:', e);
                    localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify({}));
                }
            } else {
                // Если данных нет, инициализируем пустой объект
                localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify({}));
            }
        } catch (e) {
            console.error('Error normalizing project views data:', e);
        }
    }
    
    /**
     * Инициализация счетчика просмотров (вызывается один раз при загрузке)
     * КРИТИЧНО: Использует единый ключ localStorage для всех тем, гарантирует единый подсчет
     * Счетчик увеличивается при каждом открытии модального окна (все просмотры учитываются)
     */
    function initProjectViews() {
        try {
            // КРИТИЧНО: Нормализуем данные ПЕРЕД инициализацией
            // Это удаляет дублирующиеся ключи и гарантирует единый подсчет для всех тем
            normalizeProjectViewsData();
            
            // Инициализируем объект просмотров в localStorage, если его нет
            if (!localStorage.getItem(PROJECT_VIEWS_KEY)) {
                localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify({}));
            }
            
            // КРИТИЧНО: Слушатель событий storage для синхронизации между вкладками
            // Это гарантирует, что при изменении данных в другой вкладке счетчики обновляются
            // НО: событие storage НЕ срабатывает в той же вкладке, где произошло изменение
            // Поэтому мы также вызываем updateProjectViewsInCards() после каждого изменения
            window.addEventListener('storage', (e) => {
                if (e.key === PROJECT_VIEWS_KEY) {
                    // Нормализуем данные при изменении из другой вкладки
                    normalizeProjectViewsData();
                    // Обновляем счетчики в карточках
                    updateProjectViewsInCards();
                }
            });
            
            // КРИТИЧНО: Обновляем счетчики при возврате фокуса на страницу
            // Это гарантирует синхронизацию, если данные были изменены в другой вкладке
            window.addEventListener('focus', () => {
                normalizeProjectViewsData();
                updateProjectViewsInCards();
            });
            
            // Обновляем счетчики в карточках при инициализации
            // Используем setTimeout для гарантии, что DOM полностью загружен
            // Это важно, так как проекты могут быть отрендерены после инициализации
            setTimeout(() => {
                updateProjectViewsInCards();
            }, 100);
        } catch (e) {
            console.error('Error initializing project views:', e);
        }
    }
    
    /**
     * Получить количество просмотров проекта
     * КРИТИЧНО: JSON всегда использует строковые ключи, поэтому используем строковый ключ для доступа
     * Это гарантирует единый подсчет для всех тем
     * @param {number} projectId - ID проекта
     * @returns {number} Количество просмотров
     */
    function getProjectViews(projectId) {
        try {
            // Нормализуем projectId (всегда число, но для ключа используем строку)
            projectId = parseInt(projectId, 10);
            if (isNaN(projectId) || projectId <= 0) {
                return 0;
            }
            
            // Получаем данные из localStorage (единственный источник истины, работает одинаково для всех тем)
            const views = localStorage.getItem(PROJECT_VIEWS_KEY);
            if (!views) {
                return 0;
            }
            
            let viewsObj = {};
            try {
                viewsObj = JSON.parse(views);
            } catch (e) {
                console.warn('Error parsing views from localStorage:', e);
                // Если данные повреждены, нормализуем их
                normalizeProjectViewsData();
                return 0;
            }
            
            // КРИТИЧНО: JSON всегда использует строковые ключи, поэтому используем строковый ключ
            // Это гарантирует единый подсчет для всех тем
            const keyStr = String(projectId);
            const count = viewsObj[keyStr];
            
            // Если значение не найдено, возвращаем 0
            if (count === undefined || count === null) {
                return 0;
            }
            
            // Убеждаемся, что возвращаем число, а не строку
            if (typeof count === 'number') {
                return count >= 0 ? count : 0;
            }
            
            // Пытаемся преобразовать строку в число (на случай, если данные не нормализованы)
            const parsedCount = parseInt(count, 10);
            if (!isNaN(parsedCount) && parsedCount >= 0) {
                // Если получилось преобразовать, нормализуем данные для будущего
                try {
                    viewsObj[keyStr] = parsedCount;
                    localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify(viewsObj));
                } catch (e) {
                    console.warn('Error saving normalized views:', e);
                }
                return parsedCount;
            }
            
            return 0;
        } catch (e) {
            console.warn('Error reading project views:', e);
            return 0;
        }
    }
    
    /**
     * Обновить счетчики просмотров во всех карточках проектов на странице
     * КРИТИЧНО: Синхронизирует отображение счетчиков с данными из localStorage
     * Вызывается после рендеринга проектов и после увеличения счетчика
     * Гарантирует единое отображение для всех тем
     */
    function updateProjectViewsInCards() {
        try {
            // КРИТИЧНО: Нормализуем данные ПЕРЕД обновлением отображения (только один раз)
            // Это гарантирует, что мы работаем с правильными данными
            normalizeProjectViewsData();
            
            // Находим все элементы со счетчиками просмотров
            const viewsSpans = document.querySelectorAll('[data-views-count]');
            
            if (viewsSpans.length === 0) {
                // Если элементов нет, это нормально (например, при первой загрузке или когда проекты не отображены)
                return;
            }
            
            // КРИТИЧНО: Получаем данные из localStorage один раз для всех элементов
            // Это гарантирует единый источник истины и предотвращает рассинхронизацию
            const views = localStorage.getItem(PROJECT_VIEWS_KEY);
            let viewsObj = {};
            if (views) {
                try {
                    viewsObj = JSON.parse(views);
                } catch (e) {
                    console.warn('Error parsing views in updateProjectViewsInCards:', e);
                    return;
                }
            }
            
            // Обновляем каждый элемент используя одни и те же данные
            viewsSpans.forEach(span => {
                try {
                    const projectIdStr = span.getAttribute('data-views-count');
                    if (!projectIdStr) {
                        return;
                    }
                    
                    const projectId = parseInt(projectIdStr, 10);
                    if (isNaN(projectId) || projectId <= 0) {
                        return;
                    }
                    
                    // КРИТИЧНО: Используем строковый ключ (так как JSON всегда строки)
                    // Это гарантирует единый подсчет для всех тем
                    const keyStr = String(projectId);
                    const count = viewsObj[keyStr];
                    
                    // Получаем значение (число или 0)
                    const views = (count !== undefined && count !== null) ? 
                        (typeof count === 'number' ? count : parseInt(count, 10) || 0) : 0;
                    
                    // Обновляем текст счетчика ВСЕГДА (для гарантии синхронизации)
                    // Это важно, так как данные могли измениться из другого контекста (тема, вкладка и т.д.)
                    const newText = String(views);
                    span.textContent = newText;
                } catch (e) {
                    // Игнорируем ошибки для отдельных элементов, продолжаем обработку остальных
                    console.warn('Error updating view count for span:', e);
                }
            });
        } catch (e) {
            console.warn('Error updating project views in cards:', e);
            // В случае ошибки пытаемся нормализовать данные
            try {
                normalizeProjectViewsData();
            } catch (normalizeError) {
                console.error('Error normalizing data in updateProjectViewsInCards:', normalizeError);
            }
        }
    }
    
    /**
     * Увеличить счетчик просмотров проекта
     * КРИТИЧНО: Использует единый ключ localStorage для всех тем, считает ВСЕ просмотры (не уникальные)
     * Каждое открытие модального окна увеличивает счетчик на 1
     * @param {number} projectId - ID проекта
     */
    function incrementProjectViews(projectId) {
        try {
            // Нормализуем projectId (всегда число)
            projectId = parseInt(projectId, 10);
            if (isNaN(projectId) || projectId <= 0) {
                console.warn('Invalid projectId in incrementProjectViews:', projectId);
                return;
            }
            
            // КРИТИЧНО: Нормализуем данные ПЕРЕД увеличением счетчика
            // Это гарантирует, что мы работаем с правильными данными
            normalizeProjectViewsData();
            
            // Получаем текущее количество просмотров из localStorage
            const currentCount = getProjectViews(projectId);
            
            // Увеличиваем счетчик на 1 (каждый просмотр считается)
            const newCount = currentCount + 1;
            
            // Сохраняем обновленное количество просмотров в localStorage
            // Получаем текущие данные из localStorage (единственный источник истины)
            const views = localStorage.getItem(PROJECT_VIEWS_KEY);
            let viewsObj = {};
            if (views) {
                try {
                    viewsObj = JSON.parse(views);
                } catch (e) {
                    console.warn('Error parsing views from localStorage, resetting:', e);
                    viewsObj = {};
                }
            }
            
            // КРИТИЧНО: JSON всегда использует строковые ключи, поэтому используем строковый ключ
            // Это гарантирует единый подсчет для всех тем (светлая и темная используют один ключ)
            const keyStr = String(projectId);
            viewsObj[keyStr] = newCount;
            
            // Удаляем ВСЕ дублирующиеся ключи (если есть разные варианты записи)
            // Это важно для предотвращения дублирования данных
            for (const key in viewsObj) {
                if (viewsObj.hasOwnProperty(key)) {
                    // Если это другой вариант записи того же projectId, удаляем его
                    if (key !== keyStr && parseInt(key, 10) === projectId) {
                        delete viewsObj[key];
                    }
                }
            }
            
            // Сохраняем в localStorage (работает одинаково для всех тем)
            localStorage.setItem(PROJECT_VIEWS_KEY, JSON.stringify(viewsObj));
            
            // КРИТИЧНО: Нормализуем данные ПОСЛЕ сохранения
            // Это гарантирует, что данные всегда в правильном формате
            normalizeProjectViewsData();
            
            // Обновляем счетчик в карточках проектов на странице
            // Используем requestAnimationFrame для гарантии, что DOM готов и обновлен
            requestAnimationFrame(() => {
                setTimeout(() => {
                    updateProjectViewsInCards();
                }, 0);
            });
        } catch (e) {
            console.error('Error incrementing project views:', e);
            // В случае ошибки нормализуем данные и пытаемся обновить отображение
            try {
                normalizeProjectViewsData();
                updateProjectViewsInCards();
            } catch (updateError) {
                console.error('Error updating project views in cards:', updateError);
            }
        }
    }
    
    // ============================================
    // Error Handling & Notifications
    // ============================================
    
    /**
     * Показать уведомление об ошибке пользователю
     * @param {string} message - Сообщение об ошибке
     * @param {string} type - Тип уведомления ('error', 'warning', 'info')
     */
    function showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Показать уведомление
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Скрыть и удалить через 5 секунд
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    /**
     * Валидация данных проекта
     * @param {Object} project - Объект проекта
     * @returns {Object} Результат валидации {valid: boolean, errors: string[]}
     */
    function validateProjectData(project) {
        const errors = [];
        const required = ['id', 'title', 'description', 'technologies', 'category', 'date'];
        
        // Проверка обязательных полей
        required.forEach(field => {
            if (!project.hasOwnProperty(field) || !project[field]) {
                errors.push(`Отсутствует обязательное поле: ${field}`);
            }
        });
        
        // Проверка типов
        if (project.id && typeof project.id !== 'number') {
            errors.push('Поле id должно быть числом');
        }
        if (project.technologies && !Array.isArray(project.technologies)) {
            errors.push('Поле technologies должно быть массивом');
        }
        if (project.date && !/^\d{4}-\d{2}-\d{2}$/.test(project.date)) {
            errors.push('Поле date должно быть в формате YYYY-MM-DD');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // ============================================
    // Analytics Tracking
    // ============================================
    
    /**
     * Отслеживание событий для аналитики
     * @param {string} category - Категория события
     * @param {string} action - Действие
     * @param {string} label - Метка события
     */
    function trackEvent(category, action, label) {
        try {
            // Google Analytics
            if (window.gtag) {
                gtag('event', action, {
                    'event_category': category,
                    'event_label': label
                });
            }
            
            // Yandex Metrika
            if (window.ym) {
                ym('ea9e94e7d4dc4023b0b19cf40f44b574', 'reachGoal', `${category}_${action}`, {
                    label: label
                });
            }
        } catch (e) {
            console.error('Analytics tracking error:', e);
        }
    }
    
    // ============================================
    // Focus Trap for Modals
    // ============================================
    
    /**
     * Создать focus trap для модального окна
     * @param {Element} modal - Элемент модального окна
     */
    let focusTrapCleanup = null;
    
    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        function handleTabKey(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        
        modal.addEventListener('keydown', handleTabKey);
        
        // Сохраняем функцию для удаления обработчика
        focusTrapCleanup = () => {
            modal.removeEventListener('keydown', handleTabKey);
            focusTrapCleanup = null;
        };
    }
    
    /**
     * Удалить focus trap
     */
    function removeFocusTrap() {
        if (focusTrapCleanup) {
            focusTrapCleanup();
        }
    }
    
    // ============================================
    // Scroll to Top Button
    // ============================================
    
    /**
     * Инициализация кнопки "Наверх"
     */
    function initScrollToTop() {
        // Проверяем, не создана ли кнопка уже
        let scrollBtn = document.getElementById('scroll-to-top');
        if (scrollBtn) {
            // Кнопка уже существует, просто обновим обработчики
            scrollBtn = scrollBtn;
        } else {
            // Создаем кнопку
            scrollBtn = document.createElement('button');
            scrollBtn.id = 'scroll-to-top';
            scrollBtn.className = 'scroll-to-top-btn';
            scrollBtn.setAttribute('aria-label', 'Прокрутить наверх');
            scrollBtn.setAttribute('title', 'Наверх');
            scrollBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
            document.body.appendChild(scrollBtn);
        }
        
        // Показывать/скрывать кнопку при прокрутке
        function toggleScrollButton() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            if (scrollTop > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }
        
        // Удаляем старые обработчики, если они есть (предотвращаем дублирование)
        const oldScrollHandler = scrollBtn._scrollHandler;
        if (oldScrollHandler) {
            window.removeEventListener('scroll', oldScrollHandler);
        }
        
        // Сохраняем ссылку на обработчик для возможного удаления
        scrollBtn._scrollHandler = debounce(toggleScrollButton, 100);
        
        // Проверяем начальное состояние сразу
        toggleScrollButton();
        
        // Прокрутка наверх (удаляем старые обработчики, если есть)
        scrollBtn.onclick = null;
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            trackEvent('UI', 'scroll_to_top', 'button_click');
        });
        
        // Обработка прокрутки
        window.addEventListener('scroll', scrollBtn._scrollHandler, { passive: true });
        
        // Также проверяем при загрузке и после загрузки
        if (document.readyState === 'complete') {
            toggleScrollButton();
        } else {
            window.addEventListener('load', toggleScrollButton, { once: true });
        }
        
        // Проверяем при изменении размера окна
        window.addEventListener('resize', debounce(toggleScrollButton, 100), { passive: true });
        
        // Keyboard navigation
        scrollBtn.onkeydown = null;
        scrollBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollBtn.click();
            }
        });
    }
    
    // ============================================
    // Loading Indicator
    // ============================================
    
    /**
     * Показать индикатор загрузки
     */
    function showLoadingIndicator() {
        let indicator = document.getElementById('loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'loading-indicator';
            indicator.className = 'loading-indicator';
            indicator.setAttribute('aria-live', 'polite');
            indicator.setAttribute('aria-label', 'Загрузка проектов');
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Загрузка...</span>';
            document.getElementById('projects').appendChild(indicator);
        }
        indicator.style.display = 'flex';
    }
    
    /**
     * Скрыть индикатор загрузки
     */
    function hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // ============================================
    // Initialize Everything
    // ============================================
    
    function init() {
        // Set copyright year
        const yearEl = document.getElementById('copyright-year');
        if (yearEl) {
            const currentYear = new Date().getFullYear();
            yearEl.textContent = currentYear;
            yearEl.setAttribute('datetime', currentYear.toString());
        }

        // Initialize scroll reveal
        initScrollReveal();

        // Initialize projects filter
        const filter = new ProjectsFilter();
        filter.init();
        
        // Initialize project views counter
        initProjectViews();
        
        // Validate projects data
        projectsData.forEach((project, index) => {
            const validation = validateProjectData(project);
            if (!validation.valid) {
                console.warn(`Project ${index + 1} (ID: ${project.id}) validation errors:`, validation.errors);
            }
        });
        
        // Initialize scroll to top button
        initScrollToTop();
        
        // Calculate and display total hours
        updateTotalHours();

        // Modal event handlers
        const projectModal = document.getElementById('projectModal');
        const projectModalClose = document.getElementById('project-modal-close');
        const imageModal = document.getElementById('image-modal');
        const imageModalClose = document.getElementById('modal-close');

        if (projectModalClose) {
            projectModalClose.addEventListener('click', closeProjectModal);
        }

        if (projectModal) {
            projectModal.addEventListener('click', (e) => {
                if (e.target === projectModal) {
                    closeProjectModal();
                }
            });
        }

        if (imageModalClose) {
            imageModalClose.addEventListener('click', closeImageModal);
        }

        if (imageModal) {
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    closeImageModal();
                }
            });
        }

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (projectModal && projectModal.classList.contains('active')) {
                    closeProjectModal();
                }
                if (imageModal && imageModal.classList.contains('active')) {
                    closeImageModal();
                }
            }
        });

        // Initialize analytics
        initAnalyticsConsent();
        initAnalyticsStats();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

