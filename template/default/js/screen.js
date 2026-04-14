/*
  SCREEN: Отвечает за визуализацию (HTML/DOM)
  Рисует таблицу и обрабатывает клики пользователя.
*/
class Screen {
  constructor(scene, containerId) {
    this.scene = scene;                                        // Связываем экран с данными сцены
    this.container = document.getElementById(containerId);    // Где рисовать таблицу
    this.taken = false;                                      // Отслеживание взятия юнита
    this.units = [];                                        // Массив с юнитами
    this.unitMapByCoord = window.unitMapByCoord;
    // ИСПРАВЛЕНИЕ: Вешаем событие на КОНТЕЙНЕР, а не на несуществующую таблицу
    this.container.addEventListener('mousedown', this.delegateHandler.bind(this));

    // Отключаем меню на всем контейнере
    this.container.oncontextmenu = (e) => e.preventDefault();
    
  }

  // Рисует всю таблицу с нуля (вызывается при старте или загрузке файла)
  draw() {
    let table = document.createElement('table');
    table.className = 'map-table';
    table.onclick = (e) => this.delegateHandler(e);

    for (let i = 0; i < this.scene.matrix.length; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < this.scene.matrix[i].length; j++) {
        let td = document.createElement('td');

        const cell = this.scene.getCell(i, j);
        td.className = 'terrain-' + cell.terrain;
        td.dataset.coord = `${i}_${j}`;
        if (cell.unit) {
          let img = document.createElement('img');
          img.src = cell.unit.icon;
          img.classList.add('img-size');
          td.appendChild(img);
        }
        tr.appendChild(td);  // Добавление ячейки(td) в строку(tr)
      }
      table.appendChild(tr);  // Добавление строки(tr) в таблицу
    }
    this.container.innerHTML = '';  // Очищает контейнер
    this.container.appendChild(table);  // Добавляем таблицу в контейнер
  }

  draw_map_game(matrix) {
    let table = document.createElement('table');
    table.className = 'map-table';
    table.onclick = (e) => this.delegateHandler(e);

    for (let i = 0; i < matrix.length; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < matrix[i].length; j++) {
        let td = document.createElement('td');

        const cell = this.scene.getCell(i, j);
        td.className = 'terrain-' + cell.terrain;
        td.dataset.coord = `${i}_${j}`;
        if (cell.unit) {
          let img = document.createElement('img');
          img.src = cell.unit.icon;
          img.classList.add('img-size');
          td.appendChild(img);
        }
        tr.appendChild(td);  // Добавление ячейки(td) в строку(tr)
      }
      table.appendChild(tr);  // Добавление строки(tr) в таблицу
    }
    this.container.innerHTML = '';  // Очищает контейнер
    this.container.appendChild(table);  // Добавляем таблицу в контейнер
  }
  

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Отвечает за отображения информации о территории
  displayInfo(i, j) {
    const coordsElement = document.getElementById('info-coords');
    const typeElement = document.getElementById('info-type');
    const descElement = document.getElementById('info-desc');

    if (coordsElement) coordsElement.innerText = `${i}, ${j}`;
    const cell = this.scene.getCell(i, j);
    const terrainData = typeList.list.terrain.getOne(cell.terrain);
    const unitData = this.unitMapByCoord.get(`${i}_${j}`);

    if (terrainData) {
      if (typeElement) typeElement.innerText = terrainData?.name || 'Неизвестно';
      if (descElement) descElement.innerText = '\n Территория: ' + terrainData.description || "Описание отсутствует";
    }

    if (cell.unit) {
      const unit = cell.unit;
      const unitName = unit.name || unit.type || 'без имени';
      const unitStats = [];

      // Добавляем stamina, если unitData есть
      if (unitData && unitData.stamina) {
        unitStats.push(`STM:${unitData.stamina.current}/${unitData.stamina.max}`);
      }

      if (unit.health != null) unitStats.push(`HP:${unit.health}`);
      if (unit.speed != null) unitStats.push(`SPD:${unit.speed}`);
      if (unit.attack != null) unitStats.push(`ATK:${unit.attack}`);
      if (unit.protection != null) unitStats.push(`DEF:${unit.protection}`);

      if (typeElement) typeElement.innerText += ` + юнит ${unitName}`;
      if (descElement) descElement.innerText += `\n Юнит: ${unitName} ${unitStats.join(', ')}`;
    }
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  delegateHandler(event) {
    const td = event.target.closest('td');
    if (!td) return;

    const [i, j] = td.dataset.coord.split('_').map(Number);

    // ОПРЕДЕЛЯЕМ РЕЖИМ
    // Если на странице есть селект выбора террейна — это редактор
    const isEditor = !!document.getElementById('terrain-select');

    // 1. ЛОГИКА РЕДАКТОРА (Только ЛКМ)
    if (isEditor) {
        if (event.button === 0) { // Только левая кнопка
            this.updateCell(td, i, j, event);
            this.displayInfo(i, j);
        }
        return; // ВАЖНО: В режиме редактора игровой код ниже не должен выполняться!
    }

    // 2. ЛОГИКА ИГРЫ (Перемещение)
    
    // ЛКМ — Выбор юнита
    if (event.button === 0) {
      if (this.taken === false) {
        this.displayInfo(i, j);
        this.updateCell1(td); 
        } else {
          // Если юнит уже в руках, ЛКМ просто обновляет инфо-панель
          this.displayInfo(i, j);
          // Если кликнули на другого юнита — перевыбираем
          if (td.querySelector('img')) {
          if (this.taken_img) this.taken_img.classList.remove('border');
          this.updateCell1(td);
          } else {
          if (this.taken_img) {
            this.taken_img.classList.remove('border');
            this.taken = false;
            this.taken_unit = null;
            this.taken_img = null;
          }
        }
      }
    }

    // ПКМ — Ход выбранным юнитом
    else if (event.button === 2) {
      if (this.taken === true) {
          this.updateCell2(td); 
          this.displayInfo(i, j);
      }
    }
  }




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////|


  // Изменение ячейки
  updateCell(tdElement, i, j) {
    const terrainSelect = document.getElementById('terrain-select');
    const unitSelect = document.getElementById('unit-select');

    const terrainSelectValue = terrainSelect ? parseInt(terrainSelect.value, 10) : 0;
    const unitSelectValue = unitSelect ? parseInt(unitSelect.value, 10) : 0;

    // 1. РЕЖИМ УДАЛЕНИЯ
    if (typeof flags_unit_delate !== 'undefined' && flags_unit_delate) {
      if (this.scene.getCell(i, j).unit) {
        this.scene.setCell(i, j, null, 'unit'); // Удаляем из модели
        this.unitMapByCoord.delete(`${i}_${j}`); // Удаляем из Map
        tdElement.innerHTML = ''; // Очищаем визуально
        
        // Удаляем из общего массива юнитов
        window.unit_real_mas = window.unit_real_mas.filter(
          entry => !(entry.coord.i === i && entry.coord.j === j)
        );
        
        flags_unit_delate = false; // Выключаем режим удаления
      }
      return;
    }

    // 2. УСТАНОВКА ТЕРРЕЙНА (Ландшафта)
    if (!isNaN(terrainSelectValue) && terrainSelectValue > 0) {
      this.scene.setCell(i, j, terrainSelectValue, 'terrain');
      tdElement.className = 'terrain-' + terrainSelectValue;
      return;
    }

    // 3. УСТАНОВКА ЮНИТА
    if (!isNaN(unitSelectValue) && unitSelectValue > 0) {
      // Если в клетке УЖЕ есть любой юнит — просто выходим без ошибки
      if (this.scene.getCell(i, j).unit) {
        console.log(`Клетка ${i}_${j} уже занята юнитом. Пропуск.`);
        return; я 
      }

      const unitTemplate = window.unitMap && window.unitMap[unitSelectValue];
      if (!unitTemplate) {
        console.warn('Юнит не найден в справочнике id:', unitSelectValue);
        return;
      }

      // Создаем копию объекта юнита и размещаем в модели
      const newUnit = JSON.parse(JSON.stringify(unitTemplate));
      this.scene.setCell(i, j, newUnit, 'unit');

      // Создаем запись для игрового движка (с текущей выносливостью)
      const newUnitEntry = {
        id: newUnit.id,
        unit: newUnit,
        coord: { i, j },
        stamina: {
          current: newUnit.stamina?.max || 10,
          max: newUnit.stamina?.max || 10
        }
      };

      window.unit_real_mas.push(newUnitEntry);
      this.unitMapByCoord.set(`${i}_${j}`, newUnitEntry);

      // Обновляем DOM (картинка)
      tdElement.innerHTML = '';
      // Сохраняем фон террейна, который там был
      tdElement.className = 'terrain-' + (this.scene.getCell(i, j).terrain || 1);
      
      const img = document.createElement('img');
      img.src = newUnit.icon;
      img.classList.add('img-size');
      tdElement.appendChild(img);

      return;
    }
  }

  updateCell1(tdElement) {
    const img = tdElement.querySelector('img');
    if (img) {
      const [i, j] = tdElement.dataset.coord.split('_').map(Number);
      
      this.taken_unit = this.scene.getCell(i, j).unit;
      this.startCoords = { i, j }; // ПУНКТ 9: Запоминаем откуда идем

      // Оптимизация: вместо цикла используем Map
      this.unit = this.unitMapByCoord.get(`${i}_${j}`);
      
      img.classList.add('border');
      this.taken = true;
      this.taken_img = img;
    }
  }

  updateCell2(tdElement) {
    if (this.taken_unit && this.taken_img) {
      const [i, j] = tdElement.dataset.coord.split('_').map(Number);
      const targetCell = this.scene.getCell(i, j);

      if (targetCell && targetCell.unit) {
          alert('Клетка занята!');
          return;
      }

      // Проверяем линейность и выносливость через Scene
      if (this.scene.checkMove(this.startCoords, { i, j })) {
        // Если всё ок, перемещаем в модели
        this.scene.setCell(this.startCoords.i, this.startCoords.j, null, 'unit'); // Удаляем со старой
        this.scene.setCell(i, j, this.taken_unit, 'unit'); // Ставим на новую

        // Обновляем Map
        this.unitMapByCoord.delete(`${this.startCoords.i}_${this.startCoords.j}`);  // Удаляем старую
        this.unitMapByCoord.set(`${i}_${j}`, this.unit);  // Добавляем новую

        // Обновляем координаты юнита
        if (this.unit) {
          this.unit.coord = { i, j };
        }

        // Обновляем DOM
        tdElement.appendChild(this.taken_img);
        this.taken_img.classList.remove('border');
        
        // Сброс состояния
        this.taken = false;
        this.taken_unit = null;
        this.taken_img = null;
        this.startCoords = null;

        // Сохраняем массив юнитов (Map не нужно, она соберется из массива при загрузке)
        localStorage.setItem('unit_real_mas', JSON.stringify(window.unit_real_mas));
        if (this.scene && this.scene.matrix) {
            // Сохраняем ОДИН РАЗ напрямую через stringify
            localStorage.setItem('save_map', JSON.stringify(this.scene.matrix));
        }
      }
    }
  }
}