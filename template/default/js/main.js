const urlParams = new URLSearchParams(window.location.search);

// Валидация размера карты
function validateMapSize(size, defaultSize = 10) {
    const parsed = parseInt(size);
    if (isNaN(parsed) || parsed < 5) return defaultSize;
    if (parsed > 100) return 100;
    return parsed;
}

// Загрузка сохранения из localStorage
const savedData = localStorage.getItem('save_map');
let currentMatrix = null;

if (savedData) {
    try { 
        currentMatrix = JSON.parse(savedData); 
    } catch (e) { 
        console.error("Ошибка парсинга карты:", e); 
    }
}

// Настройка параметров карты
let mapData = {
    width: validateMapSize(urlParams.get('map_width')),
    height: validateMapSize(urlParams.get('map_height')),
};

// Если загрузили сохранение, берем размеры из него
if (currentMatrix) {
    if (currentMatrix.matrix && Array.isArray(currentMatrix.matrix)) {
        mapData.width = currentMatrix.matrix.length;
        mapData.height = currentMatrix.matrix[0].length;
        mapData.matrix = currentMatrix.matrix;
    } 
}

// Сначала загружаем основной массив «живых» юнитов
const savedUnits = localStorage.getItem('unit_real_mas');
window.unit_real_mas = (savedUnits && savedUnits !== "undefined") ? JSON.parse(savedUnits) : [];

// Инициализируем Map (индекс для быстрого поиска)
window.unitMapByCoord = new Map();

// СВЯЗЫВАЕМ: Проходим по массиву и кладем ССЫЛКИ на те же объекты в Map
unit_real_mas.forEach(unit => {
    if (unit && unit.coord) {
        // Ключ — это строка координат, значение — сам объект юнита из массива
        const key = `${unit.coord.i}_${unit.coord.j}`;
        window.unitMapByCoord.set(key, unit);
    }
});

// Инициализация Scene и Screen
// Scene сама поймет: брать currentMatrix или генерировать новую
let scene = new Scene(currentMatrix ? { ...mapData, matrix: currentMatrix } : mapData);
let screen = new Screen(scene, 'map-container');
let flags_unit_delete = false; 
let flags = true;
window.unitMap = {};


// Определение режима (Редактор или Игра)
// Если мы на странице create_map.php — принудительно включаем редактор
if (window.location.pathname.includes('create_map.php')) { 
    localStorage.setItem('editMode', 'true');
}
const isEditMode = localStorage.getItem('editMode') === 'true';

// Загрузка данных из БД и отрисовка
MapLoader.loadResources(() => {
    const units = typeList.list.units ? typeList.list.units.getList() : null;
    const terrains = typeList.list.terrain ? typeList.list.terrain.getList() : null;

    // --- Б: ЗАПОЛНЕНИЕ СЕЛЕКТОРОВ  ---
    if (isEditMode) {
        const terrainSelector = document.getElementById('terrain-select');
        const unitSelector = document.getElementById('unit-select');

        if (terrainSelector && terrains) {
            terrainSelector.innerHTML = '<option value="">Выберите ландшафт</option>';
            terrains.forEach(item => {
                if (item.name.trim() !== "") {
                    let option = document.createElement('option');
                    option.value = item.type;
                    option.textContent = item.name;
                    terrainSelector.appendChild(option);
                }
            });
        }

        if (unitSelector && units) {
            unitSelector.innerHTML = '<option value="">Выберите юнита</option>';
            units.forEach(item => {
                if (item.name.trim() !== "") {
                    let option = document.createElement('option');
                    option.value = item.type;
                    option.textContent = item.name;
                    unitSelector.appendChild(option);
                }
            });
        }

        if (terrainSelector && unitSelector) {
            terrainSelector.addEventListener('change', () => { if (terrainSelector.value) unitSelector.value = ''; });
            unitSelector.addEventListener('change', () => { if (unitSelector.value) terrainSelector.value = ''; });
        }
    }

    // --- В: КНОПКА "СТЕРЕТЬ КАРТУ"  ---
    const clearBtn = document.querySelector('button[onclick*="generate"]') || Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Стереть карту');
    if (clearBtn) {
        clearBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm("Вы точно хотите полностью стереть карту?")) {
                localStorage.removeItem('save_map');
                location.reload();
            }
        };
    }

    // --- Г: ОТРИСОВКА  ---
    const container = document.getElementById('map-container');
    if (container) container.innerHTML = '';
    screen.draw(); 
});