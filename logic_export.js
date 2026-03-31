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

  // 1. Сбор уникальных данных для меню (чекбоксов)
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

  // 2. Логика выгрузки
  Menu.NewButton('🚀 Сформировать ведомость').OnClick = () => {
    try {
        let fullPath = fileDir.Value + '\\' + fileName.Value + '.csv';
        const clean = (txt) => (txt || "").toString().replace(/;/g, ' ').replace(/[\r\n]+/g, ' ').trim();

        let detailsData = []; // Сюда собираем детали для сортировки
        let blocksRows = ['\nТАБЛИЦА 2: СБОРОЧНЫЕ ЕДИНИЦЫ (БЛОКИ)', '№;Наименование;Обозначение;Размеры;Кол-во'];
        let blkCount = 1;

        // ПРОХОД ПО МОДЕЛИ
        Model.forEach(obj => {
          let name = clean(obj.Name);
          let matName = clean(obj.MaterialName);
          let des = clean(obj.Designation) || "-";

          // А) ПРОВЕРКА ПАНЕЛЕЙ
          if (obj instanceof TFurnPanel || obj instanceof TExtrusionBody) {
            // Проверяем, стоит ли галочка на этом материале
            if (mChecks[obj.MaterialName] && mChecks[obj.MaterialName].Value === true) {
              detailsData.push({
                des: des,
                name: name,
                mat: matName,
                size: Math.round(obj.ContourWidth) + 'x' + Math.round(obj.ContourHeight)
              });
            }
          } 
          // Б) ПРОВЕРКА СБОРОК
          else if (obj instanceof TFurnBlock || obj instanceof TFurnAsm) {
            if (bChecks[obj.Name] && bChecks[obj.Name].Value === true) {
              let g = obj.GSize;
              blocksRows.push(`${blkCount};${name};${des};${Math.round(g.x)}x${Math.round(g.y)}x${Math.round(g.z)};1`);
              blkCount++;
            }
          }
        });

        // 3. СОРТИРОВКА ДЕТАЛЕЙ ПО ОБОЗНАЧЕНИЮ (Цифровая)
        detailsData.sort((a, b) => a.des.localeCompare(b.des, undefined, {numeric: true}));

        // 4. ФОРМИРОВАНИЕ СТРОК ДЕТАЛЕЙ (После сортировки)
        let detailsRows = ['ТАБЛИЦА 1: ДЕТАЛИ (ПАНЕЛИ)', '№;Обозначение;Наименование;Материал;Размеры;Кол-во'];
        detailsData.forEach((d, idx) => {
          // Порядок: №;Обозначение;Наименование;Материал;Размеры;Кол-во
          detailsRows.push(`${idx + 1};${d.des};${d.name};${d.mat};${d.size};1`);
        });

        // 5. ЗАПИСЬ В ФАЙЛ
        let finalOutput = ['\ufeff'].concat(detailsRows, [""], blocksRows);
        system.writeTextFile(fullPath, finalOutput.join('\n'));
        
        alert('Готово! Выгружено:\nДеталей: ' + detailsData.length + '\nСборок: ' + (blkCount - 1));
        Action.Finish();

    } catch(e) {
      alert('Ошибка при выгрузке: ' + e.message);
    }
  };

  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  Action.OnFinish = () => { ScriptForm.Form.Visible = true; };
}