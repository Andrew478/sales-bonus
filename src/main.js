/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase;
   return sale_price * quantity - discount * quantity;
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
    // Распаковка функций
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

    // Проверка наличия требуемых функций в опциях
    if((!calculateRevenue || !calculateBonus)
    || (!(typeof calculateRevenue === 'function') || !(typeof calculateBonus === 'function'))
    ) throw new Error('Отсутствуют функции обработки.');

    // @TODO: Подготовка промежуточных данных для сбора статистики
    let sellerStats = data.sellers.map(seller => {
        // создаём новый объект
        return {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        }
    });
    console.log(`Сделали sellerStats`);
    console.table(sellerStats);

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    let sellerIndex = sellerStats.reduce((result, seller) => {
        result[seller.id] = seller;
        return result;
    }, {});
    console.log(`Вывожу sellerIndex:`);
    console.table(sellerIndex);

    let productIndex = data.products.reduce((result, product) => {
        result[product.sku] = product;
        return result;
    }, {});
    console.log(`Вывожу productIndex:`);
    console.table(productIndex);

    // @TODO: Расчет выручки и прибыли для каждого продавца
    // Вот тут видимо надо попотеть.
    for(let purchase_record of data.purchase_records) {
        // Шаг 1. Получили ссылку на продавца в итоговом отчёте
        let seller = sellerIndex[purchase_record.seller_id];

        // Далее: наполняем его объект данными с продажи
        seller.sales_count++; // Увеличили количество продаж на одну текущую

        for(let record_item of purchase_record.items) {
            let productFromDatabase = productIndex[record_item.sku]; // отсюда мы возьмём инфу о себестоимости
            let costPrice = productFromDatabase.purchase_price * record_item.quantity; // Считаем себестоимость: себестоимость * количество проданных в чеке
            
            let revenue = calculateRevenue(record_item);  // Считаем выручку revenue. Второй параметр для calculateRevenue не передаём (намёк в аргументе нижний прочерк)
            seller.revenue += revenue;
            
            let profit = revenue - costPrice; // Считаем профит
            seller.profit += profit;

            // Осталось вести учёт количества проданных товаров (группировка по признаку)
            if(!seller.products_sold[record_item.sku]) seller.products_sold[record_item.sku] = 0;
            seller.products_sold[record_item.sku] += record_item.quantity;
        }

    }
    
    // @TODO: Сортировка продавцов по прибыли
    // Тут применяем просто sort()

    // @TODO: Назначение премий на основе ранжирования
    // Смотрим в текст задания, там указаны значения премий за каждое место

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats;
    // То, что вернётся это массив sellerStats, только поля уже буду заполнены посчитанными данными.
}
