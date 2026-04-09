function counteritems() {
  createalert('скрипт выводит количество выделенных объектов');
  alert(`Количество выделенных объектов - ${Model.SelectionCount} шт.`);
  alert('Готово');
  Action.Finish();
}

function HideFlow() {
  createBackup(() => {
    let flag = confirm(
      'Скрипт скрывает габаритную рамку модели и линии стыков, хотите продолжить?'
    );
    if (flag) {
      Model.forEach((obj) => {
        if (obj instanceof TSize3D || obj instanceof TModelLimits) {
          obj.Visible = false;
        }
      });
    }
  });
}

function AreaPanel() {
  if (Model.SelectionCount == 0) {
    let flag = confirm(
      'Не выделено ни одной панели, хотите продолжить для всех панелей?'
    );
    if (flag) {
      Model.forEachPanel((panel) => {
        let color = panel.UserProperty['Покраска'];
        let codeColor = panel.UserProperty['Код'];
        if (color != '' && codeColor != 0) {
          // Здесь можно добавить логику накопления площади
        }
      });
    }
  } else {
    for (let i = 0; i < Model.SelectionCount; i++) {
      let panel = Model.Selections[i]; // Исправлено с .Selected на .Selections
      let color = panel.UserProperty['Покраска'];
      let codeColor = panel.UserProperty['Код'];
      if (color != '' && codeColor != 0) {
        alert('Ширина панели: ' + panel.ContourWidth);
      }
    }
  }
}

function DeselectFurniture() {
  for (let i = 0; i < Model.SelectionCount; i++) {
    let currentObject = Model.Selections[i];
    if (
      !(
        currentObject instanceof TFurnPanel ||
        currentObject instanceof TExtrusionBody
      )
    ) {
      currentObject.Selected = false;
    }
  }
  Action.Finish();
}

function HideNotVisible() {
  Model.forEach((obj) => {
    if (!obj.Visible && obj.Selected) obj.Selected = false;
  });
  Action.Finish();
}

function SelectOneDesignationDiffName() {
  alert(
    'Скрипт позволяет выделить объекты с одинаковым обозначением и разными наименованиями'
  );
  let designationMap = {};

  // Проходим по всем объектам модели
  Model.forEach((obj) => {
    // Проверяем наличие обозначения (свойство Designation)
    if (obj.Designation && obj.Designation != '') {
      if (!designationMap[obj.Designation]) {
        designationMap[obj.Designation] = new Set();
      }
      designationMap[obj.Designation].add(obj.Name);
    }
  });

  // Ищем обозначения, у которых более одного уникального имени
  const conflict = Object.entries(designationMap)
    .filter(([Designation, Names]) => Names.size > 1)
    .map(([Designation, Names]) => Designation);

  // Выделяем объекты, попавшие в список конфликтов
  Model.forEach((obj) => {
    if (conflict.includes(obj.Designation)) {
      obj.Selected = true;
    } else {
      obj.Selected = false; // Опционально: снимаем выделение с правильных
    }
  });

  // Формируем отчет
  const nameConflict = Object.entries(designationMap)
    .filter(([Designation, Names]) => Names.size > 1)
    .map(
      ([Designation, Names]) =>
        `Обозначение - ${Designation}, Наименования:\n${Array.from(Names).join('\n')}\n`
    );

  if (nameConflict.length == 0) {
    alert('Все объекты соответствуют именам');
  } else {
    alert('Найдены несовпадающие имена для одинаковых обозначений:\n\n' + nameConflict.join('\n'));
  }
  
  Action.Finish();
}
function DefaultColor() {
  let flag = confirm(
    'Скрипт преобразует цвета панелей, блоков, фурнитуры, линий связи в стандартный черный цвет. Замена производится для всех объектов модели.Хотите продолжить?'
  );
  if (flag) {
    createBackup(() => {
      Model.forEach((obj) => {
        if (obj.Color != 0) {
          obj.Color = 0;
        }
      });
    });
  }
}

function ScreenshotModel() {
  ScriptForm.Form.Visible = false;
  alert('Скрипт позволяет сохранить скриншоты модели в папку');

  let Menu = Action.Properties;
  let fileDir = Menu.NewString('Путь', 'H:\\Качанов Кирилл\\2026\ПРОЕКТЫ\\Скриншоты');

  Menu.NewButton('Задать путь').OnClick = () => {
    let currentDir = system.askFolder();
    if (!currentDir) alert('Путь не выбран!');
    else {
      fileDir.Value = currentDir;
      alert('Путь сохранен');
    }
  };

  let nameModel = Menu.NewString('Префикс файла', Action.Control.Article.Name);
  let angleVertical = Menu.NewNumber('Угол по вертикали', 20);
  let angleHorizontal = Menu.NewNumber('Угол по горизонтали', 20);
  let ratioPerspective = Menu.NewNumber('FOV камеры', 4.9);
  let getUpScreenshot = Menu.NewBool('Делать фото сверху', true);
  let getDownScreenshot = Menu.NewBool('Делать фото снизу', false);
  let isometric = Menu.NewBool('Сохранять в перспективе', false);

  angleVertical.OnChange = () => {
    Action.DS.AngleX = angleVertical.Value;
    ViewAll();
  };
  angleHorizontal.OnChange = () => {
    Action.DS.AngleY = angleHorizontal.Value;
    ViewAll();
  };
  ratioPerspective.OnChange = () => {
    Action.DS.Camera.PerspAspect = ratioPerspective.Value;
  };

  isometric.OnChange = () => {
    if (isometric.Value) {
      Action.DS.Camera.Perspective = true;
    } else {
      Action.DS.Camera.Perspective = false;
      Action.DS.Camera.Projection = 7;
    }
    ViewAll();
  };

  const angleGenerator = (v, h) => {
    return [
      [v, h],
      [v, -h],
      [v, 180 - h],
      [v, -(180 - h)],
    ];
  };

  const makePhoto = (VAngle, HAngle) => {
    let angles = angleGenerator(VAngle, HAngle);
    for (let i = 0; i < 4; i++) {
      let [x, y] = angles[i];
      let path = `${fileDir.Value}\\${nameModel.Value}_${
        VAngle > 0 ? 'Up' : 'Down'
      }_${i + 1}.jpg`;
      SetCamera(p3dIsometric);
      Action.DS.AngleX = x;
      Action.DS.AngleY = y;
      Action.DS.Camera.Perspective = isometric.Value;
      ViewAll();
      Action.Control.SavePicture(path);
    }
  };

  Menu.NewButton('Сделать фото').OnClick = () => {
    if (!fileDir.Value) return alert('Не выбран путь');
    if (getUpScreenshot.Value)
      makePhoto(angleVertical.Value, angleHorizontal.Value);
    if (getDownScreenshot.Value)
      makePhoto(-angleVertical.Value, angleHorizontal.Value);
    alert('Готово');
  };

  Menu.NewButton('Закончить').OnClick = () => Action.Finish();

  Action.OnFinish = () => {
    SetCamera(p3dIsometric);
    Action.DS.Camera.PerspAspect = 4.9;
    ViewAll();
    ScriptForm.Form.Visible = true;
  };
}
function CheckName() {
  createBackup(() => {
    let flag = confirm(
      'Скрипт проверяет вместимость названий панелей и модуля на бирке. Продолжить?'
    );
    if (flag) {
      let counter = 0;
      ScriptForm.Form.Visible = false;
      Model.forEach((obj) => {
        // Проверка на длину более 18 символов
        if (obj instanceof TFurnPanel && obj.Name.length > 18) {
          obj.Selected = true;
          counter++;
        }
      });
      alert(
        counter == 0
          ? 'Все панели проходят проверку'
          : 'Найдено ' + counter + ' длинных имен (>18 симв.)'
      );
    }
  });
}

function TechnicalButton() {
  let flag = confirm(
    'Этот скрипт предназначен для отладки, точно хотите продолжить?'
  );
  if (flag) {
    let info = '';
    let selected = Model.Selections[0]; // Берем первый выделенный объект
    if (selected) {
      for (let key in selected) {
        try {
          info += key + ' - ' + selected[key] + '\n';
        } catch (e) {}
      }
      alert(info);
    } else {
      alert('Ничего не выделено');
    }
  }
}

function RotationCamera() {
  const Menu = Action.Properties;
  ScriptForm.Form.Visible = false;

  const angles = [
    [40, 20],
    [40, -20],
    [40, 160],
    [40, -160],
    [20, 20],
    [20, -20],
    [20, 160],
    [20, -160],
    [20, 45],
    [20, -45],
    [20, 135],
    [20, -135],
  ];

  const Angle = Menu.NewCombo(
    'Угол',
    angles.map((a) => a.join(',')).join('\n')
  );
  const reverse = Menu.NewBool('Смотреть снизу');
  const isometric = Menu.NewBool('Перспектива');

  Angle.OnChange = () => {
    const [x, y] = Angle.Value.split(',');
    Action.DS.AngleX = reverse.Value ? -x : x;
    Action.DS.AngleY = y;
    ViewAll();
  };

  isometric.OnChange = () => {
    Action.DS.Camera.Perspective = isometric.Value;
    if (!isometric.Value) Action.DS.Camera.Projection = 7;
    ViewAll();
  };

  Menu.NewButton('Закончить').OnClick = () => Action.Finish();

  Action.OnFinish = () => {
    Action.DS.Camera.Perspective = false;
    Action.DS.Camera.Projection = 7;
    ViewAll();
    ScriptForm.Form.Visible = true;
  };
}

function CellSeparator() {
  const Menu = Action.Properties;
  ScriptForm.Form.Visible = false;

  let wSep = Menu.NewNumber('Ширина разделителя');
  let hSep = Menu.NewNumber('Глубина разделителя');
  let wCell = Menu.NewNumber('Ширина ячейки');
  let hCell = Menu.NewNumber('Глубина ячейки');
  let wCount = Menu.NewNumber('Кол-во ячеек по ширине');
  let hCount = Menu.NewNumber('Кол-во ячеек по глубине');
  let thIn = Menu.NewNumber('Толщина внут. мат-ла');
  let thOut = Menu.NewNumber('Толщина внеш. мат-ла');

  Menu.NewButton('Рассчитать').OnClick = () => {
    if (wSep.Value != 0 && wCell.Value != 0)
      return alert('Удалите либо размер ячейки, либо разделителя');

    if (wCell.Value == 0) {
      wCell.Value =
        (wSep.Value - 2 * thOut.Value - (wCount.Value - 1) * thIn.Value) /
        wCount.Value;
      hCell.Value =
        (hSep.Value - 2 * thOut.Value - (hCount.Value - 1) * thIn.Value) /
        hCount.Value;
    } else {
      wSep.Value =
        2 * thOut.Value +
        (wCount.Value - 1) * thIn.Value +
        wCount.Value * wCell.Value;
      hSep.Value =
        2 * thOut.Value +
        (hCount.Value - 1) * thIn.Value +
        hCount.Value * hCell.Value;
    }
  };
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  Action.OnFinish = () => {
    ScriptForm.Form.Visible = true;
  };
}

function CheckButts() {
  ScriptForm.Form.Visible = false;
  let MinSmallPanelSize = 35;
  let MinPanelSize = 200;
  let SmallPanelWithAllowance = [];
  let PanelWithoutAllowance = [];

  UnSelectAll();

  // 1. Сбор данных по модели
  Model.forEachPanel((obj) => {
    if (obj.Butts.Count != 0) {
      let { ContourHeight, ContourWidth } = obj;
      // Проверка: является ли панель "маленькой" или "узкой"
      let isSmallOrNarrow =
        (ContourHeight <= MinPanelSize && ContourWidth <= MinPanelSize) ||
        ContourHeight <= MinSmallPanelSize ||
        ContourWidth <= MinSmallPanelSize;

      for (let i = 0; i < obj.Butts.Count; i++) {
        let currentButt = obj.Butts.Butts[i];
        let { Allowance, Thickness } = currentButt;

        if (Thickness != 0) {
          if (isSmallOrNarrow && Allowance != 0) {
            // Узкие/маленькие панели не должны иметь прифуговку
            SmallPanelWithAllowance.push(obj);
          } else if (!isSmallOrNarrow && Allowance != 0.5) {
            // Большие панели должны иметь стандартную прифуговку 0.5
            PanelWithoutAllowance.push(obj);
          }
        }
      }
    }
  });

  // 2. Обработка результатов
  if (SmallPanelWithAllowance.length + PanelWithoutAllowance.length > 0) {
    let FindPanel1 = [];
    let FindPanel2 = [];

    // Фильтруем уникальные объекты по ArtPos (позиции)
    const getUnique = (arr) => {
      let unique = [];
      let seen = new Set();
      arr.forEach((p) => {
        if (!seen.has(p.ArtPos + p.Name)) {
          unique.push(p);
          seen.add(p.ArtPos + p.Name);
        }
      });
      return unique.sort((a, b) => Number(b.ArtPos) - Number(a.ArtPos));
    };

    FindPanel1 = getUnique(SmallPanelWithAllowance);
    FindPanel2 = getUnique(PanelWithoutAllowance);

    let start = confirm('Есть панели с неверной кромкой, показать информацию?');
    if (start) {
      let msg = '';
      if (FindPanel1.length > 0) {
        msg +=
          'Узкие или маленькие панели с включенной прифуговкой:\n\n' +
          FindPanel1.map((n) => `${n.ArtPos || 'Без поз.'} - ${n.Name}`).join(
            '\n'
          ) +
          '\n\n';
      }
      if (FindPanel2.length > 0) {
        msg +=
          'Большие панели с прифуговкой не 0.5мм:\n\n' +
          FindPanel2.map((n) => `${n.ArtPos || 'Без поз.'} - ${n.Name}`).join(
            '\n'
          );
      }

      let invoice = confirm(msg + '\n\nХотите выделить эти панели?');
      if (invoice) {
        let allWrongPanels = FindPanel1.concat(FindPanel2);
        Model.forEachPanel((Panel) => {
          allWrongPanels.forEach((wrong) => {
            if (Panel.ArtPos == wrong.ArtPos && Panel.Name == wrong.Name) {
              Panel.Selected = true;
            }
          });
        });
      }
    }
  } else {
    alert('Ошибок в кромках и прифуговке не найдено');
  }

  // 3. Завершение
  Action.Finish();
  ScriptForm.Form.Visible = true;
}

function RotateOrient() {
  createBackup(() => {
    let list =
      Model.SelectionCount > 0
        ? Model.Selections
        : Model.forEachPanel((p) => p);
    // В Базисе forEachPanel не возвращает массив, поэтому лучше так:
    if (Model.SelectionCount > 0) {
      for (let i = 0; i < Model.SelectionCount; i++)
        process(Model.Selections[i]);
    } else {
      Model.forEachPanel((p) => process(p));
    }
  });

  function process(p) {
    if (p.ContourWidth > p.ContourHeight) p.TextureOrientation = 1;
    else p.TextureOrientation = 2;
  }
  Action.Finish();
}


function DisassemblySelect() {
  UnSelectAll();
  ScriptForm.Form.Visible = false;
  Model.forEach((obj) => {
    if (obj instanceof TFastener && !obj.Name.startsWith('Отверстие')) {
      obj.Selected = true;
    }
  });
  // Устанавливаем ракурс для взрыв-схемы
  Action.DS.AngleX = 20;
  Action.DS.AngleY = -20;
  ViewAll();
  Action.Finish();
  ScriptForm.Form.Visible = true;
}
