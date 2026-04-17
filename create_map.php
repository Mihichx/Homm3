<? 
    include_once './template/default/head.php';
?>
<main class="map-main"> 
    <div class="controls">
        <h2 id="create-map" class="title-create-map">Создание карты</h2>
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

        <button id="delate_unit">Удалить юнита</button>

        <div id="inspector" class="inspector-panel">
            <h3>Информация о клетке</h3>
            <p>Координаты: <span id="info-coords">Выберите клетку</span></p>
            <p>Содержание клетки: <span id="info-type"></span></p>
            <p>Описание: <span id="info-desc"></span></p>
        </div>

        <button type="submit" id="save1" onclick="system.save(document.getElementById('data').value);">Закончить редактирование</button>
    </div>
    <div id="map-container"></div>
</main>
<script> 
    localStorage.removeItem('save_map');
    localStorage.removeItem('unit_real_mas');
    localStorage.removeItem('unitMapByCoord');
</script>