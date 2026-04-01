function ExportMetalSpec() {
  ScriptForm.Form.Visible = false;

  let Menu = Action.Properties;
  let orderNumber = Action.Control.Article.Order || 'БН';
  let defaultDir = 'H:\\Качанов Кирилл\\Документы';
  let defaultFileName = 'Ведомость на металл № ' + orderNumber;

  let fileDir = Menu.NewString('Папка для сохранения', defaultDir);
  let fileName = Menu.NewString('Имя файла', defaultFileName);
  
  Menu.NewButton('Изменить папку').OnClick = () => {
    let currentDir = system.askFolder();
    if (currentDir) fileDir.Value = currentDir;
  };

  let mats = {}, blks = {};
  Model.forEach(obj => {
    if (obj instanceof TFurnPanel || obj instanceof TExtrusionBody) {
        if (obj.MaterialName) mats[obj.MaterialName] = true;
    } else if (obj instanceof TFurnBlock || obj instanceof TFurnAsm) {
        if (obj.Name) blks[obj.Name] = true;
    }
  });

  let MatGrp = Menu.NewGroup('Материалы (А-Я)');
  let BlkGrp = Menu.NewGroup('Сборки (А-Я)');
  let mChecks = {}, bChecks = {};
  let keys = ['мет', 'сталь', 'алюм', 'профиль', 'труба', '08пс', 'ст3', 'шлиф', 'зерк', 'матовая'];

  Object.keys(mats).sort().forEach(m => {
    mChecks[m] = MatGrp.NewBool(m, keys.some(k => m.toLowerCase().indexOf(k) !== -1));
  });
  Object.keys(blks).sort().forEach(b => {
    bChecks[b] = BlkGrp.NewBool(b, keys.some(k => b.toLowerCase().indexOf(k) !== -1));
  });

  Menu.NewButton('🚀 Сформировать ведомость').OnClick = () => {
    try {
        let fullPath = fileDir.Value + '\\' + fileName.Value + '.csv';
        const clean = (txt) => (txt || "").toString().replace(/;/g, ' ').replace(/[\r\n]+/g, ' ').trim();

        let detailsMap = {}; // Для группировки деталей
        let blocksMap = {};  // Для группировки блоков

        Model.forEach(obj => {
          let name = clean(obj.Name);
          let matName = clean(obj.MaterialName);
          let des = clean(obj.Designation) || "-";

          // А) ОБРАБОТКА ДЕТАЛЕЙ (Панели и Профили)
          if (obj instanceof TFurnPanel || obj instanceof TExtrusionBody) {
            if (mChecks[obj.MaterialName] && mChecks[obj.MaterialName].Value === true) {
              
              let sizeStr = "";
              if (obj instanceof TExtrusionBody) {
                // Для профилей берем габарит их контура (сечения) и длину вытягивания
                sizeStr = Math.round(obj.GSize.x) + 'x' + Math.round(obj.GSize.y) + ' L=' + Math.round(obj.GSize.z);
              } else {
                sizeStr = Math.round(obj.ContourWidth) + 'x' + Math.round(obj.ContourHeight);
              }

              // Ключ для группировки: Обозначение + Имя + Материал + Размер
              let key = des + '|' + name + '|' + matName + '|' + sizeStr;
              
              if (!detailsMap[key]) {
                detailsMap[key] = { des: des, name: name, mat: matName, size: sizeStr, count: 0 };
              }
              detailsMap[key].count++;
            }
          } 
          // Б) ОБРАБОТКА СБОРОК
          else if (obj instanceof TFurnBlock || obj instanceof TFurnAsm) {
            if (bChecks[obj.Name] && bChecks[obj.Name].Value === true) {
              let g = obj.GSize;
              let sizeStr = Math.round(g.x) + 'x' + Math.round(g.y) + 'x' + Math.round(g.z);
              
              // Ключ для блоков: Обозначение + Имя + Размер
              let key = des + '|' + name + '|' + sizeStr;

              if (!blocksMap[key]) {
                blocksMap[key] = { des: des, name: name, size: sizeStr, count: 0 };
              }
              blocksMap[key].count++;
            }
          }
        });

        // ПРЕВРАЩАЕМ В МАССИВЫ И СОРТИРУЕМ
        let detailsList = [];
        for (let k in detailsMap) detailsList.push(detailsMap[k]);
        detailsList.sort((a, b) => a.des.localeCompare(b.des, undefined, {numeric: true}));

        let blocksList = [];
        for (let k in blocksMap) blocksList.push(blocksMap[k]);
        blocksList.sort((a, b) => a.des.localeCompare(b.des, undefined, {numeric: true}));

        // ФОРМИРУЕМ СТРОКИ ТАБЛИЦЫ 1 (Детали)
        let rows = ['ТАБЛИЦА 1: ДЕТАЛИ', '№;Обозначение;Наименование;Материал;Размеры;Кол-во'];
        detailsList.forEach((d, idx) => {
          rows.push(`${idx + 1};${d.des};${d.name};${d.mat};${d.size};${d.count}`);
        });

        // ФОРМИРУЕМ СТРОКИ ТАБЛИЦЫ 2 (Сборки)
        rows.push('\nТАБЛИЦА 2: СБОРОЧНЫЕ ЕДИНИЦЫ', '№;Обозначение;Наименование;Размеры;Кол-во');
        blocksList.forEach((b, idx) => {
          rows.push(`${idx + 1};${b.des};${b.name};${b.size};${b.count}`);
        });

        system.writeTextFile(fullPath, '\ufeff' + rows.join('\n'));
        
        alert('Готово! Выгружено уникальных позиций:\nДеталей: ' + detailsList.length + '\nСборок: ' + blocksList.length);
        Action.Finish();

    } catch(e) {
      alert('Ошибка при выгрузке: ' + e.message);
    }
  };

  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  Action.OnFinish = () => { ScriptForm.Form.Visible = true; };
}