function WarningHideFurniture() {
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
}

function DeleteEmptyFurniture() {
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
}

function DeleteElastic() {
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
}

function FurnitureHoleSize() {
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
}
