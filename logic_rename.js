// logic_rename.js

function DuplicateArtPos() {
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
}

function RenameObjectWithArtPos() {
  createAlert('Скрипт проставляет позиции обьектов по формату Д-№детали');
  createBackup(() => {
    ScriptForm.Form.Visible = false;
    if (Model.SelectionCount != 0) {
      for (let i = 0; i < Model.SelectionCount; i++) {
        let ObjectPanel = Model.Selections[i];
        Undo.Changing(ObjectPanel);
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
}

function SelectPanelName() {
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
}

function RenameWordFromName() {
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
}

function DeleteWordFromName() {
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
}

function UppercaseLetter() {
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
}
