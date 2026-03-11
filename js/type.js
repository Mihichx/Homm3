// разделим на два класса - объект списка классов и класс данных
let typeList = (function() {
    let self;
    
    class TypeList {
        constructor() {
            this.name = 'Модуль справочников';
            this.version = '0.5';
            this.list = {};
            this.path = '/';
            
            self = this;
        }
        
        info() {
            return self.name + ' v' + self.version;
        }
        
        setPath(path) {
            self.path = path;
            return self;
        }
        
        addType(type) {
            if (!type['code']) return false;
            self.list[type['code']] = new DataType(type, self.path);
            return self;
        }
        
        // ожидание загрузки данных с сервера
        load(handler) {
            if (!system) {
                console.error('Не подключен системный модуль.');
                return false;
            }
            self.prepareData().then(handler);
        }
        
        // ждём когда все данные загрузятся с сервера
        async prepareData() {
            let totalLoad = false;
            
            for (let key in self.list)
            {
                let item = self.list[key];
                self.list[key].loadModel(self.path, key);
            }
            
            while (!totalLoad)
            {
                await system.pause(20);
                totalLoad = true;
                
                for (let key in self.list)
                {
                    totalLoad = totalLoad && self.list[key].getList();
                }
            }
        }
    }
    
    // по объекту со свойствами: type, name, image
    class DataType {
        constructor(item, path) {
            this.name = item.name;
            this.column = item.column ?? 'name';
            this.content = [];
            this.loaded = false;
            if (item.image) {
                this.image = new Image(); // основное изображение
                this.image.src = item.image;
            }
            this.init(item.image);
            this.allElementCash = false;
        }
        
        getAll() {
            return this.content;
                }
        getOne(type) {
            return this.content.find(item => item.id == type || item.type == type);
        }
        tileLoaded() {
            return this.loaded;
        }
        getTile() {
            return this.image;
        }
        
        // вернуть кэшируемый список объектов
        getList() {
            if (!this.allElementCash) {
                this.allElementCash = this.createList(this.content);
            }
            
            return this.allElementCash;
        }
        
        createList(content) {
            let list = [];
            for(let key in content) {
                list.push({
                    // Вместо key (индекса 0, 1, 2) берем реальное поле id из БД
                    type: content[key].id, 
                    name: content[key][this.column]
                });
            }
            return list.length ? list : false;
        }
        
        // получить отдельное свойство элемента
        getProperty(type, property) {
            return this.content[type][property];
        }
        
        // инициализировать картинки объектов
        createImages(code) {
            // Спрайты элементов
            let items = this.content;
            for (let key in items) {
                this.content[key].imageList[code] = new Image();
                this.content[key].imageList[code].src = this.content[key].imageSrc;
            }
        }
        
        // инициализация существующих объектов
        init(imageUrl) {
            let self = this;
            
            if (this.image) {
                this.image.onload = function() {
                    self.loaded = true;
                }
                this.image.onerror = function() {
                    self.loaded = true;
                    console.log('image error', imageUrl);
                }
            }
            
            return true;
        }
        
        loadModel(url, table) {
            let self = this;
            
            system.request(url, {table: table}).then(
                result => {
                    self.content = JSON.parse(result);
                },
                error => console.log(error)
            );
            
            return true;
        }
    }
    // Erid Nord
    
    return new TypeList();
})();