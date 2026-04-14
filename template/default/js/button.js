const gen_scene = document.getElementById('gen-scene') ?? null;
const end_step_elm = document.getElementById('end_step') ?? null;
const delate_unit = document.getElementById('delate_unit') ?? null;

// Кнопка "Очистить"
if(gen_scene) {
    gen_scene.onclick = function() {
        const widthInput = document.getElementById('map_width');
        const heightInput = document.getElementById('map_height');
        const width = widthInput ? parseInt(widthInput.value, 10) : scene.rows;
        const height = heightInput ? parseInt(heightInput.value, 10) : scene.cols;

        scene.generate(width, height);     // Сбрасываем массив в 1 с текущим размером
        screen.draw();                    // Рисуем заново    
        unit_real_mas = [];              // Очищаем массив юнитов
        screen.unitMapByCoord.clear();  // Очищаем Map координат юнитов

        document.getElementById('info-coords').innerText = 'Выберите клетку';  // Стираем данные информации
        document.getElementById('info-type').innerText = '';                   // 
        document.getElementById('info-desc').innerText = '';                   // 
        document.getElementById('terrain-select').value = '';                  // Сбрасываем селект
        document.getElementById('unit-select').value = '';                     //

        if (widthInput) widthInput.value = scene.rows;
        if (heightInput) heightInput.value = scene.cols;
    }
}   

// Кнопка "Завершить ход"
if(end_step_elm) {
    end_step.onclick = function() {
        document.getElementById('info-coords').innerText = 'Выберите клетку';  // Стираем данные информации
        document.getElementById('info-type').innerText = '';                   // 
        document.getElementById('info-desc').innerText = '';                   // 
        for (const current_unit of unit_real_mas) {
            current_unit.stamina.current = current_unit.stamina.max;
        }
        localStorage.setItem('unit_real_mas', JSON.stringify(unit_real_mas));
        localStorage.setItem('unitMapByCoord', JSON.stringify([...window.unitMapByCoord]));
        alert("Ход завершён");
    }
}

// Кнопка "Удалить юнит"
if(delate_unit) {
    delate_unit.onclick = function() {
        document.getElementById('terrain-select').value = '';  // Сбрасываем селект
        document.getElementById('unit-select').value = '';     // 
        flags_unit_delete = true;  // Разрешаем удаление юнитов
    }
}