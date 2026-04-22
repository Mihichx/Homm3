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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Рисует всю таблицу с нуля (вызывается при старте или загрузке файла)
  draw() {
    let table = document.createElement('table');
    table.className = 'map-table';

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
      if (descElement) descElement.innerText = '\n Территория: Описание отсутствует';
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

  // Сброс состояния взятого юнита (убираем рамку и очищаем данные)
  reset_state_unit(taken_img) {
    if (taken_img && taken_img.classList) {
      taken_img.classList.remove('border');
    }
    this.taken = false;
    this.taken_unit = null;
    this.taken_img = null;
    this.startCoords = null;
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Обработчик кликов (делегирование)
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
        return;
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

    // 1. Удаляем юнит (если нажата кнопка "Удалить юнита")
    if (typeof flags_unit_delete !== 'undefined' && flags_unit_delete) {
      scene.delete_unit(i, j, tdElement);
    }

    // 2. Ставим территорию (если это число и она выбрана)
    scene.set_terrain(i, j, terrainSelectValue, tdElement);

    // 3. Ставим юнита (если это число и он выбран)
    scene.set_unit(i, j, unitSelectValue, tdElement, this.unitMapByCoord);
  }

  // Взятие юнита
  updateCell1(tdElement) {
    const img = tdElement.querySelector('img');
    if (img) {
      const [i, j] = tdElement.dataset.coord.split('_').map(Number);
      this.taken_unit = this.scene.getCell(i, j).unit;
      this.startCoords = { i, j };
      this.unit = this.unitMapByCoord.get(`${i}_${j}`);
      img.classList.add('border');
      this.taken = true;
      this.taken_img = img;
    }
  }

  // Перемещение юнита
  updateCell2(tdElement) {
    scene.movement_set_unit(tdElement, this.unit, this.unitMapByCoord, this.taken_img, this.startCoords, this.taken_unit);
  }
}