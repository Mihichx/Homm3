<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Homm3</title>
    <link rel="stylesheet" href="./template/default/css/style.css">
    <link rel="stylesheet" type="text/css" href="./template/default/css/terraincss.php">
    <link rel="icon" href="./template/default/img/icon.png">
    <script defer src="./template/default/js/system.js"></script>
    <script defer src="./template/default/js/save_loading.js"></script>
    <script defer src="./template/default/js/type.js"></script>
    <script defer src="./template/default/js/button.js"></script>
    <script defer src="./template/default/js/scene.js"></script>
    <script defer src="./template/default/js/screen.js"></script>
</head>
<script>
    let appScene;
    let appScreen;
    let matrix = null;
    flags = false;

    window.onload = function() {
        let saveMap = localStorage.getItem('save_map');
        if (saveMap) {
            matrix = JSON.parse(saveMap);
        }

        let mapData = {
            width: matrix?.length || 10,
            height: matrix?.[0]?.length || 10,
        };

        appScene = new Scene(mapData);
        if (matrix) {
            appScene.matrix = matrix;
            appScene.row = matrix.length;
            appScene.cols = matrix[0].length || 0;
        }

        appScreen = new Screen(appScene, 'map-container');
        appScreen.draw_map_game(matrix);
    }
</script>
<main class="map-main"> 
    <h2 id="create-map">Готовая карта</h2>
    <div class="controls">
        <input type="file" id="fileLoad">


        <div id="inspector" class="inspector-panel">
            <h3>Информация о клетке</h3>
            <p>Координаты: <span id="info-coords">Выберите клетку</span></p>
            <p>Содержание клетки: <span id="info-type"></span></p>
            <p>Описание: <span id="info-desc"></span></p>
        </div>
    </div>
    <button id="end_step" class="none">Закончить ход</button>
    <div id="map-container"></div>
</main>