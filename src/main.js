/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    const { calculateRevenue, calculateBonus } = options;
    
    //Проверка входных данных
    // 1. data это объект, а не что-то ещё, может какой-нибудь undefined, null случайно пришёл.
    // Так-то объект это truthy тип, поэтому "!data" только на undefined и null проверит.
    // 2. внутри data для работы функции должен быть массив продавцов. Если это не массив, то error.
    // Помимо продавцов остальные ключи тоже должны быть массивами.
    // 3. То же место проверяем, что и в пункте 2. Только теперь отсекаем пустой массив, такой нам тоже не нужен.
    if(!data
        || (!Array.isArray(data.sellers) || !Array.isArray(data.purchase_records) || !Array.isArray(data.products) || !Array.isArray(data.customers))
        || (data.sellers.length === 0 || data.purchase_records.length === 0 || data.products.length === 0 || data.customers.length === 0)
    ) throw new Error('Некорректные входные данные');

    // @TODO: Проверка наличия опций
    if((!calculateRevenue || !calculateBonus)
    || (!(typeof calculateRevenue === 'function') || !(typeof calculateBonus === 'function'))
    ) throw new Error('Отсутствуют функции обработки.');

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
    // То, что вернётся это объект. Он описан какие должны быть ключи в начале функции.
}
