// Сохранение карты в файл
if(document.getElementById('save')) {
    document.getElementById('save').onclick = function() {
        const fullSaveData = {
            matrix: scene.matrix,             // Ландшафт
            units: window.unit_real_mas,      // Юниты
            date: new Date().toLocaleString()
        };

        const jsonString = JSON.stringify(fullSaveData);
        system.save(jsonString, 'my_strategy_save.json'); 
    };
}

// Сохранение в LocalStorage для быстрого перехода к игре
if(document.getElementById('save1')) {
    document.getElementById('save1').onclick = function(e) {
        e.preventDefault();

        localStorage.setItem('unit_real_mas', JSON.stringify(window.unit_real_mas));
        // Для Map (unitMapByCoord) нужно преобразовывать в массив для JSON
        if (window.unitMapByCoord) {
            localStorage.setItem('unitMapByCoord', JSON.stringify([...window.unitMapByCoord]));
        }
        localStorage.setItem('save_map', JSON.stringify(scene.matrix)); 
        localStorage.setItem('editMode', 'false'); 

        window.location.href = './map_game.php';
    };
}

// Инициализация загрузки из файла
if (document.getElementById('fileLoad')) {
    system.load('#fileLoad', loadedData);
}

// Обработка данных после выбора файла
function loadedData(content) {
    try {
        const rawData = JSON.parse(content.result);
        
        // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ:
        // Проверяем, является ли загруженный файл объектом с полем 'matrix' 
        // или это просто массив (старый формат)
        let loadedMatrix = rawData.matrix ? rawData.matrix : rawData;
        
        // Если в файле были юниты, восстанавливаем их в глобальную переменную
        if (rawData.units) {
            window.unit_real_mas = rawData.units;
        }

        if (!Array.isArray(loadedMatrix)) {
            console.error("Неверный формат данных карты");
            return;
        }

        // Получаем список доступных типов террейна
        const terrainList = (typeList.list.terrain?.getList?.() || []);
        const availableTypes = Object.fromEntries(terrainList.map(item => [item.type, true]));

        // Валидация и нормализация каждой ячейки
        for (let i = 0; i < loadedMatrix.length; i++) {
            for (let j = 0; j < loadedMatrix[i].length; j++) {
                let cell = loadedMatrix[i][j];

                // Если ячейка битая или тип террейна не существует в текущем справочнике
                if (!cell || !availableTypes[cell.terrain]) {
                    cell = { terrain: 1, unit: null };
                }

                // Убеждаемся, что поле unit существует (хотя бы null)
                if (cell.unit === undefined) {
                    cell.unit = null;
                }

                loadedMatrix[i][j] = cell;
            }
        }

        // Обновляем состояние сцены
        scene.matrix = loadedMatrix;
        scene.rows = loadedMatrix.length;
        scene.cols = loadedMatrix[0]?.length || 0;

        // Синхронизируем визуальные инпуты размеров
        const widthInput = document.getElementById('map_width');
        const heightInput = document.getElementById('map_height');
        if (widthInput) widthInput.value = scene.rows;
        if (heightInput) heightInput.value = scene.cols;

        // Обновляем параметры URL без перезагрузки страницы
        const url = new URL(window.location);
        url.searchParams.set('map_width', scene.rows);
        url.searchParams.set('map_height', scene.cols);
        window.history.replaceState(null, '', url);

        // Перерисовываем холст
        if (typeof screen !== 'undefined' && screen.draw) {
            screen.draw();
        }

        console.log("Карта успешно загружена!");

    } catch (e) {
        console.error("Ошибка при чтении JSON файла:", e);
        alert("Не удалось прочитать файл сохранения.");
    }
}
