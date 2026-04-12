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
    <script defer src="./template/default/js/main.js"></script>
</head>
<main class="map-main"> 
    <h2 id="create-map">Создание карты</h2>
    <div class="controls">
        <?php
            $width = isset($_GET['map_width']) ? (int)$_GET['map_width'] : 10;
            $height = isset($_GET['map_height']) ? (int)$_GET['map_height'] : 10;
        ?>
        <form method="GET" id="map-size-form">
            <input name="map_width" id="map_width" value="<?= $width ?>">
            <input name="map_height" id="map_height" value="<?= $height ?>">
            <button type="submit" style="width: 40px; height: 20px;">OK</button>
        </form>

        <button id="gen-scene" class="poly-btn">Стереть карту</button>
        <button id="save" onclick="system.save(document.getElementById('data').value);">Сохранить</button>
        <input type="file" id="fileLoad">

        <select id="terrain-select" class="poly-btn"><option value="">Выберите ландшафт</option></select>
        <select id="unit-select" class="poly-btn"><option value="">Выберите юнита</option></select>

        <button type="submit" id="save1" onclick="system.save(document.getElementById('data').value);">Закончить редактирование</button>
        <button id="delate_unit">Удалить юнита</button>

        <div id="inspector" class="inspector-panel">
            <h3>Информация о клетке</h3>
            <p>Координаты: <span id="info-coords">Выберите клетку</span></p>
            <p>Содержание клетки: <span id="info-type"></span></p>
            <p>Описание: <span id="info-desc"></span></p>
        </div>
    </div>
    <div id="map-container"></div>
</main>