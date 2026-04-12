const gen_scene = document.getElementById('gen-scene') ?? null;
const end = document.getElementById('end') ?? null;
const end_step_elm = document.getElementById('end_step') ?? null;
const delate_unit = document.getElementById('delate_unit') ?? null;

// Кнопка "Генерировать/Очистить"
if(gen_scene) {
    gen_scene.onclick = function() {
        const widthInput = document.getElementById('map_width');
        const heightInput = document.getElementById('map_height');
        const width = widthInput ? parseInt(widthInput.value, 10) : scene.rows;
        const height = heightInput ? parseInt(heightInput.value, 10) : scene.cols;

        scene.generate(width, height);  // Сбрасываем массив в 1 с текущим размером
        screen.draw();  // Рисуем заново    
        unit_real_mas = [];  // Очищаем массив юнитов
        screen.unitMapByCoord.clear();  // Очищаем Map координат юнитов
        document.getElementById('create-map').innerText = 'Создание карты';    // Меняем заголовок
        document.getElementById('info-coords').innerText = 'Выберите клетку';  // Стираем данные информации
        document.getElementById('info-type').innerText = '';                   // 
        document.getElementById('info-desc').innerText = '';                   // 
        document.getElementById('map-size-form').classList.remove("none");     // Показываем форму для ввода размера карты

        if (widthInput) widthInput.value = scene.rows;
        if (heightInput) heightInput.value = scene.cols;

        document.getElementById('terrain-select').value = '';                  // Сбрасываем селект
        document.getElementById('unit-select').value = '';                     //  
        document.getElementById('terrain-select').classList.remove("none");    // Показываем выбор территории
        document.getElementById('unit-select').classList.remove("none");       // Показываем выбор юнитов
        document.getElementById('end').classList.remove("none");               // Показываем кнопку "Завершить"
        document.getElementById('end_step').classList.add("none"); 
        flags = true;  // Разрешаем редактирование
    }
}

// Кнопка "Завершить"
if(end) {
    end.onclick = function() {
        document.getElementById('end_step').classList.remove("none");  
        flags = false;  // Запрещаем редактирование 
    }
}

// Кнопка "Завершить ход"
if(end_step_elm) {
    end_step.onclick = function() {
        for (const current_unit of unit_real_mas) {
            console.log(current_unit);
            current_unit.stamina.current = current_unit.stamina.max;
        }
        document.getElementById('info-type').innerText = '';                  
        document.getElementById('info-desc').innerText = '';
        alert("Ход завершён");
    }
}

// Кнопка "Удалить юнит"
if(delate_unit) {
    delate_unit.onclick = function() {
        document.getElementById('terrain-select').value = '';  // Сбрасываем селект
        document.getElementById('unit-select').value = '';     // 
        flags_unit_delate = true;  // Разрешаем удаление юнитов
    }
}