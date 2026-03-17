const urlParams = new URLSearchParams(window.location.search);

// Добавляем значение по умолчанию (например, 10), если в URL пусто
let mapData = {
    width: parseInt(urlParams.get('map_width')),
    height: parseInt(urlParams.get('map_height')),
};

let flags = true;                                 // Разрешено ли редактирование прямо сейчас
let scene = new Scene(mapData);                   // Создаем логику
let screen = new Screen(scene, 'map-container');  // Создаем экран

// Настройка списка типов
typeList
    .setPath('answer.php') 
    .addType({code: 'terrain_homm', name: "Ландшафт", column: "name"})  // Указываем колонку с именем
    .load(() => {
        // Данные загружены! Заполняем select
        const select = document.getElementById('terrain-select');
        const terrains = typeList.list.terrain_homm.getList();  // Получаем кэшированный список

        if (terrains) {
            terrains.forEach(item => {
                let option = document.createElement('option');
                option.value = item.type;  // Это ID или код из БД
                option.textContent = item.name;
                select.appendChild(option);
            });
        }
        
        console.log("Редактор готов. Данные ландшафтов:", terrains);
        
        // Тут можно вызывать функцию отрисовки карты
        // initMap(width, height); 
    });


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Первый запуск отрисовки
screen.draw();

// Кнопка "Генерировать/Очистить"
document.getElementById('gen-scene').onclick = function() {
    scene.generate();  // Сбрасываем массив в 1
    screen.draw();     // Перерисовываем таблицу
    document.getElementById('terrain-select').classList.remove("none");  // Показываем выбор блоков
    document.getElementById('end').classList.remove("none");  // Показываем кнопку "Завершить"
    flags = true;  // Разрешаем редактирование
};

// Кнопка "Завершить"
document.getElementById('end').onclick = function() {
    document.getElementById('terrain-select').classList.add("none");  // Прячем выбор блоков
    document.getElementById('end').classList.add("none");  // Прячем кнопку "Завершить"
    flags = false;  // Запрещаем редактирование 
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Сохранение карты
document.getElementById('save').onclick = function() {
    // Превращаем матрицу в строку JSON
    let mapData = JSON.stringify(scene.matrix);
    // Скачиваем файл
    system.save(mapData, 'my_strategy_map.json');
};

// Загрузка из файла
if (document.getElementById('fileLoad')) {
    // Вызываем функцию загрузки из внешней системы
    system.load('#fileLoad', loadedData);
}

// Выполнится, когда файл будет выбран и прочитан
function loadedData(content) {
    let loadedMatrix = JSON.parse(content.result);
    
    // Получаем количество доступных типов из справочника
    const availableTypes = typeList.list.terrain_homm.getAll();

    for (let i = 0; i < loadedMatrix.length; i++) {
        for (let j = 0; j < loadedMatrix[i].length; j++) {
            // Если ID в файле нет в нашей базе данных — ставим тип 1 (траву)
            if (!availableTypes[loadedMatrix[i][j]]) {
                loadedMatrix[i][j] = 1;
            }
        }
    }
    scene.matrix = loadedMatrix;
    screen.draw();
}