/*
  SCENE: Отвечает только за данные (логику)
  Хранит информацию о том, где какая плитка находится.
*/
class Scene {
  constructor(data) {
    const config = data;
    this.rows = config.width;     // Берём данные из input
    this.cols = config.height;   // Берём данные из input

    // ПРОВЕРКА: Если в данных уже есть матрица (из сохранения), используем её
    if (config.matrix) {
      this.matrix = config.matrix;
    } else {
      // Если матрицы нет, генерируем пустую
      this.generate();
    }
  }

  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Заполняет матрицу значением "1" (трава). Опционально можно передать новый размер.
  generate(width, height) {
    // Если передан новый размер, применяем его.
    if (width) this.rows = width;
    if (height) this.cols = height;

    this.matrix = [];
    for (let i = 0; i < this.rows; i++) {
      this.matrix[i] = [];                                // Создаем строку
      for (let j = 0; j < this.cols; j++) {
        this.matrix[i][j] = { terrain: 10, unit: null };  // Создаем столбец
      }
    }
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Получает значение ячейки по координатам
  getCell(i, j) {
    return this.matrix[i][j];
  }

  // Меняет данные в ячейке и сохраняет всю карту
  setCell(i, j, value, field) {
    const cell = this.matrix[i]?.[j];
    if (!cell) return;
    cell[field] = value;
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  checkMove(from, to) {
    const rowDiff = Math.abs(from.i - to.i);
    const colDiff = Math.abs(from.j - to.j);

    // Только линейное движение (одна из разниц должна быть 0)
    if (rowDiff !== 0 && colDiff !== 0) {
      alert("Движение только по прямой!");
      return false;
    }

    const distance = rowDiff + colDiff;

    // Проверка и уменьшение выносливости
    this.unit = window.unitMapByCoord.get(`${from.i}_${from.j}`);
    if (this.unit && this.unit.stamina.current >= distance) {
      this.unit.stamina.current -= distance;
      return true;
    } else {
        const remaining = this.unit?.stamina?.current || 0;
        alert(`Недостаточно выносливости! Нужно ${distance}, осталось ${remaining}`);
        if (screen && screen.taken_img) {
          screen.reset_state_unit(screen.taken_img);
        }
        return false;
    }
  }

  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  delete_unit(i, j, tdElement) {
    if (this.getCell(i, j).unit) {
      this.setCell(i, j, null, 'unit'); // Удаляем из модели
      unitMapByCoord.delete(`${i}_${j}`); // Удаляем из Map
      tdElement.innerHTML = ''; // Очищаем визуально
      
      // Удаляем из общего массива юнитов
      window.unit_real_mas = window.unit_real_mas.filter(
        entry => !(entry.coord.i === i && entry.coord.j === j)
      );
      
      flags_unit_delete = false; // Выключаем режим удаления
    } 
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  set_terrain(i, j, terrainSelectValue, tdElement) {
    this.setCell(i, j, terrainSelectValue, 'terrain');
    tdElement.className = 'terrain-' + terrainSelectValue;
    return;
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  set_unit(i, j, unitSelectValue, tdElement, unitMapByCoord) {
    const unitTemplate = window.unitMap && window.unitMap[unitSelectValue];
    if (!unitTemplate) {
      console.warn('Юнит не найден в справочнике id:', unitSelectValue);
      return;
    }

    if (tdElement.className == 'terrain-10') {
        alert("Нельзя ставить юнитов на воду!");
        screen.reset_state_unit(taken_img);
        return;
    }

    if (unitMapByCoord.get(`${i}_${j}`)) {
      this.delete_unit(i, j, tdElement);
    }

    // Создаем копию объекта юнита и размещаем в модели
    const newUnit = JSON.parse(JSON.stringify(unitTemplate));
    this.setCell(i, j, newUnit, 'unit');

    // Создаем запись для игрового движка (с текущей выносливостью)
    const newUnitEntry = {
      id: newUnit.id,
      unit: newUnit,
      coord: { i, j },
      stamina: {
        current: newUnit.stamina?.max,
        max: newUnit.stamina?.max
      }
    };

    window.unit_real_mas.push(newUnitEntry);
    unitMapByCoord.set(`${i}_${j}`, newUnitEntry);

    // Обновляем DOM (картинка)
    tdElement.innerHTML = '';
    // Сохраняем фон террейна, который там был
    tdElement.className = 'terrain-' + (this.getCell(i, j).terrain);
    
    const img = document.createElement('img');
    img.src = newUnit.icon;
    img.classList.add('img-size');
    tdElement.appendChild(img);
    return;
  }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  movement_set_unit(tdElement, unit, unitMapByCoord, taken_img, startCoords) {
    if (taken_img) {
      const [i, j] = tdElement.dataset.coord.split('_').map(Number);
      const targetCell = this.getCell(i, j);

      if (targetCell && targetCell.unit) {
        alert('Клетка занята!');
        return;
      }

      if (tdElement.className == 'terrain-10') {
        alert("Нельзя ставить юнитов на воду!");
        screen.reset_state_unit(taken_img);
        return;
      }

      // Проверяем линейность и выносливость
      if (this.checkMove(startCoords, { i, j })) {
        // Если всё ок, перемещаем в модели
        this.setCell(startCoords.i, startCoords.j, null, 'unit'); // Удаляем со старой
        this.setCell(i, j, unit.unit, 'unit'); // Ставим на новую

        // Обновляем Map
        unitMapByCoord.delete(`${startCoords.i}_${startCoords.j}`);  // Удаляем старую
        unitMapByCoord.set(`${i}_${j}`, unit);  // Добавляем новую

        // Обновляем координаты юнита
        if (unit) {
          unit.coord = { i, j };
        }

        // Обновляем DOM
        tdElement.appendChild(taken_img);
        screen.reset_state_unit(taken_img);

        localStorage.setItem('unit_real_mas', JSON.stringify(window.unit_real_mas));
        if (this.matrix) {
          localStorage.setItem('save_map', JSON.stringify(this.matrix));
        }
      }
    }
  }
}
