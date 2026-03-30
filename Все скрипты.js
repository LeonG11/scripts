system.require('config.js');
system.require('utils.js');
system.require('logic_rename.js');
system.require('logic_select.js');
system.require('logic_panel.js');
system.require('logic_furniture.js');
system.require('logic_model.js');
system.require('ui_core.js');
//if (typeof InitButton !== 'undefined') {
//  alert('Загружено кнопок ' + InitButton.length);
//}

function createBackup(callback) {
  Undo.RecursiveChanging(Model);
  callback();
  Model.Build();
  alert('Готово');
  Action.Finish();
}
function createAlert(message) {
  ScriptForm.Form.Visible = false;
  alert(message);
}

ScriptForm.WarningHideFurniture.OnClick = () => {
  createBackup(() => {
    let flagConfirm = confirm(
      'Скрипт автоматически скрывает всю фурнитуру,габаритные рамки, линии стыков фурнитуры.Необходимо в случае если модель очень большая, время скрытия обьектов может занимать до 5 минут. Хотите продолжить?'
    );
    if (flagConfirm) {
      Model.forEach((obj) => {
        if (obj instanceof TFastener || obj instanceof TModelLimits) {
          obj.Visible = false;
        }
      });
    }
  });
};

ScriptForm.ChangeColorMaterial.OnClick = () => {
  ScriptForm.Form.Visible = false;
  createAlert(
    'Скрипт позволяет заменить цвета материалов на предустановленные наборы'
  );
  let Menu = Action.Properties;
  let MaterialArray = [];
  Model.forEachPanel((Panel) => {
    if (
      !MaterialArray.map((n) => n.MaterialName).includes(Panel.MaterialName)
    ) {
      MaterialArray.push({
        MaterialName: Panel.MaterialName,
        DiffuseColor: Panel.Material.DiffuseColor,
      });
    }
    if (Panel.Butts.Count != 0) {
      for (let i = 0; i < Panel.Butts.Count; i++) {
        if (
          !MaterialArray.map((n) => n.MaterialName).includes(
            Panel.Butts.Butts[i].MaterialName
          )
        ) {
          MaterialArray.push({
            MaterialName: Panel.Butts.Butts[i].Material,
            DiffuseColor: Panel.Material.DiffuseColor,
          });
        }
      }
    }
  });
  let GroupMaterial = Menu.NewGroup('Материалы');
  MaterialArray.map((n) => {
    let CurrentColorButton = GroupMaterial.NewColor(
      n.MaterialName,
      n.DiffuseColor
    );
    CurrentColorButton.OnChange = () => {
      let CurrentMaterialName = CurrentColorButton.Name;
      let CurrentDiffuseColor = CurrentColorButton.Value;
      Model.forEachPanel((Panel) => {
        if (Panel.MaterialName == CurrentMaterialName) {
          Panel.Material.DiffuseColor = CurrentDiffuseColor;
        }
      });
    };
  });
};

ScriptForm.SelectDatumBlock.OnClick = () => {
  createAlert('Скрипт позволяет выделить фрагменты');
  Model.forEach((obj) => {
    if (obj instanceof TFurnBlock && obj.DatumMode != 0 && !obj.JointData)
      obj.Selected = true;
  });
  alert('Готово');
  Action.Finish();
};
ScriptForm.CounterItems.OnClick = () => {
  createAlert('Скрипт выводит количество выделенных объектов');
  alert(`Количество выделенных объектов - ${Model.SelectionCount} шт.`);
  alert('Готово');
  Action.Finish();
};
ScriptForm.HideFlow.OnClick = () => {
  createBackup(() => {
    let flag = confirm(
      'Скрипт скрывает габаритную рамку модели и линии стыков, хотите продолжить?'
    );
    if (flag) {
      Model.forEach((obj) => {
        if (obj instanceof TSize3D || obj instanceof TModelLimits) {
          if ((obj.Visible = true)) {
            obj.Visible = false;
          }
        }
      });
    }
  });
};
ScriptForm.SelectOff.OnClick = () => {
  createAlert('Скрипт выделяет панели с выключенным учетом');
  let Menu = Action.Properties;
  let isDocument = Menu.NewBool('Учет в документации', 0);
  let isSmeta = Menu.NewBool('Учет в смете', 0);
  let isCut = Menu.NewBool('Учет в раскрое', 0);
  let isCNC = Menu.NewBool('Учет в ЧПУ', 0);
  Menu.NewButton('Выделить').OnClick = () => {
    Model.forEach((obj) => {
      let { UseInDocs, UseInCNC, UseInCutting, UseInEstimate } = obj;
      if (isDocument.Value && UseInDocs !== undefined && UseInDocs == false)
        obj.Selected = true;
      if (isCut.Value && UseInCutting !== undefined && UseInCutting == false)
        obj.Selected = true;
      if (isCNC.Value && UseInCNC !== undefined && UseInCNC == false)
        obj.Selected = true;
      if (
        isSmeta.Value &&
        UseInEstimate !== undefined &&
        UseInEstimate == false
      )
        obj.Selected = true;
    });
  };
  Menu.NewButton('Выделить любой отключенный').OnClick = () => {
    Model.forEach((obj) => {
      let { UseInDocs, UseInCNC, UseInCutting, UseInEstimate } = obj;
      if (
        (UseInDocs !== undefined && UseInDocs == false) ||
        (UseInCutting !== undefined && UseInCutting == false) ||
        (UseInCNC !== undefined && UseInCNC == false) ||
        (UseInEstimate !== undefined && UseInEstimate == false)
      )
        obj.Selected = true;
    });
  };
  Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
  Menu.NewButton('Законить').OnClick = () => Action.Finish();
};

ScriptForm.SelectUserProperty.OnClick = () => {
  createAlert(
    'Скрипт выделит все обьекты в которых есть хотя бы одно пользовательское свойство'
  );
  UnSelectAll();
  Model.forEach((obj) => {
    if (obj.UserPropCount != 0) {
      obj.Selected = true;
    }
  });
  Action.Finish();
};
ScriptForm.RoundingPanel.OnClick = () => {
  createAlert(
    'Скрипт наносит радиус на панели, которые совпадают с выбранным материалом'
  );
  MaterialForm = { Form: NewForm() };
  let MaterialArray = [];
  Model.forEachPanel((obj) => {
    let CurrentMaterial = obj.MaterialName.split('\r')[0];
    if (!MaterialArray.includes(CurrentMaterial))
      MaterialArray.push(CurrentMaterial);
  });
  MaterialForm.Form.Caption = 'Выберите материалы';
  let WidthButton = Math.max(...MaterialArray.map((n) => n.length * 8));
  let HeightButton = 30;
  let WidthAlign = 10;
  let HeightAlign = 5;
  MaterialForm.Form.Width = WidthButton + WidthAlign;
  MaterialForm.Form.Height =
    (MaterialArray.length + 2) * (HeightButton + HeightAlign);
  MaterialArray.length * 20 + (MaterialArray.length - 1) * 10;
  let MaterialProps = MaterialForm.Form.Properties;
  for (let key in MaterialArray) {
    let Name = 'Bool' + key;
    MaterialForm[Name] = MaterialProps.NewBool(MaterialArray[key], true);
    let Button = MaterialForm[Name];
    Button.SetLayout(
      0,
      HeightButton * key + HeightAlign * key,
      WidthButton,
      HeightButton
    );
  }

  MaterialForm.Form.Show();
  let OKButton = MaterialProps.NewButton('Выделить');
  OKButton.SetLayout(
    WidthButton - 100,
    (MaterialArray.length + 2) * 30,
    100,
    30
  );
  OKButton.OnClick = () => {
    let CurrentMaterial = [];
    for (let key in MaterialForm) {
      if (MaterialForm[key] instanceof TScriptBoolOption) {
        let CurrentValue = MaterialForm[key].Value;
        let CurrentName = MaterialForm[key].Name;
        if (CurrentValue) CurrentMaterial.push(CurrentName);
      }
    }
    if (CurrentMaterial.length == 0) alert('Не выбрано ни одного материала');
    else {
      let conf = confirm(
        'Скрипт сделает скругление для панелей с выделенным(и) материалами, хотите продолжить?'
      );
      if (conf) {
        MaterialForm.Form.Visible = false;
        Model.forEachPanel((Panel) => {
          Undo.RecursiveChanging(Model);
          let CurrentPanelMaterial = Panel.MaterialName.split('\r')[0];
          if (CurrentMaterial.includes(CurrentPanelMaterial)) {
            const CreateCut = (obj) => {
              let CurrentCut = obj.AddCut('Скругление кромки 1мм');
              CurrentCut.Trajectory.AddEquidistant(
                Panel.Contour,
                0,
                false,
                false
              );
              CurrentCut.Contour.Load('radius1mm.frw');
              let CurrentCutBack = obj.AddCut('Скругление кромки обратка 1мм');
              let Thickness = Panel.Thickness;
              CurrentCutBack.Trajectory.AddEquidistant(
                Panel.Contour,
                0,
                false,
                false
              );
              CurrentCutBack.Contour.Load('radius1mm.frw');
            };
            CreateCut(Panel);
            Model.Build();
          }
        });
      }
      Model.Build();
      alert('Готово');
      Action.Finish();
    }
  };
};
const sortElement = (list) => {
  // рекурсивный обход всех обьектов до дочерних элементов
  for (let i = list.Count - 1; i >= 0; i--) {
    const inputElement = list[i];
    if (
      inputElement instanceof TFurnBlock ||
      inputElement instanceof TFurnAsm ||
      inputElement instanceof TDraftBlock ||
      inputElement instanceof TLayer3D
    ) {
      sortElement(inputElement);
    }
  }
  //Инициализация обьекта, содержащих массивы типов объектов
  let allObjects = {
    arrSystems: [], // Массив системных объектов
    arrTFurnPanel: [], // Массив панелей
    arrTExtrusionBody: [], // Массив профилей
    arrT2DTrajectoryBody: [], // Массив тел по траектории
    arrFurnBlock: [], // Массив блоков и полуфабрикатов
    arrFastSchemes: [], // массив схем крепежа
    arrTFurnAsm: [], // Массив сборок
    arrTFastener: [], // Массив фурнитур
    arrOther: [], // Массив прочих объектов
  };

  // проходимся по всем элементам, сортируем их по типу и добавляем в объект выше
  for (let i = 0; i < list.Count; i++) {
    const currentElement = list[i];
    if (currentElement instanceof TFurnPanel)
      allObjects.arrTFurnPanel.push(currentElement);
    else if (currentElement instanceof TModelLimits)
      allObjects.arrSystems.push(currentElement);
    else if (currentElement instanceof TExtrusionBody)
      allObjects.arrTExtrusionBody.push(currentElement);
    else if (currentElement instanceof T2DTrajectoryBody)
      allObjects.arrT2DTrajectoryBody.push(currentElement);
    else if (currentElement instanceof TFurnBlock && !currentElement.JointData)
      allObjects.arrTFurnBlock.push(currentElement);
    else if (currentElement instanceof TFurnBlock && currentElement.JointData)
      allObjects.arrFastSchemes.push(currentElement);
    else if (currentElement instanceof TDraftBlock)
      allObjects.arrTFurnBlock.push(currentElement);
    else if (currentElement instanceof TFurnAsm)
      allObjects.arrTFurnAsm.push(currentElement);
    else if (currentElement instanceof TFastener)
      allObjects.arrTFastener.push(currentElement);
    else allObjects.arrOther.push(currentElement);
  }

  const sortByField = (field) => {
    return (a, b) => (a[field] > b[field] ? 1 : -1);
  };

  for (let key in allObjects) {
    // проверяем не пустой ли массив с объектами
    if (allObjects[key].length > 0) {
      if (key == 'arrTFurnPanel' || key == 'arrTExtrusionBody') {
        allObjects[key].sort(sortByField('Name'));
      }
    }
  }
  let counter = 0;
  //Присваиваем новый индекс объекту согласно его расположению в массиве
  for (let key in allObjects) {
    for (let i = 0; i < allObjects[key]; i++) {
      let item = allObjects[key][i];
      item.OwnerIndex = counter;
      counter++;
      Undo.Changing(item);
      item.Build();
    }
  }
};

ScriptForm.AreaPanel.OnClick = () => {
  if (Model.SelectionCount == 0) {
    let flag = confirm(
      'Не выделено ни одной панели, хотите продолжить для всех панелей?'
    );
    if (flag) {
      Model.forEachPanel((panel) => {
        let color = panel.UserProperty['Покраска'];
        let codeColor = panel.UserProperty['Код'];
        if (color != '' && codeColor != 0) {
          let width = panel.ContourWidth;
          let height = panel.ContourHeight;
          let thickness = panel.Thickness;
        }
      });
    }
  }
  if (Model.SelectionCount != 0) {
    for (let i = 0; i < Model.SelectionCount; i++) {
      let panel = Model.Selected[i];
      let color = panel.UserProperty['Покраска'];
      let codeColor = panel.UserProperty['Код'];
      if (color != '' && codeColor != 0) {
        let width = panel.ContourWidth;
        let height = panel.ContourHeight;
        let thickness = panel.Thickness;
        alert(width);
      }
    }
  }
};

ScriptForm.AreaPanel.OnClick = () => {
  if (Model.SelectionCount == 0) {
    let flag = confirm(
      'Не выделено ни одной панели, хотите продолжить для всех панелей?'
    );
    if (flag) {
      Model.forEachPanel((panel) => {
        let color = panel.UserProperty['Покраска'];
        let codeColor = panel.UserProperty['Код'];
        if (color != '' && codeColor != 0) {
          let width = panel.ContourWidth;
          let height = panel.ContourHeight;
          let thickness = panel.Thickness;
        }
      });
    }
  }
  if (Model.SelectionCount != 0) {
    for (let i = 0; i < Model.SelectionCount; i++) {
      let panel = Model.Selected[i];
      let color = panel.UserProperty['Покраска'];
      let codeColor = panel.UserProperty['Код'];
      if (color != '' && codeColor != 0) {
        let width = panel.ContourWidth;
        let height = panel.ContourHeight;
        let thickness = panel.Thickness;
        alert(width);
      }
    }
  }
};

ScriptForm.DeselectFurniture.OnClick = () => {
  for (let i = 0; i < Model.SelectionCount; i++) {
    let currentObject = Model.Selections[i];
    if (
      currentObject instanceof TFurnPanel ||
      currentObject instanceof TExtrusionBody
    ) {
    } else currentObject.Selected = false;
  }
  Action.Finish();
};

ScriptForm.DeleteAssemblyUnit.OnClick = () => {
  createAlert(
    'Скрипт позволяет выделять все блоки и панели у которых включено свойство сборочной единицы'
  );
  Model.forEach((obj) => {
    if (obj instanceof TFurnBlock && obj.DatumMode == 0) {
      if (obj.IsAssemblyUnit == false) obj.Selected = true;
    }
  });
  alert('Готово');
  Action.Finish();
};

ScriptForm.HideNotVisible.OnClick = () => {
  Model.forEach((obj) => {
    if (!obj.Visible && obj.Selected) obj.Selected = false;
  });

  Action.Finish();
};

ScriptForm.SelectOneNumberDiffName.OnClick = () => {
  createAlert(
    'Скрипт позволяет выделить обьекты с одной позицией и разными наименованиями'
  );
  let positionMap = {};

  Model.forEach((obj) => {
    if (obj.ArtPos != '') {
      if (!positionMap[obj.ArtPos]) {
        positionMap[obj.ArtPos] = new Set();
      }
      positionMap[obj.ArtPos].add(obj.Name);
    }
  });

  const conflict = Object.entries(positionMap)
    .filter(([ArtPos, Name]) => [...Name].length > 1)
    .map(([ArtPos, Name]) => ArtPos);
  Model.forEach((obj) => {
    if (conflict.includes(obj.ArtPos)) obj.Selected = true;
  });
  const nameConflict = Object.entries(positionMap)
    .filter(([ArtPos, Name]) => [...Name].length > 1)
    .map(
      ([ArtPos, Name]) =>
        `Поз - ${ArtPos}, Наименования:\n${[...Name].join('\n')}\n`
    );
  if (nameConflict.length == 0) alert('Все обьекты правильные');
  else {
    alert('Найдены несовпадающие имена\n' + nameConflict.join('\n'));
  }
  alert('Готово');
  Action.Finish();
};

ScriptForm.SelectFastPanels.OnClick = () => {
  let SelectionPanel = [];
  if (Model.SelectionCount == 1 && Model.Selections[0] instanceof TFurnPanel) {
    let AllFasteners = Model.Selections[0].FindConnectedFasteners();
    for (let i = 0; i < AllFasteners.length; i++) {
      let CurrentFastener = AllFasteners[i];
      let CurrentPanelFind = CurrentFastener.FindFastenedObjects();
      for (let i = 0; i < CurrentPanelFind.length; i++) {
        SelectionPanel.push(CurrentPanelFind[i]);
      }
    }
  }

  SelectionPanel = SelectionPanel.filter(
    (n, i, arr) => arr.map((s) => s.UID).indexOf(n.UID) === i
  );

  for (let i = 0; i < SelectionPanel.length; i++) {
    SelectionPanel[i].Selected = true;
  }
  Action.Finish();
};

ScriptForm.SortStructureModel.OnClick = () => {
  let conf = confirm('Скрипт сортирует структуру модели, хотите продолжить?');

  if (conf) {
    Undo.RecursiveChanging(Model);
    if (Model.SelectionCount == 0) {
      alert('Сортировка производится во всей модели');
      sortElement(Model);
    } else {
      alert('Сортировка производится во всей модели');
      for (let i = 0; i < Model.SelectionCount; i++) {
        let currentElement = Model.Selections[i];
        if (
          currentElement instanceof TFurnBlock ||
          currentElement instanceof TFurnAsm ||
          currentElement instanceof TDraftBlock ||
          currentElement instanceof TLayer3D
        ) {
          sortElement(currentElement);
        } else {
        }
      }
    }
    Model.Build();
  }
  alert('Готово');
  Action.Finish();
};

ScriptForm.SelectDiffName.OnClick = () => {
  createAlert(
    'Скрипт выделяет панели с одинаковой позицией, но разным наименованием'
  );
  const getPanel = (panel) => {
    let { UID, Name, ArtPos } = panel;
    return {
      UIDPanel: UID,
      NamePanel: Name,
      ArtPosPanel: ArtPos,
    };
  };
  let panelArray = [];
  let findCount = [];
  let counter = 0;
  Model.forEachPanel((obj) => {
    let curr = getPanel(obj);
    panelArray.push(curr);
  });
  for (let elem in panelArray) {
    let currPanel = panelArray[elem];
    let { UIDPanel, NamePanel, ArtPosPanel } = currPanel;
    Model.forEachPanel((obj) => {
      let { UID, Name, ArtPos } = obj;
      if (
        ArtPosPanel == ArtPos &&
        NamePanel != Name &&
        UIDPanel != UID &&
        !obj.Selected &&
        ArtPos != 0
      ) {
        obj.Selected = true;
        counter++;
        findCount.push(ArtPosPanel);
      }
    });
  }
  if (counter == 0)
    alert('Все панели имеют одинаковые наименования с одинаковой позицией');
  else {
    alert(
      `Найдено ${counter} панелей с одинаковой позицией и разными наименованиями:\n\nНомера позиций и количество:\n${[
        ...new Set(findCount),
      ]
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(
          (n) => `${n} - ${findCount.filter((z) => z == n).length} панель(-и)`
        )
        .join('\n')}`
    );
  }
  alert('Готово');
  Action.Finish();
};

ScriptForm.DefaultColor.OnClick = () => {
  let flag = confirm(
    'Скрипт преобразует цвета панелей, блоков, фурнитуры, линий связи в стандартный черный цвет. Замена производится для всех объектов модели.Хотите продолжить?'
  );
  if (flag) {
    createBackup(() => {
      Model.forEach((obj) => {
        if (obj.Color != '0') {
          obj.Color = '0';
        }
      });
    });
  }
};

ScriptForm.RotateOrient.OnClick = () => {
  alert('Скрипт позволяет настроить ориентацию панелей');
  Undo.RecursiveChanging(Model);
  if (Model.SelectionCount == 0) {
    Model.forEachPanel((Panel) => {
      let Width = Panel.ContourWidth;
      let Height = Panel.ContourHeight;
      let Orient = Panel.TextureOrientation;
      if (Width > Height) Panel.TextureOrientation = 1;
      else Panel.TextureOrientation = 2;
    });
  } else {
    for (let i = 0; i < Model.SelectionCount; i++) {
      let Panel = Model.Selections[i];
      let Width = Panel.ContourWidth;
      let Height = Panel.ContourHeight;

      let Orient = Panel.TextureOrientation;
      if (Width > Height) Panel.TextureOrientation = 1;
      else Panel.TextureOrientation = 2;
    }
  }
  alert('Готово');
  Action.Finish();
};

ScriptForm.ScreenshotModel.OnClick = () => {
  ScriptForm.Form.Visible = false;
  alert('Скрипт позволяет сохранить скриншоты модели в папку');
  let Menu = Action.Properties;
  let fileDir = Menu.NewString('Путь', '');
  Menu.NewButton('Задать путь').OnClick = () => {
    let currentDir = system.askFolder();
    if (!currentDir) alert('Путь не выбран !');
    else {
      fileDir.Value = currentDir;
      alert('Путь сохранен');
    }
  };
  let nameModel = Menu.NewString('Префикс файла', Action.Control.Article.Name);
  let angleVertical = Menu.NewNumber('Угол по вертикали', 20);
  angleVertical.OnChange = () => {
    Action.DS.AngleX = angleVertical.Value;
    ViewAll();
  };
  let angleHorizontal = Menu.NewNumber('Угол по горизонтали', 20);
  angleHorizontal.OnChange = () => {
    Action.DS.AngleY = angleHorizontal.Value;
    ViewAll();
  };
  let ratioPerspective = Menu.NewNumber('FOV камеры', 4.9);
  ratioPerspective.OnChange = () => {
    Action.DS.Camera.PerspAspect = ratioPerspective.Value;
  };
  let getUpScreenshot = Menu.NewBool('Делать фото сверху', 1);

  let getDownScreenshot = Menu.NewBool('Делать фото снизу', 0);
  getDownScreenshot.OnChange = () => {
    Action.DS.AngleX = -Action.DS.AngleX;
    ViewAll();
  };
  let isometric = Menu.NewBool('Сохранять в перспективе', 0);
  isometric.OnChange = () => {
    if (isometric.Value) {
      Action.DS.Camera.Perspective = true;
    } else if (!isometric.Value) {
      Action.DS.Camera.Perspective = false;
      Action.DS.Camera.Projection = 7;
    }
    ViewAll();
  };
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  const angleGenerator = (...num) => {
    let angleArray = [];
    for (let index in num) {
      if (typeof num[index] == 'number') {
        let first = num[index];
        let second = Math.abs(180 - first);
        angleArray.push([first, first]);
        angleArray.push([first, -first]);
        angleArray.push([first, second]);
        angleArray.push([first, -second]);
      } else if (num[index] instanceof Array) {
        let [x, y] = num[index];
        angleArray.push([x, y]);
        angleArray.push([x, -y]);
        angleArray.push([x, Math.abs(y - 180)]);
        angleArray.push([x, -Math.abs(y - 180)]);
      }
    }
    return angleArray;
  };
  const makePhoto = (VAngle, HAngle, pathToFolder = '') => {
    let currentAngle = angleGenerator([VAngle, HAngle]);
    for (var i = 0; i < 4; i++) {
      let [x, y] = currentAngle[i];
      let currentPath = `${fileDir.Value}${nameModel.Value} ${
        VAngle > 0 ? 'Сверху' : 'Снизу'
      } ${isometric.Value ? 'Перспектива' : 'Изометрия'} ${
        i + 1
      } (${x},${y}).jpg`;
      SetCamera(p3dIsometric);
      Action.DS.AngleX = x;
      Action.DS.AngleY = y;
      if (isometric.Value) {
        Action.DS.Camera.Perspective = true;
      } else if (!isometric.Value) {
        Action.DS.Camera.Perspective = false;
        Action.DS.Camera.Projection = 7;
      }
      ViewAll();
      Action.Control.SavePicture(currentPath);
    }
  };
  Menu.NewButton('Сделать фото').OnClick = () => {
    if (!fileDir.Value) alert('Не выбран путь до папки');
    else if (!nameModel.Value) alert('Не введен префикс для файла');
    else if (angleVertical.Value == 0 || angleHorizontal.Value == 0)
      alert('Угол наклона камеры равен нулю');
    else if (!getUpScreenshot.Value && !getDownScreenshot.Value)
      alert('Не выбрана ни одна опция вида камеры');
    else {
      if (getUpScreenshot.Value) {
        makePhoto(angleVertical.Value, angleHorizontal.Value);
      }
      if (getDownScreenshot.Value) {
        makePhoto(-angleVertical.Value, angleHorizontal.Value);
      }
      alert('Готово');
    }
  };
  Action.OnFinish = () => {
    SetCamera(p3dIsometric);
    Action.DS.Camera.PerspAspect = 4.9;
    ViewAll();
    alert('Готово');
  };
};

ScriptForm.SelectHandDrilling.OnClick = () => {
  createAlert('Скрипт поможет рассчитать параметр ячейки и разделителя');
  let Menu = Action.Properties;
  let heightSelect = Menu.NewNumber('Ширина', 40);
  let widthSelect = Menu.NewNumber('Длина', 70);
  let selectButton = Menu.NewButton('Выделить');
  Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();

  selectButton.OnClick = () => {
    Model.forEachPanel((Panel) => {
      let height = Panel.ContourHeight;
      let width = Panel.ContourWidth;
      let minimalSet = heightSelect.Value;
      if (widthSelect.Value < heightSelect.Value) {
        minimalSet.Value = heightSelect.Value;
      }
      if (height < minimalSet || width < minimalSet) Panel.Selected = true;
    });
  };
};

ScriptForm.CheckName.OnClick = () => {
  createBackup(() => {
    let flag = confirm(
      'Скрипт проверяет вместимость названий панелей и модуля на бирке, то что не вместится на бирку будет выделено. Хотите продолжить?'
    );
    if (flag) {
      let counter = 0;
      ScriptForm.Form.Visible = false;
      Model.forEach((obj) => {
        if (obj instanceof TFurnPanel && /.{18,}/gi.test(obj.Name)) {
          obj.Selected = true;
          counter++;
        }
      });
      alert(
        `${
          counter == 0
            ? 'Все панели проходят проверку'
            : 'Найдено ' + counter + ' длинных наименований больше 18 символов'
        }`
      );
    }
  });
};

ScriptForm.DuplicateArtPos.OnClick = () => {
  createAlert(
    'Скрипт переносит наименование обьекта (блока,панели или всей модели) в позицию. Если позиции обьекта нет, то в позицию вносится только наименование обьекта'
  );
  createBackup(() => {
    if (Model.SelectionCount != 0) {
      alert('Замена производится в выделенных объектах');
      for (let i = 0; i < Model.SelectionCount; i++) {
        let obj = Model.Selections[i];
        if (obj.ArtPos != '') {
          obj.ArtPos = `${obj.ArtPos}/${obj.Name}`;
        } else if (obj.ArtPos == '') {
          obj.ArtPos = obj.Name;
        }
      }
    } else {
      let flag = confirm(
        'Расстановка позиции именем будет производиться во всех панелях, хотите продолжить?'
      );
      if (flag) {
        Model.forEach((obj) => {
          if (
            obj instanceof TFurnPanel ||
            obj instanceof TExtrusionBody ||
            obj instanceof TFurnAsm ||
            obj instanceof TDraftBlock ||
            obj instanceof TFurnBlock
          ) {
            if (obj.ArtPos != '') {
              Undo.Changing(obj);
              obj.ArtPos = `${obj.ArtPos}/${obj.Name}`;
              obj.Build();
            } else if (obj.ArtPos == '') {
              Undo.Changing(obj);
              obj.ArtPos = obj.Name;
              obj.Build();
            }
          }
        });
      }
    }
  });
};

//Скрипт переименование панелей по структуре "Д-№позиции панели"
ScriptForm.RenameObjectWithArtPos.OnClick = () => {
  createAlert('Скрипт проставляет позиции обьектов по формату Д-№детали');
  createBackup(() => {
    ScriptForm.Form.Visible = false;
    if (Model.SelectionCount != 0) {
      for (let i = 0; i < Model.SelectionCount; i++) {
        Undo.Changing(ObjectPanel);
        let ObjectPanel = Model.Selections[i];
        ObjectPanel.Name = `Д-${ObjectPanel.ArtPos}`;
        ObjectPanel.Build();
      }
    } else {
      let flag = confirm('Хотите проставить наименованияе для всех панелей?');
      if (flag) {
        Model.forEach((obj) => {
          if (obj instanceof TFurnPanel || obj instanceof TExtrusionBody) {
            Undo.Changing(obj);
            obj.Name = `Д-${obj.ArtPos}`;
            obj.Build();
          }
        });
      }
    }
  });
};

ScriptForm.AllowanceButts.OnClick = () => {
  createAlert(
    'Скрипт позволяет выбрать панели по одному или нескольким критериям кромки'
  );
  ScriptForm.Form.Visible = false;
  let counterButts = 0;
  Model.forEachPanel((Panel) => {
    if (Panel.Butts.Count != 0) counterButts++;
  });
  if (counterButts != 0) {
    let Menu = Action.Properties;

    let ButtsArray = [];
    const constructorVariable = (
      Material1,
      Allowance1,
      Thickness1,
      MaterialPanel1,
      UID1
    ) => {
      let ButtsPanel = {
        Material: Material1,
        Allowance: Allowance1,
        Thickness: Thickness1,
        MaterialPanel: MaterialPanel1,
        UID: UID1,
      };
      ButtsArray.push(ButtsPanel);
    };
    const initialArray = () => {
      Model.forEachPanel((Panel) => {
        let CounterButt = Panel.Butts.Count;
        if (CounterButt !== 0) {
          for (let i = 0; i < CounterButt; i++) {
            let CurrentButt = Panel.Butts.Butts[i];
            let CurrentMaterial = CurrentButt.Material.split('\r')[0];
            let CurrentAllowance = CurrentButt.Allowance;
            let CurrentMaterialPanel = Panel.MaterialName.split('\r')[0];
            let CurrentThicknessButt = CurrentButt.Thickness;
            let CurrentUID = Panel.UID;
            constructorVariable(
              CurrentMaterial,
              CurrentAllowance,
              CurrentThicknessButt,
              CurrentMaterialPanel,
              CurrentUID
            );
          }
        }
      });
    };
    initialArray();
    const screenInfo = (ObjArray) => {
      let string = '';
      for (const [key, value] of Object.entries(ObjArray)) {
        string = `${string}${key} - ${value}\n`;
      }
      alert(string);
    };
    let TechnicalSupport = Menu.NewButton('Режим разработки');
    TechnicalSupport.OnClick = () => {
      ButtsArray.forEach((elem) => {
        screenInfo(elem);
      });
    };
    const stringifyValuesFromKey = (key) => {
      let string = [];
      ButtsArray.forEach((elem) => {
        if (!string.includes(elem[key])) {
          string.push(elem[key]);
        }
      });
      return string.join('\n');
    };
    let AllowanceButtCombo = Menu.NewCombo(
      'Прифуговка',
      stringifyValuesFromKey('Allowance')
    );
    let MaterialButtCombo = Menu.NewCombo(
      'Материал кромки',
      stringifyValuesFromKey('Material')
    );
    let ThicknessButtCombo = Menu.NewCombo(
      'Толщина кромки',
      stringifyValuesFromKey('Thickness')
    );
    let MaterialPanelButtsCombo = Menu.NewCombo(
      'Материал панели',
      stringifyValuesFromKey('MaterialPanel')
    );
    let AllowanceButtCheckBox = Menu.NewBool('Учёт прифуговки');
    let MaterialButtCheckBox = Menu.NewBool('Учёт кромки');
    let ThicknessButtCheckBox = Menu.NewBool('Учёт толщину кромки');
    let MaterialPanelCheckBox = Menu.NewBool('Учёт материал панели');

    let SelectButton = Menu.NewButton('Выделить');
    Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
    Menu.NewButton('Закончить').OnClick = () => Action.Finish();

    const FilterPanel = (checkObject, currentFlow, element) => {
      let CheckPanel = [];
      let Counter = 0;
      for (let k in checkObject) {
        if (checkObject[k]) Counter++;
      }
      for (let key in checkObject) {
        if (checkObject[key] && currentFlow[key] == element[key]) {
          CheckPanel.push(true);
        }
      }
      if (!CheckPanel.includes(false) && CheckPanel.length == Counter) {
        return true;
      } else {
        return false;
      }
    };
    SelectButton.OnClick = () => {
      let FlagCheck = {
        Material: MaterialButtCheckBox.Value,
        Allowance: AllowanceButtCheckBox.Value,
        Thickness: ThicknessButtCheckBox.Value,
        MaterialPanel: MaterialPanelCheckBox.Value,
      };
      let Counter = 0;
      for (let i in FlagCheck) {
        if (FlagCheck[i]) Counter++;
      }
      if (Counter !== 0) {
        let CurrentValue = {
          Material: MaterialButtCombo.Value,
          Allowance: AllowanceButtCombo.Value,
          Thickness: ThicknessButtCombo.Value,
          MaterialPanel: MaterialPanelButtsCombo.Value,
        };
        let UIDArray = [];
        ButtsArray.forEach((elem) => {
          if (FilterPanel(FlagCheck, CurrentValue, elem)) {
            UIDArray.push(elem['UID']);
          }
        });
        Model.forEachPanel((Panel) => {
          UIDArray.forEach((elem) => {
            if (Panel.UID == elem) {
              Panel.Selected = true;
            }
          });
        });
      }
    };
  } else {
    alert('В модели нет кромок');
    Action.Finish();
  }
};

ScriptForm.SelectPanelCutName.OnClick = () => {
  createAlert(
    'Скрипт позволяет выбрать панель по наименоваинем или подписи паза'
  );
  let select = 0;
  ScriptForm.Form.Visible = false;
  Model.forEachPanel((Panel) => {
    if (Panel.Cuts.Count != 0) select++;
  });
  if (select != 0) {
    let Menu = Action.Properties;
    class CutsPanel {
      constructor(panel) {
        this.panel = panel;
        if (this.panel.Cuts.Count != 0) {
          this.cuts = this.panel.Cuts;
          this.count = this.cuts.Count;
        } else {
          this.count = 0;
        }
      }
      Inform() {
        if (this.count != 0) {
          let str = '';
          for (let i = 0; i < this.count; i++) {
            let CurrentCut = this.cuts.Cuts[i];
            str = `${i + 1}. ${CurrentCut.Sign} - ${CurrentCut.Name}\n`;
          }
          alert(str);
        }
      }
      Sign() {
        if (this.count != 0) {
          let SignArray = [];
          for (let i = 0; i < this.count; i++) {
            let CurrentCut = this.cuts.Cuts[i];
            if (!SignArray.includes(CurrentCut.Sign))
              SignArray.push(CurrentCut.Sign);
          }
          return SignArray;
        }
      }
      Name() {
        if (this.count != 0) {
          let NameArray = [];
          for (let i = 0; i < this.count; i++) {
            let CurrentCut = this.cuts.Cuts[i];
            if (!NameArray.includes(CurrentCut.Name))
              NameArray.push(CurrentCut.Name);
          }
          return NameArray;
        }
      }
    }
    let NameCutsArray = [];
    let SignCutsArray = [];
    Model.forEachPanel((Panel) => {
      if (Panel.Cuts.Count != 0) {
        let CurrentPanel = new CutsPanel(Panel);
        let CurrentName = CurrentPanel.Name();
        let CurrentSign = CurrentPanel.Sign();
        NameCutsArray.push(...CurrentName);
        SignCutsArray.push(...CurrentSign);
      }
    });
    NameCutsArray = NameCutsArray.filter((elem, index) => {
      return NameCutsArray.indexOf(elem) === index;
    });
    SignCutsArray = SignCutsArray.filter((elem, index) => {
      return SignCutsArray.indexOf(elem) === index;
    });
    let SignValue = Menu.NewCombo('Обозначение', SignCutsArray.join('\n'));
    let NameValue = Menu.NewCombo('Название', NameCutsArray.join('\n'));
    Menu.NewButton('Выделить по обозначению').OnClick = () => {
      Model.forEachPanel((Panel) => {
        if (Panel.Cuts.Count != 0) {
          let CurrentPanel = new CutsPanel(Panel);
          let CurrentSign = CurrentPanel.Sign();
          if (CurrentSign.includes(SignValue.Value.split('\n')[0])) {
            Panel.Selected = true;
          }
        }
      });
    };
    Menu.NewButton('Выделить по названию').OnClick = () => {
      Model.forEachPanel((Panel) => {
        if (Panel.Cuts.Count != 0) {
          let CurrentPanel = new CutsPanel(Panel);
          let CurrentName = CurrentPanel.Name();
          if (CurrentName.includes(NameValue.Value.split('\n')[0])) {
            Panel.Selected = true;
          }
        }
      });
    };
    Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
    Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  } else {
    alert('В модели нет ни одного паза');
    Action.Finish();
  }
};

//Вывод всех ключей обьекта в структуре
ScriptForm.TechnicalButton.OnClick = () => {
  let flag = confirm(
    'Этот скрипт предназначен для отладки, точно хотите продолжить?'
  );
  if (flag) {
    let InformArray = '';
    for (let key in Model.Selected) {
      try {
        InformArray = `${InformArray} ${key} - ${Model.Selected[key]}\n`;
      } catch (error) {
        console.log(error);
      }
    }
    alert(InformArray);
  }
};

//Выделение панелей с облицовкой пласти
ScriptForm.SelectPlastics.OnClick = () => {
  createAlert(
    'Скрипт выделяет все панели в которой находится облицовка пласти(-ей)'
  );
  UnSelectAll();
  Model.forEachPanel((Panel) => {
    if (Panel.Plastics.Count != 0) {
      Panel.Selected = true;
    }
  });
};
//Выделение панели содержащих слово
ScriptForm.SelectPanelName.OnClick = () => {
  createAlert(
    'Скрипт выделяет панели по введеному слову, если оно содержится в названии панели'
  );
  UnSelectAll();
  let counter = 0;
  let SearchName = prompt('Введите слово в названии').toLowerCase();
  Model.forEach((obj) => {
    if (new RegExp(SearchName, 'gi').test(obj.Name)) {
      obj.Selected = true;
      counter++;
    }
  });
  alert(`${counter == 0 ? 'Не найдено' : 'Найдено ' + counter + ' обьектов'}`);
};

ScriptForm.FurnitureHoleSize.OnClick = () => {
  createAlert(
    'Скрипт позволяет выделить фурнитуру по диаметру отверстий, либо одним размером (5,6,7), либо диапазоном (1-12) c шагом 1мм , если значение дробное, вводите его отдельно'
  );
  let counter = 0;
  UnSelectAll();
  const holeSize = prompt('Введите D или диапазон Dmin-Dmax');
  let holeSizeArray = []; //инициализируем пустой массив для всех размеров отверстий
  holeSize.split(' ').map((n) =>
    /-/gi.test(n)
      ? Array.from(
          {
            length: Number(n.split('-')[1]) - Number(n.split('-')[0]) + 1,
          },
          (_, i) => i + parseInt(n.split('-')[0])
        ).map((g) => holeSizeArray.push(g))
      : holeSizeArray.push(parseInt(n))
  );
  holeSizeArray = [...new Set(holeSizeArray)].sort((a, b) => a - b);
  Model.forEach((obj) => {
    if (obj instanceof TFastener) {
      for (let i = 0; i < obj.Holes.Count; i++) {
        let currentHole = obj.Holes[i].Diameter;
        if (holeSizeArray.includes(parseInt(currentHole)) && !obj.Selected) {
          obj.Selected = true;
          counter++;
        }
      }
    }
  });
  counter == 0
    ? alert('Не найдено обьектов')
    : alert(`Выделено ${counter} фурнитур`);
};

ScriptForm.DeleteEmptyFurniture.OnClick = () => {
  createAlert(
    'Скрипт удаляет все пустые схемы крепежа, в которых не содержится ничего кроме линии стыковки'
  );
  UnSelectAll();
  let EmptyScheme = [];
  Undo.Changing(Model);
  Model.forEach((obj) => {
    if (obj instanceof TModelLimits) {
      if (
        obj.Owner instanceof TFurnBlock &&
        obj.Owner.Count === 1 &&
        obj.Owner.DatumMode === 7
      ) {
        EmptyScheme.push(obj.Owner);
      }
    }
  });
  EmptyScheme.forEach((obj) => {
    DeleteObject(obj);
  });
  Model.Build();
  Action.Finish();
};

ScriptForm.DeleteElastic.OnClick = () => {
  createAlert('Скрипт удаляет всю эластичность на блоках в модели');
  Undo.RecursiveChanging(Model);

  function del(list) {
    for (let i = 0; i < list.Count; ++i) {
      if (list.Objects[i].ParamSectionNode('Elastic') !== undefined) {
        list.Objects[i].ParamRemoveSection('Elastic');
      }
      del(list.Objects[i]);
    }
  }
  const ConfirmDelete = confirm('Удалить эластичность?');
  if (ConfirmDelete) {
    del(Model);
  }
  Action.Finish();
};

ScriptForm.RenameWordFromName.OnClick = () => {
  createAlert(
    'Скрипт заменяет вписанное слово из всех наименований панелей на другую вписанную надпись'
  );
  let counter = 0;
  ScriptForm.Form.Visible = false;
  if (Model.SelectionCount != 0) {
    alert('Замена будет производиться среди выделенных панелей');
    let NewName = prompt('Введите название которое необходимо заменить');
    let PartName = prompt('Введите новое название');
    if (NewName != '' && PartName != '') {
      for (let i = 0; i < Model.SelectionCount; i++) {
        let CurrentPanelName = Model.Selections[i].Name;
        if (CurrentPanelName.includes(NewName)) {
          Undo.Changing(Model.Selections[i]);
          Model.Selections[i].Name = Model.Selections[i].Name.replace(
            NewName,
            PartName
          );
          counter++;
        }

        Model.Selections[i].Build();
      }
    } else {
      alert('Не введено слово для замены или поиска');
    }
  } else {
    alert('Замена будет производиться среди всех панелей');
    let NewName = prompt('Введите название которое необходимо заменить');
    let PartName = prompt('Введите новое название');
    if (NewName != '' && PartName != '') {
      Model.forEach((obj) => {
        Undo.Changing(obj);
        let CurrentName = obj.Name;
        if (CurrentName.includes(NewName)) {
          obj.Name = obj.Name.replace(NewName, PartName);
          counter++;
        }
        obj.Build();
      });
    } else {
      alert('Не введено слово для замены или поиска');
    }
  }
  if (counter != 0) {
    alert(`Заменено ${counter} наименований`);
  } else {
    alert('Не найдено имен для замены');
  }
  Action.Finish();
};

ScriptForm.DeleteWordFromName.OnClick = () => {
  createAlert('Скрипт удаляет вписанное слово из всех наименований панелей');
  let counter = 0;
  ScriptForm.Form.Visible = false;
  if (Model.SelectionCount != 0) {
    alert('Удаление будет производиться среди выделенных панелей');
    let NewName = prompt('Введите название которое необходимо удалить');
    if (NewName != '') {
      for (let i = 0; i < Model.SelectionCount; i++) {
        let CurrentPanelName = Model.Selections[i].Name;
        if (CurrentPanelName.includes(NewName)) {
          Undo.Changing(Model.Selections[i]);
          Model.Selections[i].Name = Model.Selections[i].Name.replace(
            NewName,
            ''
          );
          counter++;
        }
        Model.Selections[i].Build();
      }
    } else {
      alert('Не введено слово для поиска');
    }
  } else {
    alert('Удаление будет производиться среди всех панелей');
    let NewName = prompt('Введите название которое необходимо удалить');
    if (NewName != '') {
      Model.forEach((obj) => {
        Undo.Changing(obj);
        let CurrentName = obj.Name;
        if (CurrentName.includes(NewName)) {
          obj.Name = obj.Name.replace(NewName, '');
          counter++;
        }
        obj.Build();
      });
    } else {
      alert('Не введено слово для поиска');
    }
  }
  if (counter != 0) {
    alert(`Заменено ${counter} наименований`);
  } else {
    alert('Не найдено имен для замены');
  }
  Action.Finish();
};

ScriptForm.RotationCamera.OnClick = () => {
  createAlert('Скрипт поворачивает камеру по заранее определенным углам');
  const Menu = Action.Properties;
  ScriptForm.Form.Visible = false;
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  const angleGenerator = (...num) => {
    let angleArray = [];
    for (let index in num) {
      if (typeof num[index] == 'number') {
        let first = num[index];
        let second = Math.abs(180 - first);
        angleArray.push([first, first]);
        angleArray.push([first, -first]);
        angleArray.push([first, second]);
        angleArray.push([first, -second]);
      } else if (num[index] instanceof Array) {
        let [x, y] = num[index];
        angleArray.push([x, y]);
        angleArray.push([x, -y]);
        angleArray.push([x, Math.abs(y - 180)]);
        angleArray.push([x, -Math.abs(y - 180)]);
      }
    }
    return angleArray;
  };
  const Angle = Menu.NewCombo(
    'Угол',
    angleGenerator(40, 20, [20, 45]).join('\n')
  );
  const reverse = Menu.NewBool('Смотреть снизу');
  const isometric = Menu.NewBool('Перспектива');
  const ratioPerspective = Menu.NewNumber(
    'Степень перспективы меняй если знаешь что это',
    4.9
  );
  ratioPerspective.OnChange = () => {
    Action.DS.Camera.PerspAspect = ratioPerspective.Value;
  };
  reverse.OnChange = () => {
    if (reverse.Value) {
      Action.DS.AngleX = -Action.DS.AngleX;
      ViewAll();
    } else if (!reverse.Value) {
      Action.DS.AngleX = Angle.Value.split(',')[0];
      ViewAll();
    }
  };
  isometric.OnChange = () => {
    if (isometric.Value) {
      Action.DS.Camera.Perspective = true;
      ViewAll();
    } else if (!isometric.Value) {
      Action.DS.Camera.Perspective = false;
      Action.DS.Camera.Projection = 7;
      ViewAll();
    }
  };
  Angle.OnChange = () => {
    const [x, y] = Angle.Value.split(',');
    Action.DS.AngleX = x;
    Action.DS.AngleY = y;
    ViewAll();
  };
  // let str = ''
  // for(let key in Action.DS.Camera){
  //   str = `${str}${key} - ${Action.DS.Camera[key]}\n`
  // }
  // alert(str)
  Action.OnFinish = () => {
    Action.DS.Camera.PerspAspect = 4.9;
    Action.DS.Camera.Perspective = false;
    Action.DS.Camera.Projection = 7;
    ViewAll();
  };
};

ScriptForm.DisassemblySelect.OnClick = () => {
  UnSelectAll();
  ScriptForm.Form.Visible = false;
  Model.forEach((ModelObject) => {
    if (ModelObject instanceof TFastener) {
      FastenerName = ModelObject.Name;
      if (FastenerName.split(' ')[0] != 'Отверстие') {
        ModelObject.Selected = true;
      }
    }
  });
  Action.DS.AngleX = 20;
  Action.DS.AngleY = -20;
};

ScriptForm.CellSeparator.OnClick = () => {
  createAlert('Скрипт помогает рассчитать разделитель или ячейки разделителя');
  const Menu = Action.Properties;
  ScriptForm.Form.Visible = false;
  let widthSeparator = Menu.NewNumber('Ширина разделителя');
  let heightSeparator = Menu.NewNumber('Глубина разделителя');
  let widthCell = Menu.NewNumber('Ширина ячейки');
  let heightCell = Menu.NewNumber('Глубина ячейки');
  let widthCountCell = Menu.NewNumber('Кол-во ячеек по ширине');
  let heightCountCell = Menu.NewNumber('Кол-во ячеек по глубине');
  let thicknessIn = Menu.NewNumber('Толщина внут. мат-ла');
  let thicknessOut = Menu.NewNumber('Толщина внеш. мат-ла');
  let thicknessOneMaterial = Menu.NewNumber('Толщина мат-ла разд.');
  thicknessOneMaterial.Visible = false;
  let flagOneMaterial = Menu.NewBool('Одинаковый материал', false);
  let calcButton = Menu.NewButton('Рассчитать');
  // Menu.NewButton('Вывести данные').OnClick = () => {
  //   let data = [
  //     {
  //       value: widthSeparator.Value,
  //       name: 'Ширина разделителя',
  //     },

  //     {
  //       value: heightSeparator.Value,
  //       name: 'Глубина разделителя',
  //     },

  //     {
  //       value: widthCell.Value,
  //       name: 'Ширина ячейки',
  //     },

  //     {
  //       value: heightCell.Value,
  //       name: 'Глубина ячейки',
  //     },

  //     {
  //       value: widthCountCell.Value,
  //       name: 'Количество ячеек по ширине',
  //     },

  //     {
  //       value: heightCountCell.Value,
  //       name: 'Количество ячеек по глубине',
  //     },

  //     {
  //       value: thicknessIn.Value,
  //       name: 'Толщина внут. материала',
  //     },

  //     {
  //       value: thicknessOut.Value,
  //       name: 'Толщина внеш. материала',
  //     },

  //     {
  //       value: thicknessOneMaterial.Value,
  //       name: 'Толщина материала разд.',
  //     },
  //   ];
  //   let str = '';
  //   for (let elem in data) {
  //     if (data[elem].value != 0) {
  //       str = `${str}${data[elem].name}-${data[elem].value}\n`;
  //     }
  //   }
  //   system.log(str)
  // };
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  let countBlock = 0;
  flagOneMaterial.OnChange = () => {
    if (flagOneMaterial.Value) {
      thicknessOut.Visible = false;
      thicknessIn.Visible = false;
      thicknessOut.Value = 0;
      thicknessIn.Value = 0;
      thicknessOneMaterial.Visible = true;
    } else {
      thicknessOut.Visible = true;
      thicknessIn.Visible = true;
      thicknessOneMaterial.Visible = false;
      thicknessOneMaterial.Value = 0;
    }
  };
  calcButton.OnClick = () => {
    let CurrentWidthSeparator = widthSeparator.Value;
    let CurrentHeightSeparator = heightSeparator.Value;
    let CurrentWidthCell = widthCell.Value;
    let CurrentHeightCell = heightCell.Value;
    let CurrentWidthCountCell = widthCountCell.Value;
    let CurrentHeightCountCell = heightCountCell.Value;
    let CurrentThicknessOut = 0;
    let CurrentThicknessIn = 0;
    if (flagOneMaterial.Value) {
      CurrentThicknessOut = thicknessOneMaterial.Value;
      CurrentThicknessIn = thicknessOneMaterial.Value;
    } else {
      CurrentThicknessOut = thicknessIn.Value;
      CurrentThicknessIn = thicknessOut.Value;
    }
    if (
      CurrentWidthSeparator != 0 &&
      CurrentHeightSeparator != 0 &&
      CurrentWidthCell != 0 &&
      CurrentHeightCell != 0
    ) {
      alert(
        'Введено слишком много аргументов\nнеобходимо удалить либо размеры ячейки, либо размеры разделителя'
      );
    } else {
      if (CurrentThicknessOut == 0 || CurrentThicknessIn == 0) {
        alert('Не введена толщина материалов');
      } else if (CurrentWidthCountCell == 0 || CurrentHeightCountCell == 0) {
        alert('Не введено количество ячеек');
      } else if (
        CurrentWidthSeparator == 0 &&
        CurrentHeightSeparator == 0 &&
        CurrentWidthCell == 0 &&
        CurrentHeightCell == 0
      ) {
        alert('Не введены размеры ячейки или разделителя');
      } else {
        if (CurrentWidthCell == 0 && CurrentHeightCell == 0) {
          widthCell.Value =
            (CurrentWidthSeparator -
              2 * CurrentThicknessOut -
              (CurrentWidthCountCell - 1) * CurrentThicknessIn) /
            CurrentWidthCountCell;
          heightCell.Value =
            (CurrentHeightSeparator -
              2 * CurrentThicknessOut -
              (CurrentHeightCountCell - 1) * CurrentThicknessIn) /
            CurrentHeightCountCell;
        } else if (CurrentWidthSeparator == 0 && CurrentHeightSeparator == 0) {
          widthSeparator.Value =
            2 * CurrentThicknessOut +
            (CurrentWidthCountCell - 1) * CurrentThicknessIn +
            CurrentWidthCountCell * CurrentWidthCell;
          heightSeparator.Value =
            2 * CurrentThicknessOut +
            (CurrentHeightCountCell - 1) * CurrentThicknessIn +
            CurrentHeightCountCell * CurrentHeightCell;
        }
      }
    }
  };
};

ScriptForm.UppercaseLetter.OnClick = () => {
  UnSelectAll();
  Model.forEach((obj) => {
    Undo.Changing(obj);
    if (
      obj instanceof TFurnBlock ||
      obj instanceof TFurnPanel ||
      obj instanceof TExtrusionBody
    ) {
      obj.Name = obj.Name[0].toUpperCase() + obj.Name.slice(1);
      obj.Build();
    }
  });
  Action.Finish();
};

// Функция для генерации диапазона обозначений
function generateDesignationRange(rangeStr) {
  if (!rangeStr.includes('-')) return [rangeStr];

  const [prefix, endNumStr] = rangeStr.split('-');
  const parts = prefix.split('.');

  // Извлекаем последний компонент из префикса
  const lastPart = parts.pop();
  const startNum = parseInt(lastPart);
  const endNum = parseInt(endNumStr);

  // Проверяем валидность диапазона
  if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
    return [];
  }

  // Определяем длину для форматирования (сохраняем ведущие нули)
  const numLength = lastPart.length;

  const result = [];
  for (let i = startNum; i <= endNum; i++) {
    // Форматируем число с ведущими нулями
    const formattedNum = i.toString().padStart(numLength, '0');
    // Собираем полное обозначение
    result.push([...parts, formattedNum].join('.'));
  }

  return result;
}
// Основной код обработчика
ScriptForm.SearchOboz.OnClick = () => {
  createAlert(
    'Скрипт позволяет выделить панели по введенным обозначениям или диапазону обозначений'
  );
  UnSelectAll();
  let Counter = 0;

  const input = prompt(
    'Введите значения через пробел или дефис (например: 01.01.01 02.01.01-03)'
  );
  if (!input) return;

  const CreateElements = input.split(' ');
  let Elements = [];

  for (let CurrentElem of CreateElements) {
    if (CurrentElem.includes('-')) {
      const rangeElements = generateDesignationRange(CurrentElem);
      if (rangeElements.length > 0) {
        Elements.push(...rangeElements);
      } else {
        alert(`Неверный формат диапазона: ${CurrentElem}`);
      }
    } else {
      // Проверяем валидность отдельного обозначения
      if (/^\d+(\.\d+)*$/.test(CurrentElem)) {
        Elements.push(CurrentElem);
      }
    }
  }

  const ElementsJoin = {};
  if (Elements.length > 0) {
    Model.forEach((objects) => {
      if (
        objects instanceof TExtrusionBody ||
        objects instanceof TFurnPanel ||
        objects instanceof TFurnBlock
      ) {
        if (Elements.includes(objects.Designation)) {
          ElementsJoin[objects.Designation] =
            (ElementsJoin[objects.Designation] || 0) + 1;
          objects.Selected = true;
          Counter++;
        }
      }
    });

    if (Counter > 0) {
      let FinishState = Object.entries(ElementsJoin)
        .map(
          ([designation, count]) =>
            `Обозначение ${designation} - найдено ${count} шт.`
        )
        .join('\n');

      alert(`${FinishState}\n\nОбщее количество панелей - ${Counter}`);
    } else {
      alert(`Не найдено панелей с обозначением(-ями) ${Elements.join(', ')}`);
    }
  } else {
    alert('Неверно указаны обозначения панелей');
  }
};

ScriptForm.SearchPosition.OnClick = () => {
  createAlert(
    'Скрипт позволяет выделить панели по введеным отдельным позициям или диапазону'
  );
  UnSelectAll();
  let Counter = 0;
  let CreateElements = prompt('Введите значения через пробел или дефис').split(
    ' '
  );
  let Elements = [];
  for (let i = 0; i < CreateElements.length; i++) {
    let CurrentElem = CreateElements[i];
    if (CurrentElem.includes('-')) {
      let start = parseInt(CurrentElem.split('-')[0]);
      let end = parseInt(CurrentElem.split('-')[1]);
      let currentArray = Array.from({ length: end - start + 1 }, (_, index) =>
        String(start + index)
      );
      Elements.push(...currentArray);
    } else {
      Elements.push(CurrentElem);
    }
  }
  let ElementsJoin = {};
  if (Elements.length != 0) {
    Model.forEach((objects) => {
      if (objects instanceof TExtrusionBody || objects instanceof TFurnPanel) {
        if (Elements.includes(objects.ArtPos)) {
          if (ElementsJoin[objects.ArtPos] != undefined) {
            ElementsJoin[objects.ArtPos]++;
          } else {
            ElementsJoin[objects.ArtPos] = 1;
          }
          objects.Selected = true;
          Counter++;
        }
      }
    });
    if (Counter != 0) {
      let FinishState = '';
      for (let key in ElementsJoin) {
        FinishState = `${FinishState}Поз.№${key} - найдено ${ElementsJoin[key]}шт.\n`;
      }
      alert(`${FinishState}\nОбщее количество панелей - ${Counter}`);
    } else {
      alert(`Не найдено панелей с позицией(-ями) ${Elements.join(',')}`);
    }
  } else {
    alert('Неверно указаны позиции панелей');
  }
};

ScriptForm.SelectPanelForFactori.OnClick = () => {
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
      if (
        !this.panel.MaterialName.includes('текло') &&
        !this.panel.MaterialName.includes('еркало')
      ) {
        if (CountButts != 0) {
          let UniqueButts = [];
          for (let i = 0; i < CountButts; i++) {
            let CurrentButts = Butts.Butts[i];
            let ButtsMaterial = CurrentButts.Material.split('\r')[0];
            if (!UniqueButts.includes(ButtsMaterial))
              UniqueButts.push(ButtsMaterial);
            if (UniqueButts.length >= 2) flag = true;
          }
          for (let i = 0; i < CountButts; i++) {
            let CurrentButts = Butts.Butts[i];
            let Allowance = CurrentButts.Allowance;
            let ButtsMaterial = CurrentButts.Material.split('\r')[0];
            if (Allowance == 0 || Allowance > 2) {
              if (!flag) flag = true;
            }
            TriggerName.map((n) =>
              ButtsMaterial.includes(n) && !flag ? (flag = true) : null
            );
          }
        }
        if (
          this.panel.ContourHeight <= 40 ||
          this.panel.ContourWidth <= 40 ||
          !this.panel.IsContourRectangle ||
          this.panel.FrontFace != 2
        ) {
          if (!flag) flag = true;
        }
        if (CutsCount != 0) {
          for (let i = 0; i < CutsCount; i++) {
            let CurrentCut = Cuts.Cuts[i];
            let NameCut = CurrentCut.Sign;
            TriggerCuts.map((n) =>
              NameCut.includes(n) ? (flag = true) : null
            );
          }
        }
        if (this.panel.UserPropCount != 0) flag = true;
      }
      if (flag) this.panel.Selected = true;
    }
  }
  Model.forEachPanel((Panel) => {
    let CurrentPanel = new PanelSelect(Panel);
    CurrentPanel.SelectForFactori();
  });
  Action.Finish();
};

ScriptForm.WeightPanel.OnClick = () => {
  ScriptForm.Form.Visible = false;
  alert(
    'Выделение панелей идёт через структуру модели\nНе через нажатие на панели в модели'
  );
  let Menu = Action.Properties;
  let CalcAreaButton = Menu.NewButton('Рассчитать вес');
  let ResetArea = (Menu.NewButton('Сбросить общий вес').OnClick = () => {
    Area.Value = 0;
  });
  Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  let Area = Menu.NewNumber('Общий вес, кг.');
  let Flow = Menu.NewNumber('Плотность материала кг/м3', 900);
  class PanelWeight {
    constructor(panel) {
      this.panel = panel;
    }
    Weight() {
      let width = this.panel.ContourWidth / 1000;
      let height = this.panel.ContourHeight / 1000;
      let thickness = this.panel.Thickness / 1000;
      let CurrentFlow = Flow.Value;
      if (CurrentFlow != 0) {
        return width * height * thickness * CurrentFlow;
      } else {
        alert('Не введено значение плотности');
        return 0;
      }
    }
  }
  CalcAreaButton.OnClick = () => {
    let currentSelectedPanel = Model.Selections;
    let CounterSelected = Model.SelectionCount;
    if (CounterSelected != 0) {
      for (let i = 0; i < CounterSelected; i++) {
        let CurrentPanel = new PanelWeight(currentSelectedPanel[i]);
        Area.Value += CurrentPanel.Weight();
      }
    }
  };
};

ScriptForm.CheckButts.OnClick = () => {
  ScriptForm.Form.Visible = false;
  let MinSmallPanelSize = 35;
  let MinPanelSize = 200;
  let SmallPanelWithAllowance = [];
  let PanelWithoutAllowance = [];
  UnSelectAll();
  Model.forEachPanel((obj) => {
    if (obj.Butts.Count != 0) {
      let { ContourHeight, ContourWidth } = obj;
      if (
        (ContourHeight <= MinPanelSize && ContourWidth <= MinPanelSize) ||
        ContourHeight <= MinSmallPanelSize ||
        ContourWidth <= MinSmallPanelSize
      ) {
        for (let i = 0; i < obj.Butts.Count; i++) {
          let currentButt = obj.Butts.Butts[i];
          let { Allowance, Thickness } = currentButt;
          if (Thickness != 0 && Allowance != 0) {
            SmallPanelWithAllowance.push(obj);
          }
        }
      } else {
        for (let i = 0; i < obj.Butts.Count; i++) {
          let currentButt = obj.Butts.Butts[i];
          let { Thickness, Allowance } = currentButt;
          if (Thickness != 0 && Allowance != 0.5) {
            PanelWithoutAllowance.push(obj);
          }
        }
      }
    }
  });
  if (SmallPanelWithAllowance.length + PanelWithoutAllowance.length > 0) {
    let FindPanel1 = [];
    let FindPanel2 = [];
    if (SmallPanelWithAllowance.length > 0) {
      for (let i = 0; i < SmallPanelWithAllowance.length; i++) {
        let panel = SmallPanelWithAllowance[i];
        if (!FindPanel1.map((n) => n.ArtPos).includes(panel.ArtPos)) {
          FindPanel1.push(panel);
        }
      }
    }
    if (PanelWithoutAllowance.length > 0) {
      for (let i = 0; i < PanelWithoutAllowance.length; i++) {
        let panel = PanelWithoutAllowance[i];
        if (!FindPanel2.map((n) => n.ArtPos).includes(panel.ArtPos)) {
          FindPanel2.push(panel);
        }
      }
    }
    FindPanel1 = FindPanel1.sort((a, b) => Number(b.ArtPos) - Number(a.ArtPos));
    FindPanel2 = FindPanel2.sort((a, b) => Number(b.ArtPos) - Number(a.ArtPos));
    let start = confirm('Есть панели с неверной кромкой, показать информацию?');
    if (start) {
      let invoice = confirm(
        `${
          FindPanel1.length > 0
            ? 'Узкие или маленькие панели с включенной прифуговкой:\n\n'
            : ''
        }${FindPanel1.map(
          (n) => `${n.ArtPos == '' ? 'Без позиции' : n.ArtPos} - ${n.Name}`
        ).join('\n')}${
          FindPanel2.length > 0
            ? '\n\nБольшие панели с прифуговкой не 0.5мм:\n\n'
            : ''
        }${FindPanel2.map(
          (n) => `${n.ArtPos == '' ? 'Без позиции' : n.ArtPos} - ${n.Name}`
        ).join('\n')}\n\nХотите выделить эти панели?`
      );
      if (invoice) {
        let numbers = [];
        FindPanel1.concat(FindPanel2).map((n) => numbers.push(n));
        Model.forEachPanel((Panel) => {
          for (let i = 0; i < numbers.length; i++) {
            let currentPanel = numbers[i];
            let { ArtPos, Name } = currentPanel;
            let CurrentArtPos = Panel.ArtPos;
            let CurrentName = Panel.Name;
            if (CurrentArtPos == ArtPos && CurrentName == Name)
              Panel.Selected = true;
          }
        });
      }
    }
  }
  Action.Finish();
};

ScriptForm.InfoAreaPanel.OnClick = () => {
  ScriptForm.Form.Visible = false;
  let Menu = Action.Properties;
  let Area = Menu.NewNumber('Площадь,м2');
  let CalculateArea = Menu.NewButton('Рассчитать площадь');
  Menu.NewButton('Обнулить значение').OnClick = () => {
    Area.Value = 0;
  };
  Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  class PanelArea {
    constructor(panel) {
      this.panel = panel;
    }
    Area() {
      let width = this.panel.ContourWidth / 1000;
      let height = this.panel.ContourHeight / 1000;
      let thickness = this.panel.Thickness / 1000;
      return 2 * (width * height + width * thickness + height * thickness);
    }
  }
  CalculateArea.OnClick = () => {
    let currentSelectedPanel = Model.Selections;
    let CounterSelected = Model.SelectionCount;
    if (CounterSelected != 0) {
      for (let i = 0; i < CounterSelected; i++) {
        if (CounterSelected[i] instanceof TFurnPanel) {
          let CurrentPanel = new PanelArea(currentSelectedPanel[i]);
          Area.Value += CurrentPanel.Area();
        }
      }
    }
  };
};

ScriptForm.PaintPanel.OnClick = () => {
  ScriptForm.Form.Visible = false;
  let Menu = Action.Properties;
  let Area = Menu.NewNumber('Площадь покраски, м2', 0);
  let Weight = Menu.NewNumber('Вес краски, кг.', 0);
  let PaintComsumption = Menu.NewNumber('Расход краски, г/м2', 350);
  let CodePaint = Menu.NewNumber('Код покраски', 24);
  let AreaButton = Menu.NewButton('Рассчитать площадь');
  let WeightButton = (Menu.NewButton('Рассчитать вес').OnClick = () => {
    if (Area.Value != 0) {
      Weight.Value = (PaintComsumption.Value * Area.Value) / 1000;
    } else {
      alert('Не рассчитана площадь покраски');
    }
  });
  let AreaButtonReset = (Menu.NewButton('Обнулить площадь').OnClick = () => {
    Area.Value = 0;
  });
  let WeightButtonReset = (Menu.NewButton('Обнулить вес').OnClick = () => {
    Weight.Value = 0;
  });

  Menu.NewButton('Отменить выделение').OnClick = () => UnSelectAll();
  Menu.NewButton('Закончить').OnClick = () => Action.Finish();
  class PanelPaint {
    constructor(panel) {
      this.panel = panel;
      this.width = this.panel.ContourWidth / 1000;
      this.height = this.panel.ContourHeight / 1000;
      this.thickness = this.panel.Thickness / 1000;
      this.colorID = CodePaint.Value;
      this.Comsumption = PaintComsumption.Value;
      this.firstNumber = Math.floor(this.colorID / 10);
      this.secondNumber = this.colorID % 10;
    }
    CalcArea() {
      let OneSide = this.width * this.height;
      let LittleThick = this.height * this.thickness;
      return OneSide * this.firstNumber + LittleThick * this.secondNumber;
    }
  }
  AreaButton.OnClick = () => {
    let CounterSelected = Model.SelectionCount;
    if (CounterSelected != 0) {
      let SelectedCurrent = Model.Selections;
      for (let i = 0; i < CounterSelected; i++) {
        if (SelectedCurrent[i] instanceof TFurnPanel) {
          let CurrentPanel = new PanelPaint(SelectedCurrent[i]);
          Area.Value += CurrentPanel.CalcArea();
        }
      }
    } else {
      let flag = confirm(
        'Не выделено ни одной панели, хотите считать\nвсе панели в модели?'
      );
      if (flag) {
        Model.forEachPanel((Panel) => {
          let CurrentPanel = new PanelPaint(Panel);
          Area.Value += CurrentPanel.CalcArea();
        });
      }
    }
  };
  Action.Continue();
};

ScriptForm.Form.Show();
