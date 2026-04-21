const UnitMovement = {
    /**
     * Пытается переместить юнит
     * @returns {boolean} - успешно ли прошло перемещение
     */
    move: function(scene, unit, targetCoords, startCoords, unitMapByCoord) {
        const { i, j } = targetCoords;
        const targetCell = scene.getCell(i, j);
        if (targetCell && targetCell.unit) {
            alert('Клетка занята!');
            return false;
        }
        if (scene.checkMove(startCoords, { i, j })) {
            scene.setCell(startCoords.i, startCoords.j, null, 'unit');
            scene.setCell(i, j, unit, 'unit');

            unitMapByCoord.delete(`${startCoords.i}_${startCoords.j}`);
            unitMapByCoord.set(`${i}_${j}`, unit);

            if (unit) {
                unit.coord = { i, j };
            }
            return true;
        }

        return false;
    }
};