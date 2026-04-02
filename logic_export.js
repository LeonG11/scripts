function ExportMetalSpec() {
  ScriptForm.Form.Visible = false;

  let Menu = Action.Properties;
  let orderNumber = Action.Control.Article.OrderName || 'БН';

  let defaultDocDir = 'H:\\Качанов Кирилл\\Документы';
  let defaultFileName = 'Ведомость на металл № ' + orderNumber;

  let fileDir = Menu.NewString('Папка для отчета', defaultDocDir);
  let fileName = Menu.NewString('Имя файла', defaultFileName);

  Menu.NewButton('Изменить папку отчета').OnClick = () => {
    let currentDir = system.askFolder();
    if (currentDir) fileDir.Value = currentDir;
  };

  let mats = {},
    blks = {};
  Model.forEach((obj) => {
    if (obj instanceof TFurnPanel || obj instanceof TExtrusionBody) {
      if (obj.MaterialName) mats[obj.MaterialName] = true;
    } else if (obj instanceof TFurnBlock || obj instanceof TFurnAsm) {
      if (obj.Name) blks[obj.Name] = true;
    }
  });

  let mChecks = {},
    bChecks = {};
  let MatGrp = Menu.NewGroup('Материалы (А-Я)');
  MatGrp.Expanded = false;
  let BlkGrp = Menu.NewGroup('Сборки (А-Я)');
  BlkGrp.Expanded = false;
  let keys = [
    'мет',
    'сталь',
    'алюм',
    'профиль',
    'труба',
    '08пс',
    'ст3',
    'шлиф',
    'зерк',
    'матовая',
  ];

  Object.keys(mats)
    .sort()
    .forEach(
      (m) =>
        (mChecks[m] = MatGrp.NewBool(
          m,
          keys.some((k) => m.toLowerCase().indexOf(k) !== -1)
        ))
    );
  Object.keys(blks)
    .sort()
    .forEach((b) => (bChecks[b] = BlkGrp.NewBool(b, false)));

  Menu.NewButton('🚀 Сформировать ведомость').OnClick = () => {
    try {
      let fullPath = fileDir.Value + '\\' + fileName.Value + '.xls';
      const clean = (txt) =>
        (txt || '')
          .toString()
          .replace(/;/g, ' ')
          .replace(/[\r\n]+/g, ' ')
          .trim();

      let panelsMap = {},
        profilesMap = {},
        blocksMap = {};

      // 1. Сбор данных
      Model.forEach((obj) => {
        let name = clean(obj.Name),
          matName = clean(obj.MaterialName),
          des = clean(obj.Designation) || '-';

        if (mChecks[obj.MaterialName] && mChecks[obj.MaterialName].Value) {
          if (obj instanceof TFurnPanel) {
            let sz =
              Math.round(obj.ContourWidth) +
              'x' +
              Math.round(obj.ContourHeight);
            let key = des + '|' + name + '|' + matName + '|' + sz;
            if (!panelsMap[key])
              panelsMap[key] = {
                des: des,
                name: name,
                mat: matName,
                size: sz,
                count: 0,
              };
            panelsMap[key].count++;
          } else if (obj instanceof TExtrusionBody) {
            let section =
              Math.round(obj.GSize.x) + 'x' + Math.round(obj.GSize.y);
            let len = Math.round(obj.GSize.z);
            let key =
              des + '|' + name + '|' + matName + '|' + section + '|' + len;
            if (!profilesMap[key])
              profilesMap[key] = {
                des: des,
                name: name,
                mat: matName,
                section: section,
                len: len,
                count: 0,
              };
            profilesMap[key].count++;
          }
        }
        if (
          (obj instanceof TFurnBlock || obj instanceof TFurnAsm) &&
          bChecks[obj.Name] &&
          bChecks[obj.Name].Value
        ) {
          let g = obj.GSize,
            sz =
              Math.round(g.x) + 'x' + Math.round(g.y) + 'x' + Math.round(g.z);
          let key = des + '|' + name + '|' + sz;
          if (!blocksMap[key])
            blocksMap[key] = { des: des, name: name, size: sz, count: 0 };
          blocksMap[key].count++;
        }
      });

      // 2. Генерация HTML (стили с автошириной)
      let html =
        '\ufeff<html><head><style>' +
        'table { border-collapse: collapse; margin-bottom: 25px; } ' +
        'td { border: 1px solid #999; text-align: center; padding: 5px; font-family: Arial; font-size: 10pt; vertical-align: middle; } ' +
        '.head { background: #eee; font-weight: bold; white-space: nowrap; } ' +
        '.nowrap { white-space: nowrap; } ' +
        '.name-cell { text-align: left; min-width: 250px; } ' +
        'h3 { font-family: Arial; color: #333; }' +
        '</style></head><body>';

      // Формирование таблиц (Панели)
      let panelsList = Object.keys(panelsMap)
        .map((k) => panelsMap[k])
        .sort(
          (a, b) =>
            a.mat.localeCompare(b.mat) ||
            a.des.localeCompare(b.des, undefined, { numeric: true })
        );
      html +=
        '<h3>ТАБЛИЦА 1: ЛИСТОВЫЕ ДЕТАЛИ</h3><table><tr class="head"><td>№</td><td>Обозначение</td><td>Наименование</td><td>Материал</td><td>Размеры</td><td>Кол-во</td></tr>';
      panelsList.forEach(
        (d, i) =>
          (html += `<tr><td>${
            i + 1
          }</td><td class="nowrap" style="mso-number-format:\'@\'">${
            d.des
          }</td><td class="name-cell">${d.name}</td><td class="nowrap">${
            d.mat
          }</td><td class="nowrap">${d.size}</td><td>${d.count}</td></tr>`)
      );
      html += '</table>';

      // Профили
      let profilesList = Object.keys(profilesMap)
        .map((k) => profilesMap[k])
        .sort(
          (a, b) =>
            a.mat.localeCompare(b.mat) ||
            a.des.localeCompare(b.des, undefined, { numeric: true })
        );
      html +=
        '<h3>ТАБЛИЦА 2: ПРОФИЛИ</h3><table><tr class="head"><td>№</td><td>Обозначение</td><td>Наименование</td><td>Материал</td><td>Сечение</td><td>Длина</td><td>Кол-во</td></tr>';
      profilesList.forEach(
        (p, i) =>
          (html += `<tr><td>${
            i + 1
          }</td><td class="nowrap" style="mso-number-format:\'@\'">${
            p.des
          }</td><td class="name-cell">${p.name}</td><td class="nowrap">${
            p.mat
          }</td><td class="nowrap">${p.section}</td><td class="nowrap"><b>${
            p.len
          }</b></td><td>${p.count}</td></tr>`)
      );
      html += '</table>';

      // Сборки
      let blocksList = Object.keys(blocksMap)
        .map((k) => blocksMap[k])
        .sort((a, b) =>
          a.des.localeCompare(b.des, undefined, { numeric: true })
        );
      html +=
        '<h3>ТАБЛИЦА 3: СБОРКИ</h3><table><tr class="head"><td>№</td><td>Обозначение</td><td>Наименование</td><td>Габариты</td><td>Кол-во</td></tr>';
      blocksList.forEach(
        (b, i) =>
          (html += `<tr><td>${
            i + 1
          }</td><td class="nowrap" style="mso-number-format:\'@\'">${
            b.des
          }</td><td class="name-cell">${b.name}</td><td class="nowrap">${
            b.size
          }</td><td>${b.count}</td></tr>`)
      );
      html += '</table></body></html>';

      // 3. БЕЗОПАСНАЯ ЗАПИСЬ ФАЙЛА
      try {
        system.writeTextFile(fullPath, html);
        alert('Успех! Ведомость сохранена.');
        Action.Finish();
      } catch (fileError) {
        alert(
          '❌ ОШИБКА ЗАПИСИ!\n\nСкорее всего, файл открыт в Excel.\nЗакрой Excel и нажми кнопку "Сформировать" еще раз.'
        );
        // Скрипт не заканчивается (Action.Finish не вызываем), даем шанс исправиться
      }
    } catch (e) {
      alert('Критическая ошибка: ' + e.message);
    }
  };
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
}
