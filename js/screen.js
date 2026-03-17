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

        const cellValue = this.scene.matrix[i][j];
        td.className = 'terrain-' + cellValue;  // Создаём
        td.dataset.coord = `${i}_${j}`;  // Добавление координат в td элемент
        tr.appendChild(td);  // Добавление ячейки(td) в строку(tr)
      }
      table.appendChild(tr);  // Добавление строки(tr) в таблицу
    }
    this.container.innerHTML = '';  // Очищает контейнер
    this.container.appendChild(table);  // Добавляем таблицу в контейнер
  }

  // Отвечает за отображения информации о территории
  displayInfo(i, j, value) {
    const coordsElement = document.getElementById('info-coords');
    const typeElement = document.getElementById('info-type');
    const descElement = document.getElementById('info-desc');

    if (coordsElement) coordsElement.innerText = `${i}, ${j}`;
    const terrainData = typeList.list.terrain_homm.getOne(value);

    if (terrainData) {
      if (typeElement) typeElement.innerText = terrainData.name;
      if (descElement) descElement.innerText = terrainData.description || "Описание отсутствует";
    } else {
      if (typeElement) typeElement.innerText = "Неизвестно";
      if (descElement) descElement.innerText = "Нет данных в базе";
    }
  }

  // Обработчик клика по таблице
  delegateHandler(event) {
    const td = event.target.closest('td');
    if (!td) return;  // Если кликнули мимо ячейки — выходим

    const [i, j] = td.dataset.coord.split('_').map(Number);  // Достаём координаты из тега(td)

    if (flags == true) {  // Если редактирование разрешено
      this.updateCell(td, i, j);
      this.displayInfo(i, j, this.scene.getCell(i, j));
    } else {
      // Если в руках ничего нет И если редактирование запрещено
      if (this.taken === false) {
          this.updateCell1(td);  // Забираем из ячейки
          this.displayInfo(i, j, this.scene.getCell(i, j));
      } 
      // Если в руках есть юнит
      else if (this.taken === true) {
          this.updateCell2(td);  // Кладем в новую ячейку
          this.displayInfo(i, j, this.scene.getCell(i, j));
      }
    }
  }

  // Изменение ячейки
  updateCell(tdElement, i, j) {
    let selected = parseInt(document.getElementById('terrain-select').value);  // Берем выбранный ID ландшафта из выпадающего списка

    // Если это юнит тогда добавляем img в td
    if (selected == 5) {
      let img = document.createElement('img');
      img.src = `./img/icon.png`;
      img.classList.add('img-size');
      tdElement.appendChild(img);
      this.units.push(`${i}_${j}`);
      return;
    } else {
      this.scene.setCell(i, j, selected);  // Меняем данные ячейки в массиве
      tdElement.className = 'terrain-' + selected;  // Меняем класс ячейки
    }  
  }
  updateCell1(tdElement) {
    const img = tdElement.querySelector('img');
    if (img) {
      this.taken_img = img;  // Сохраняем img в переменную
      img.remove();          // Удаляем img из HTML
      this.taken = true;     // Теперь юнит "в руках"
    }
  }
  updateCell2(tdElement) {
    if (this.taken_img) {
      tdElement.appendChild(this.taken_img);  // Вставляем сохраненную картинку
      this.taken_img = null;                  // Опустошаем переменную
      this.taken = false;                     // Сбрасываем флаг (рука пуста)
    }
  }
}