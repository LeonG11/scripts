function SelectOff() {
  createAlert('Скрипт выделяет панели с выключенным учетом');
  let Menu = Action.Properties;
  let isDoc = Menu.NewBool('Учет в документации', false);
  let isSmeta = Menu.NewBool('Учет в смете', false);
  let isCut = Menu.NewBool('Учет в раскрое', false);
  let isCNC = Menu.NewBool('Учет в ЧПУ', false);

  Menu.NewButton('Выделить выбранные категории').OnClick = () => {
    Model.forEach((obj) => {
      if (
        (isDoc.Value && obj.UseInDocs === false) ||
        (isCut.Value && obj.UseInCutting === false) ||
        (isCNC.Value && obj.UseInCNC === false) ||
        (isSmeta.Value && obj.UseInEstimate === false)
      ) {
        obj.Selected = true;
      }
    });
  };

  Menu.NewButton('Выделить любой отключенный').OnClick = () => {
    Model.forEach((obj) => {
      if (
        obj.UseInDocs === false ||
        obj.UseInCutting === false ||
        obj.UseInCNC === false ||
        obj.UseInEstimate === false
      ) {
        obj.Selected = true;
      }
    });
  };
  Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
}

function SelectUserProperty() {
  ScriptForm.Form.Visible = false;
  alert(
    'Скрипт позволяет выделить все блоки, панели и профили с пользовательскими свойствами'
  );
  UnSelectAll();
  let counter = 0;
  Model.forEach((obj) => {
    if (obj.UserPropCount > 0) {
      obj.Selected = true;
      counter++;
    }
  });
  if (counter != 0) {
    alert('Выделено ' + counter + ' объектов');
  } else {
    alert('Все объекты без пользовательских свойств');
  }
  Action.Finish();
}

function SelectFastPanels() {
  ScriptForm.Form.Visible = false;
  let panels = [];
  if (Model.SelectionCount == 1 && Model.Selections[0] instanceof TFurnPanel) {
    let fasteners = Model.Selections[0].FindConnectedFasteners();
    fasteners.forEach((f) => {
      f.FindFastenedObjects().forEach((p) => panels.push(p));
    });
  }
  // Убираем дубликаты по UID
  let uniquePanels = panels.filter(
    (n, i, arr) => arr.findIndex((s) => s.UID === n.UID) === i
  );
  uniquePanels.forEach((p) => (p.Selected = true));

  if (uniquePanels.length == 0)
    alert('Данная панель не соединина с другими крепежом');
  else
    alert(
      'Выделено ' + uniquePanels.length + ' панели(ей) вместе с указанными'
    );
  Action.Finish();
}

function SelectDiffName() {
  createAlert(
    'Скрипт выделяет панели с одинаковой позицией, но разным наименованием'
  );
  let map = {};
  Model.forEachPanel((obj) => {
    if (obj.ArtPos && obj.ArtPos != '0') {
      if (!map[obj.ArtPos]) map[obj.ArtPos] = new Set();
      map[obj.ArtPos].add(obj.Name);
    }
  });

  let conflicts = Object.keys(map).filter((pos) => map[pos].size > 1);
  let counter = 0;
  Model.forEachPanel((obj) => {
    if (conflicts.includes(obj.ArtPos)) {
      obj.Selected = true;
      counter++;
    }
  });
  alert(counter > 0 ? 'Найдено конфликтов: ' + conflicts.length : 'Все чисто');
  Action.Finish();
}

function SelectHandDrilling() {
  ScriptForm.Form.Visible = false;
  alert('Скрипт позволяет выделить панели размером менее чем указанные');
  let Menu = Action.Properties;
  let hS = Menu.NewNumber('Минимальный размер', 40);
  Menu.NewButton('Выделить').OnClick = () => {
    Model.forEachPanel((p) => {
      if (p.ContourHeight < hS.Value || p.ContourWidth < hS.Value)
        p.Selected = true;
    });
  };
  Menu.NewButton('Закончить').OnClick = () => {
    alert('Готово');
    Action.Finish();
  };
}

// logic_select.js

function SelectPanelCutName() {
  createAlert(
    'Скрипт позволяет выбрать панель по наименованию или подписи паза'
  );
  let hasCuts = false;
  Model.forEachPanel((p) => {
    if (p.Cuts.Count > 0) hasCuts = true;
  });

  if (!hasCuts) {
    alert('В модели нет ни одного паза');
    return Action.Finish();
  }

  ScriptForm.Form.Visible = false;
  let Menu = Action.Properties;
  let names = new Set();
  let signs = new Set();

  Model.forEachPanel((p) => {
    for (let i = 0; i < p.Cuts.Count; i++) {
      names.add(p.Cuts.Cuts[i].Name);
      signs.add(p.Cuts.Cuts[i].Sign);
    }
  });

  let SignCombo = Menu.NewCombo('Обозначение', Array.from(signs).join('\n'));
  let NameCombo = Menu.NewCombo('Название', Array.from(names).join('\n'));

  Menu.NewButton('Выделить по обозначению').OnClick = () => {
    let val = SignCombo.Value;
    Model.forEachPanel((p) => {
      for (let i = 0; i < p.Cuts.Count; i++) {
        if (p.Cuts.Cuts[i].Sign == val) p.Selected = true;
      }
    });
  };

  Menu.NewButton('Выделить по названию').OnClick = () => {
    let val = NameCombo.Value;
    Model.forEachPanel((p) => {
      for (let i = 0; i < p.Cuts.Count; i++) {
        if (p.Cuts.Cuts[i].Name == val) p.Selected = true;
      }
    });
  };

  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  Action.OnFinish = () => {
    ScriptForm.Form.Visible = true;
  };
}

function SelectOneDesignationDiffName() {
  // 0. Подготовка интерфейса
  if (typeof ScriptForm !== 'undefined') {
    ScriptForm.Form.Visible = false;
  }

  alert(
    'ИНСТРУКЦИЯ:\n' +
    '1. Скрипт найдет группы с одинаковым артикулом, но разными именами.\n' +
    '2. Выделит ВСЕ объекты группы сразу и предложит ОБЩЕЕ имя.\n' +
    '3. Отчет сохранится на диск H.'
  );

  let designationMap = {};
  UnSelectAll();

  // 1. ТВОЙ ОРИГИНАЛЬНЫЙ ПОИСК (Проходим по всем объектам)
  Model.forEach((obj) => {
    if (obj.Designation && obj.Designation != '') {
      if (!designationMap[obj.Designation]) {
        designationMap[obj.Designation] = new Set();
      }
      designationMap[obj.Designation].add(obj.Name);
    }
  });

  // ТВОЙ ОРИГИНАЛЬНЫЙ ФИЛЬТР (Ищем обозначения, у которых более одного уникального имени)
  const conflict = Object.entries(designationMap)
    .filter(([Designation, Names]) => Names.size > 1)
    .map(([Designation, Names]) => Designation);

  // ПРОВЕРКА НАЛИЧИЯ КОНФЛИКТОВ
  if (conflict.length == 0) {
    alert('Все объекты соответствуют именам');
    if (typeof ScriptForm !== 'undefined') ScriptForm.Form.Visible = true;
    return Action.Finish();
  }

  // 2. ПОДГОТОВКА ОТЧЕТА
  let projectID = Action.Control.Article.OrderName ? Action.Control.Article.OrderName : "Без_номера";
  let logChanges = '--- ЖУРНАЛ ГРУППОВЫХ ИЗМЕНЕНИЙ ---\nАвтор: ' + system.userName + '\n';

  // 3. ГРУППОВОЙ ИНСПЕКТОР (Цикл по найденным конфликтам)
  if (confirm('Найдено артикулов с расхождениями: ' + conflict.length + '. Начать правку?')) {
    
    // Ставим модель в рамку один раз
    ViewAll();

    for (let i = 0; i < conflict.length; i++) {
      let currentDes = conflict[i];
      let currentNamesSet = designationMap[currentDes]; 
      let currentNamesArr = Array.from(currentNamesSet);

      // Выделяем всю группу объектов с этим обозначением
      UnSelectAll();
      Model.forEach((obj) => {
        if (obj.Designation === currentDes) {
          obj.Selected = true;
        }
      });

      // Обновляем экран, чтобы видеть выделение
      if (typeof Model.Refresh === 'function') Model.Refresh();

      let newName = prompt(
        'ПРОЕКТ: ' + projectID + '\n' +
        'АРТИКУЛ: ' + currentDes + '\n' +
        'ТЕКУЩИЕ ИМЕНА В ГРУППЕ:\n' + currentNamesArr.join('; ') + '\n\n' +
        'Введите ОБЩЕЕ имя для всей группы:', 
        currentNamesArr[0] // Предлагаем первое имя из списка как вариант
      );

      if (newName !== null && newName !== undefined) {
        logChanges += '\nАртикул: ' + currentDes + '\n';
        
        // Применяем имя ко всем объектам группы
        Model.forEach((obj) => {
          if (obj.Designation === currentDes) {
            let oldName = obj.Name;
            if (oldName !== newName) {
              obj.Name = newName;
              logChanges += '  [ИЗМЕНЕНО]  "' + oldName + '"  ->  "' + newName + '"\n';
            } else {
              logChanges += '  [БЕЗ ИЗМЕНЕНИЙ]  "' + oldName + '"\n';
            }
          }
        });
      }
    }
  }

  // 4. ЗАПИСЬ НА ДИСК H
  let networkPath = 'H:\\База СМ+\\Scripts\\Отчеты\\';
  let fullFileName = networkPath + projectID + ' отчет о расхождениях.txt';
  let finalReport = 'ОТЧЕТ О РАСХОЖДЕНИЯХ: ' + projectID + '\n' +
                    'Дата: ' + new Date().toLocaleString() + '\n' +
                    '------------------------------------------\n' + logChanges;

  try {
    system.writeTextFile(fullFileName, finalReport);
    alert('✅ ОТЧЕТ СОХРАНЕН: ' + fullFileName + '\n\n' + finalReport);
  } catch (e) {
    alert('❌ ОШИБКА ЗАПИСИ НА ДИСК H\n\n' + logChanges);
  }

  if (typeof ScriptForm !== 'undefined') ScriptForm.Form.Visible = true;
  Action.Finish();
}


function SearchOboz() {
  createAlert('Скрипт выделяет панели по обозначениям или диапазону');
  UnSelectAll();

  const input = prompt(
    'Введите значения через пробел или дефис (01.01.01 02.01.01-03)'
  );
  if (!input) return;

  let elements = [];
  input.split(' ').forEach((el) => {
    if (el.includes('-')) {
      elements.push(...generateDesignationRange(el));
    } else if (/^\d+(\.\d+)*$/.test(el)) {
      elements.push(el);
    }
  });

  if (elements.length === 0) return alert('Неверно указаны обозначения');

  let counter = 0;
  let stats = {};

  Model.forEach((obj) => {
    if (
      (obj instanceof TFurnPanel ||
        obj instanceof TExtrusionBody ||
        obj instanceof TFurnBlock) &&
      elements.includes(obj.Designation)
    ) {
      obj.Selected = true;
      stats[obj.Designation] = (stats[obj.Designation] || 0) + 1;
      counter++;
    }
  });

  if (counter > 0) {
    let report = Object.entries(stats)
      .map(([des, count]) => `Обозначение ${des} - ${count} шт.`)
      .join('\n');
    alert(`${report}\n\nВсего выделено: ${counter}`);
  } else {
    alert('Объекты не найдены');
  }
}

function SelectPanelForFactori() {
  class PanelSelect {
    constructor(panel) {
      this.panel = panel;
    }

    SelectForFactori() {
      let flag = false;
      let Butts = this.panel.Butts;
      let CountButts = Butts.Count;
      let Cuts = this.panel.Cuts;
      let CutsCount = Cuts.Count;

      let TriggerName = ['Припуск', 'Прип.', 'Пол.', 'Полировка'];
      let TriggerCuts = [
        '90',
        '915.380.11',
        '955.102.11',
        '955.103.11',
        '927.080.11',
        '914.060.11',
        '990.505.11',
        '10639',
        '914.817.11',
        'спил',
        'угол',
      ];

      // Проверка на стекло и зеркало
      if (
        !this.panel.MaterialName.includes('текло') &&
        !this.panel.MaterialName.includes('еркало')
      ) {
        // Проверка кромок
        if (CountButts != 0) {
          let UniqueButts = [];
          for (let i = 0; i < CountButts; i++) {
            let ButtsMaterial = Butts.Butts[i].Material.split('\r')[0];
            if (!UniqueButts.includes(ButtsMaterial))
              UniqueButts.push(ButtsMaterial);
            if (UniqueButts.length >= 2) flag = true;
          }

          for (let i = 0; i < CountButts; i++) {
            let CurrentButt = Butts.Butts[i];
            let ButtsMaterial = CurrentButt.Material.split('\r')[0];

            // Если прифуговка 0 или больше 2 мм
            if (CurrentButt.Allowance == 0 || CurrentButt.Allowance > 2)
              flag = true;

            // Проверка по именам-триггерам в кромке
            for (let name of TriggerName) {
              if (ButtsMaterial.includes(name)) flag = true;
            }
          }
        }

        // Проверка габаритов и формы
        if (
          this.panel.ContourHeight <= 40 ||
          this.panel.ContourWidth <= 40 ||
          !this.panel.IsContourRectangle ||
          this.panel.FrontFace != 2
        ) {
          flag = true;
        }

        // Проверка пазов
        if (CutsCount != 0) {
          for (let i = 0; i < CutsCount; i++) {
            let NameCut = Cuts.Cuts[i].Sign;
            for (let cutTrigger of TriggerCuts) {
              if (NameCut.includes(cutTrigger)) flag = true;
            }
          }
        }

        // Пользовательские свойства
        if (this.panel.UserPropCount != 0) flag = true;
      }

      if (flag) this.panel.Selected = true;
    }
  }

  // Запуск перебора всех панелей
  Model.forEachPanel((Panel) => {
    let worker = new PanelSelect(Panel);
    worker.SelectForFactori();
  });

  Action.Finish();
}
