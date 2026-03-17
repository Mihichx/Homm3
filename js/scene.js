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

  // Заполняет матрицу значением "1" (трава)
  generate() {
    for (let i = 0; i < this.rows; i++) {
      this.matrix[i] = [];                   // Создаем строку
      for (let j = 0; j < this.cols; j++) {
        this.matrix[i][j] = 1;               // Создаем столбец
      }
    }
  }

  // Получает значение ячейки (тип территории) по координатам
  getCell(i, j) {
    return this.matrix[i][j];
  }

  // Меняет тип территории и сохраняет всю карту в текстовое поле для экспорта
  setCell(i, j, value) {
    this.matrix[i][j] = value;
  }
}