const MapLoader = {
    loadResources: function(callback) {
        typeList
            .setPath('answer.php') 
            .addType({code: 'terrain', name: "Ландшафт", column: "name"})
            .addType({code: 'units', name: "Юниты", column: "name"})
            .load(() => {
                const units = typeList.list.units ? typeList.list.units.getList() : null;
                
                if (units) {
                    units.forEach(item => {
                        const fullUnit = typeList.list.units.getOne(item.type);
                        const unitSpeed = parseInt(fullUnit?.speed) || 5;
                        
                        window.unitMap[item.type] = {
                            id: fullUnit?.id ?? Number(item.type),
                            name: fullUnit?.name ?? item.name,
                            type: item.type,
                            icon: `./template/default/img/${fullUnit?.icon}`,
                            health: fullUnit?.Health ?? 10,
                            speed: unitSpeed,
                            stamina: { current: unitSpeed, max: unitSpeed },
                            attack: fullUnit?.Attack ?? null,
                            protection: fullUnit?.Protection ?? null,
                            min_damage: fullUnit?.min_damage ?? null,
                            max_damage: fullUnit?.max_damage ?? null,
                            ammunition: fullUnit?.ammunition ?? null,
                        };
                    });
                }

                if (typeof callback === 'function') callback();
            });
    }
};