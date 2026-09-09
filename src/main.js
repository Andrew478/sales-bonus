/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   let { discount, sale_price, quantity } = purchase;
   discount = 1 - (discount / 100); // Эта формула дана в тексте задания, discount изначально процент, превращаем в коэффициент
   return sale_price * quantity * discount;
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
    let { profit } = seller;
    let bonus = 1;

    if(index === 0) {
        bonus = profit * 0.15;
    }
    else if(index === 1 || index === 2) {
        bonus = profit * 0.1;
    }
    else if(index === (total - 1)) {
        bonus = 0;
    }
    else { // Все остальные
        bonus = profit * 0.05;
    }

    return bonus;
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
            seller_id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        }
    });

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    let sellerIndex = sellerStats.reduce((result, seller) => {
        result[seller.seller_id] = seller;
        return result;
    }, {});

    let productIndex = data.products.reduce((result, product) => {
        result[product.sku] = product;
        return result;
    }, {});

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
    sellerStats.sort(sortFnSellers);

    function sortFnSellers(a, b) {
        if(a.profit < b.profit) return 1;
        else if(a.profit > b.profit) return -1;
        else return 0;
    }

    // @TODO: Назначение премий на основе ранжирования
    // Смотрим в текст задания, там указаны значения премий за каждое место
    
    // Считаем бонус
    sellerStats = sellerStats.map((seller, index, arr) => {
        seller.bonus = calculateBonusByProfit(index, arr.length, seller);

        // Теперь считаем топ-10 продуктов
        let top_prod = Object.entries(seller.products_sold);
        top_prod = top_prod.map(value => {
            return { [value[0]]: value[1] }
        });

        top_prod.sort( (a, b) => {
            if(Object.values(a)[0] < Object.values(b)[0] ) return 1;
            else if(Object.values(a)[0] > Object.values(b)[0] ) return -1;
            else return 0;
        });

        top_prod = top_prod.slice(0, 10); // берём топ-10 первые

        seller.top_products = top_prod;

        return seller;
    });

    

    // @TODO: Подготовка итоговой коллекции с нужными полями

    // sellerStats по сравнению со стартом претерпит изменения в полях
    // products_sold должен быть убран, на его место встанет то-10 проданных продуктов top_products
    sellerStats = sellerStats.map(seller => {
        delete seller.products_sold;
        // Приводим в порядок дробные значения
        seller.revenue = +seller.revenue.toFixed(2);
        seller.profit = +seller.profit.toFixed(2);
        seller.bonus = +seller.bonus.toFixed(2);

        // Приводим в порядок массив из топ-10 продуктов
        seller.top_products = seller.top_products.map(prod => {
            return {
                sku: Object.keys(prod)[0],
                quantiny: Object.values(prod)[0]
            }
        });

        return seller;
    });

    return sellerStats;
    // То, что вернётся это массив sellerStats, только поля уже буду заполнены посчитанными данными.
}
