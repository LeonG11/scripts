
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

function HideNotVisible() {
  Model.forEach((obj) => {
    if (!obj.Visible && obj.Selected) obj.Selected = false;
  });
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
  if (typeof ScriptForm !== 'undefined') ScriptForm.Form.Visible = false;

  let OrderName = Action.Control.Article.OrderName || "Без_заказа";
  let ObjectName = Action.Control.Article.Name || "Без_имени";
  
  let StateUpOrderName = 28;
  let StateUpObjectName = 14;
  let StateUpPanelName = 16; 
  let StateUpMaterialName = 29;

  let errorsFound = 0;
  let panelErrorsCount = 0; // Отдельный счетчик для панелей
  let foundLog = "=== 1. ОБНАРУЖЕННЫЕ ПРЕВЫШЕНИЯ ЛИМИТОВ ===\n";
  let panelMap = {}; 
  let conflictDesignations = []; 

  // 1. Сбор данных
  Model.forEach((obj) => {
    if (obj instanceof TFurnPanel) {
      let des = obj.Designation || "Без_обозначения";
      if (!panelMap[des]) {
        panelMap[des] = {
          name: obj.Name.trim(),
          mat: obj.MaterialName.trim(),
          count: 0
        };
      }
      panelMap[des].count++;
    }
  });

  // 2. Анализ заголовков
  if (OrderName.length > StateUpOrderName) {
    foundLog += "❌ ЗАКАЗ [" + OrderName + "] : " + OrderName.length + " симв. (Лимит " + StateUpOrderName + ")\n";
    errorsFound++;
  }
  if (ObjectName.length > StateUpObjectName) {
    foundLog += "❌ МОДЕЛЬ [" + ObjectName + "] : " + ObjectName.length + " симв. (Лимит " + StateUpObjectName + ")\n";
    errorsFound++;
  }

  // 3. Анализ панелей и материалов
  let panelLines = "";
  let materialLines = "";

  for (let des in panelMap) {
    let data = panelMap[des];
    if (data.name.length > StateUpPanelName) {
      panelLines += "⚠️ ПАНЕЛЬ [" + des + "] '" + data.name + "' : " + data.name.length + " симв.\n";
      conflictDesignations.push(des);
      errorsFound++;
      panelErrorsCount++;
    }
    if (data.mat.length > StateUpMaterialName) {
      let cleanMat = data.mat.replace(/[\r\n]+/g, " "); 
      materialLines += "⚠️ МАТЕРИАЛ [" + des + "] '" + cleanMat + "' : " + cleanMat.length + " симв.\n";
      errorsFound++;
    }
  }

  if (panelLines) foundLog += "\n[Длинные имена деталей]:\n" + panelLines;
  if (materialLines) foundLog += "\n[Длинные названия материалов]:\n" + materialLines;

  // 4. Инспектор
  let changeLog = "\n=== 2. ЖУРНАЛ ПРИНЯТЫХ МЕР ===\nАвтор: " + system.userName + "\n";

  if (panelErrorsCount > 0) {
    if (confirm("Найдено ошибок в именах панелей: " + panelErrorsCount + ". Исправить?")) {
      ViewAll();
      for (let i = 0; i < conflictDesignations.length; i++) {
        let currentDes = conflictDesignations[i];
        let oldName = panelMap[currentDes].name;

        UnSelectAll();
        Model.forEach((obj) => {
          if (obj instanceof TFurnPanel && obj.Designation === currentDes) obj.Selected = true;
        });
        if (typeof Model.Refresh === 'function') Model.Refresh();

        let newName = oldName;
        let isInputCorrect = false;

        while (!isInputCorrect) {
          newName = prompt("АРТИКУЛ: " + currentDes + "\nИМЯ: " + oldName + " (" + oldName.length + " симв.)\nЛИМИТ: " + StateUpPanelName, newName);
          if (newName === null) {
            isInputCorrect = true;
            changeLog += "➖ [" + currentDes + "] ОСТАВЛЕНО: '" + oldName + "'\n";
          } else if (newName.length <= StateUpPanelName) {
            isInputCorrect = true;
            Model.forEach((obj) => { if (obj.Selected) obj.Name = newName; });
            changeLog += "✅ [" + currentDes + "] ИЗМЕНЕНО: '" + oldName + "' -> '" + newName + "'\n";
          } else {
            alert("Ошибка! Длина " + newName.length + " симв. Лимит " + StateUpPanelName);
          }
        }
      }
    } else {
      changeLog += "Конструктор отказался исправлять панели.\n";
    }
  }

  // 5. Финал: Запись и текстовый вывод
  if (errorsFound > 0) {
    let networkPath = 'H:\\База СМ+\\Scripts\\Отчеты\\';
    let safeOrderName = OrderName.replace(/[/\\?%*:|"<>]/g, '-');
    let fileName = networkPath + safeOrderName + " лимиты бирки.txt";
    let finalReport = "ОТЧЕТ ПО БИРКАМ\nПроект: " + ObjectName + "\nДата: " + new Date().toLocaleString() + "\n" + "=".repeat(50) + "\n\n" + foundLog + changeLog;

    try {
      system.writeTextFile(fileName, finalReport);
      
      let msg = "";
      if (panelErrorsCount === 0) {
        msg = "✅ В названиях панелей всё норм.\n\n";
      } else {
        msg = "⚠️ В именах панелей были ошибки.\n\n";
      }
      
      alert(msg + "Полный отчет сохранен здесь:\n" + fileName);
      
    } catch (e) {
      alert("ОШИБКА ЗАПИСИ НА ДИСК H!");
    }
  } else {
    alert("✅ Все названия в норме (заказ, модель, панели и материалы)!");
  }

  if (typeof ScriptForm !== 'undefined') ScriptForm.Form.Visible = true;
  Action.Finish();
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
