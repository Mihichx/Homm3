/*
  SCREEN: Отвечает за визуализацию (HTML/DOM)
  Рисует таблицу и обрабатывает клики пользователя.
*/
let flags = true;  // Разрешено ли редактирование прямо сейчас
class Screen {
  constructor(scene, containerId) {
    this.scene = scene;                                        // Связываем экран с данными сцены
    this.container = document.getElementById(containerId);    // Где рисовать таблицу
    this.taken = false;                                      // Отслеживание взятия юнита
    this.units = [];                                        // Массив с юнитами
    this.unitMapByCoord = new Map();                       // Быстрый доступ по координатам
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


  // Обработчик клика по таблице
  delegateHandler(event) {
    const td = event.target.closest('td');
    if (!td) return;  // Если кликнули мимо ячейки — выходим

    const [i, j] = td.dataset.coord.split('_').map(Number);  // Достаём координаты из тега(td)

    if (flags == true) {  // Если редактирование разрешено
      this.updateCell(td, i, j, event);
      this.displayInfo(i, j);
    } else {
      // Если в руках ничего нет И если редактирование запрещено
      if (this.taken === false) {
        this.displayInfo(i, j);
        this.updateCell1(td);  // Забираем из ячейки
      } 
      // Если в руках есть юнит
      else if (this.taken === true) {
        this.updateCell2(td);  // Кладем в новую ячейку
        this.displayInfo(i, j);
      }
    }
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////|


  // Изменение ячейки
  updateCell(tdElement, i, j, event) {
    const terrainSelectValue = parseInt(document.getElementById('terrain-select').value, 10);
    const unitSelectValue = parseInt(document.getElementById('unit-select').value, 10);

    // Режим удаления: только удаляем, если юнит есть
    if (flags_unit_delate) {
      if (!event.target.closest('img')) {
        flags_unit_delate = false;  // Выключаем режим удаления после действия
        return;  // Если кликнули мимо юнита — выходим
      }
      if (this.scene.getCell(i, j).unit) {
        this.scene.setCell(i, j, null, 'unit');  // Удаляем юнит из модели
        this.unitMapByCoord.delete(`${i}_${j}`);  // Удаляем из Map
        tdElement.innerHTML = '';
        unit_real_mas = unit_real_mas.filter(entry => !(entry.coord.i === i && entry.coord.j === j));
        flags_unit_delate = false;  // Выключаем режим удаления после действия
      }
      return;  // В режиме удаления ничего другого не делаем
    }

    // Если выбран terrain, ставим его
    if (!isNaN(terrainSelectValue) && terrainSelectValue) {
      this.scene.setCell(i, j, terrainSelectValue, 'terrain');
      tdElement.className = 'terrain-' + terrainSelectValue;
      return;
    }

    // Если выбран юнит, размещаем
    if (!isNaN(unitSelectValue) && unitSelectValue) {
      const unit = window.unitMap && window.unitMap[unitSelectValue];
      if (!unit) {
        console.warn('Юнит не найден в справочнике:', unitSelectValue);
        return;
      }

      // Проверяем, не занята ли клетка
      if (this.scene.getCell(i, j).unit) {
        alert('Клетка занята!');
        return;
      }

      // Размещаем
      this.scene.setCell(i, j, { ...unit }, 'unit');
      const newUnitEntry = {
          id: this.scene.getCell(i, j).unit.id,
          unit: this.scene.getCell(i, j).unit,
          coord: { i, j },
          stamina: {
            current: unit.stamina.max,
            max: unit.stamina.max
          }
      };
      unit_real_mas.push(newUnitEntry);
      this.unitMapByCoord.set(`${i}_${j}`, newUnitEntry);
      console.table(unit_real_mas);

      // Обновляем DOM
      tdElement.innerHTML = '';
      tdElement.className = 'terrain-' + (this.scene.getCell(i, j).terrain || 1);
      const img = document.createElement('img');
      img.src = unit.icon;
      img.classList.add('img-size');
      tdElement.appendChild(img);

      return;
    }
    // Если ничего не выбрано, ничего не делаем
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

        console.table(unit_real_mas);
      }
    }
  }
}