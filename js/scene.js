/*
  SCENE: Отвечает только за данные (логику)
  Хранит информацию о том, где какая плитка находится.
*/
class Scene {
  constructor(data) {
    const config = data;
    this.rows = config.width;     // Берём данные из input
    this.cols = config.height;   // Берём данные из input
    this.matrix = [];           // Двумерный массив (сетка координат)
    this.generate();           // Сразу создаем пустую сетку
  }

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

  // Получает значение ячейки (тип территории) по координатам
  getCell(i, j) {
    return this.matrix[i][j];
  }

  // Меняет тип территории и сохраняет всю карту в текстовое поле для экспорта
  setCell(i, j, value, field = 'terrain') {
    const cell = this.matrix[i]?.[j];
    if (!cell) return;
    cell[field] = value;
  }

  checkMove(from, to) {
    const unit = this.matrix[from.i][from.j].unit;
    if (!unit) return false;

    const rowDiff = Math.abs(from.i - to.i);
    const colDiff = Math.abs(from.j - to.j);

    // ПУНКТ 9: Только линейное движение (одна из разниц должна быть 0)
    if (rowDiff !== 0 && colDiff !== 0) {
        alert("Движение только по прямой!");
        return false;
    }

    const distance = rowDiff + colDiff;

    // ПУНКТ 10: Проверка и уменьшение выносливости
    for (const h of unit_real_mas) {
      if (h.coord == `${from.i}-${from.j}`) {
        this.u = h;
      }
    }

    if (end_step) {
      this.u.stamina.current = this.u.stamina.max;
      end_step = false;
    }

    if (this.u.stamina.current >= distance) {
        this.u.stamina.current -= distance;
        return true;
    } else {
        alert(`Недостаточно выносливости! Нужно ${distance}, осталось ${unit.stamina.current}`);
        screen.taken_img.classList.remove('border');
        screen.taken = false;
        screen.taken_unit = null;
        screen.taken_img = null;
        screen.startCoords = null;
        return false;
    }
  }
}
