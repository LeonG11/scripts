function ExportMetalSpec() {
    ScriptForm.Form.Visible = false;

    let Menu = Action.Properties;
    let orderNumber = Action.Control.Article.OrderName || 'БН';
    let defaultDir = 'H:\\Качанов Кирилл\\Документы';
    let defaultFileName = 'Ведомость на металл № ' + orderNumber;

    let fileDir = Menu.NewString('Папка для сохранения', defaultDir);
    let fileName = Menu.NewString('Имя файла', defaultFileName);

    Menu.NewButton('Изменить папку').OnClick = () => {
        let currentDir = system.askFolder();
        if (currentDir) fileDir.Value = currentDir;
    };

    let mats = {}, blks = {};
    Model.forEach((obj) => {
        if (obj instanceof TFurnPanel || obj instanceof TExtrusionBody) {
            if (obj.MaterialName) mats[obj.MaterialName] = true;
        } else if (obj instanceof TFurnBlock || obj instanceof TFurnAsm) {
            if (obj.Name) blks[obj.Name] = true;
        }
    });

    // --- СВОРАЧИВАЕМ ГРУППЫ ПО УМОЛЧАНИЮ ---
    let MatGrp = Menu.NewGroup('Материалы (А-Я)');
    MatGrp.Expanded = false; 

    let BlkGrp = Menu.NewGroup('Сборки (А-Я)');
    BlkGrp.Expanded = false; 

    let mChecks = {}, bChecks = {};
    let keys = ['мет', 'сталь', 'алюм', 'профиль', 'труба', '08пс', 'ст3', 'шлиф', 'зерк', 'матовая'];

    Object.keys(mats).sort().forEach((m) => {
        mChecks[m] = MatGrp.NewBool(m, keys.some((k) => m.toLowerCase().indexOf(k) !== -1));
    });
    Object.keys(blks).sort().forEach((b) => {
        bChecks[b] = BlkGrp.NewBool(b, keys.some((k) => b.toLowerCase().indexOf(k) !== -1));
    });

    Menu.NewButton('🚀 Сформировать ведомость').OnClick = () => {
        try {
            // ФАЙЛ СОХРАНЯЕМ КАК .xls (Excel откроет HTML как таблицу)
            let fullPath = fileDir.Value + '\\' + fileName.Value + '.xls';
            
            const clean = (txt) => (txt || '').toString().replace(/;/g, ' ').replace(/[\r\n]+/g, ' ').trim();

            let detailsMap = {};
            let blocksMap = {};

            Model.forEach((obj) => {
                let name = clean(obj.Name);
                let matName = clean(obj.MaterialName);
                let des = clean(obj.Designation) || '-';

                if ((obj instanceof TFurnPanel || obj instanceof TExtrusionBody) && mChecks[obj.MaterialName] && mChecks[obj.MaterialName].Value) {
                    let sizeStr = obj instanceof TExtrusionBody ? 
                        Math.round(obj.GSize.x) + 'x' + Math.round(obj.GSize.y) + ' L=' + Math.round(obj.GSize.z) : 
                        Math.round(obj.ContourWidth) + 'x' + Math.round(obj.ContourHeight);
                    
                    // ГРУППИРОВКА ТОЛЬКО ПО ОБОЗНАЧЕНИЮ
                    let key = des;
                    if (!detailsMap[key]) {
                        detailsMap[key] = { des: des, name: name, mat: matName, size: sizeStr, count: 0 };
                    }
                    detailsMap[key].count++;
                } else if ((obj instanceof TFurnBlock || obj instanceof TFurnAsm) && bChecks[obj.Name] && bChecks[obj.Name].Value) {
                    let g = obj.GSize;
                    let sizeStr = Math.round(g.x) + 'x' + Math.round(g.y) + 'x' + Math.round(g.z);
                    let key = des;
                    if (!blocksMap[key]) {
                        blocksMap[key] = { des: des, name: name, size: sizeStr, count: 0 };
                    }
                    blocksMap[key].count++;
                }
            });

            // ПРЕВРАЩАЕМ В МАССИВЫ (Теперь они доступны внутри OnClick)
            let detailsList = [];
            for (let k in detailsMap) detailsList.push(detailsMap[k]);
            detailsList.sort((a, b) => a.mat.localeCompare(b.mat) || a.des.localeCompare(b.des, undefined, { numeric: true }));

            let blocksList = [];
            for (let k in blocksMap) blocksList.push(blocksMap[k]);
            blocksList.sort((a, b) => a.des.localeCompare(b.des, undefined, { numeric: true }));

            // ФОРМИРУЕМ HTML (Excel поймет стили и не превратит номера в даты)
            let html = '\ufeff<html><head><style>';
            html += 'table { border-collapse: collapse; } ';
            html += 'td { border: 1px solid gray; text-align: center; padding: 5px; font-family: Arial; font-size: 10pt; } ';
            html += '.header { background: #eeeeee; font-weight: bold; }';
            html += '</style></head><body>';

            // Таблица 1
            html += '<h3>ТАБЛИЦА 1: ДЕТАЛИ</h3><table><tr class="header"><td>№</td><td>Обозначение</td><td>Наименование</td><td>Материал</td><td>Размеры</td><td>Кол-во</td></tr>';
            let lastMat = "";
            detailsList.forEach((d, idx) => {
                // Защита от превращения в дату через CSS-свойство Excel
                html += `<tr><td>${idx + 1}</td><td style="mso-number-format:\'@\'">${d.des}</td><td>${d.name}</td><td>${d.mat}</td><td>${d.size}</td><td>${d.count}</td></tr>`;
            });
            html += '</table><br>';

            // Таблица 2
            html += '<h3>ТАБЛИЦА 2: СБОРКИ</h3><table><tr class="header"><td>№</td><td>Обозначение</td><td>Наименование</td><td>Размеры</td><td>Кол-во</td></tr>';
            blocksList.forEach((b, idx) => {
                html += `<tr><td>${idx + 1}</td><td style="mso-number-format:\'@\'">${b.des}</td><td>${b.name}</td><td>${b.size}</td><td>${b.count}</td></tr>`;
            });
            html += '</table></body></html>';

            system.writeTextFile(fullPath, html);
            alert('Готово! Файл сохранен как .xls (HTML-таблица).');
            Action.Finish();

        } catch (e) {
            alert('Ошибка при выгрузке: ' + e.message);
        }
    };

    Menu.NewButton('Закончить').OnClick = () => Action.Finish();
    Action.OnFinish = () => { ScriptForm.Form.Visible = true; };
}
