<?  
    include_once './template/default/head.php';
?>
<main class="map-main"> 
    <h2 id="create-map">Готовая карта</h2>
    <div class="controls">
        <div id="inspector" class="inspector-panel">
            <h3>Информация о клетке</h3>
            <p>Координаты: <span id="info-coords">Выберите клетку</span></p>
            <p>Содержание клетки: <span id="info-type"></span></p>
            <p>Описание: <span id="info-desc"></span></p>
        </div>
    </div>
    <button id="end_step">Закончить ход</button>
    <div id="map-container"></div>
</main>