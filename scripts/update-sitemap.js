/**
 * Скрипт для автоматического обновления sitemap.xml
 * Обновляет дату последнего изменения (lastmod) для всех URL в sitemap.xml
 * 
 * Использование:
 *   node scripts/update-sitemap.js
 * 
 * Или добавить в package.json:
 *   "scripts": {
 *     "update-sitemap": "node scripts/update-sitemap.js"
 *   }
 */

const fs = require('fs');
const path = require('path');

// Путь к sitemap.xml
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

// Текущая дата в формате ISO 8601 (YYYY-MM-DD)
const currentDate = new Date().toISOString().split('T')[0];

try {
    // Читаем sitemap.xml
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Проверяем, есть ли файл
    if (!sitemapContent) {
        console.error('Ошибка: sitemap.xml не найден или пуст');
        process.exit(1);
    }
    
    // Обновляем все <lastmod> теги на текущую дату
    // Паттерн для поиска: <lastmod>YYYY-MM-DD</lastmod>
    const lastmodPattern = /<lastmod>[\d-]+<\/lastmod>/g;
    const updatedContent = sitemapContent.replace(lastmodPattern, `<lastmod>${currentDate}</lastmod>`);
    
    // Записываем обновленный контент
    fs.writeFileSync(sitemapPath, updatedContent, 'utf8');
    
    console.log(`✅ Sitemap.xml успешно обновлен!`);
    console.log(`   Дата обновления: ${currentDate}`);
    console.log(`   Файл: ${sitemapPath}`);
    
    // Подсчитываем количество обновленных URL
    const updatedCount = (sitemapContent.match(lastmodPattern) || []).length;
    console.log(`   Обновлено URL: ${updatedCount}`);
    
} catch (error) {
    console.error('❌ Ошибка при обновлении sitemap.xml:', error.message);
    process.exit(1);
}

