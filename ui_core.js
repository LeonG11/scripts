ScriptForm = { Form: NewForm() };
Props = ScriptForm.Form.Properties;

// Назначение параметров окна из констант
ScriptForm.Form.Width = WIDTH_FORM;

ScriptForm.Form.Caption = 'Скрипты профигрупп';
// Обьявление кнопок в окне
for (let i = 0; i < SignGroup.length; i++) {
  let CurrentSign = Props.NewLabel(SignGroup[i].Sign);
  CurrentSign.SetLayout(
    WIDTH_ALIGN * (i + 1) + WIDTH_BUTTON * i,
    HEIGHT_ALIGN * 2,
    WIDTH_BUTTON,
    HEIGHT_BUTTON
  );
}

let IndexArray = [];

const buttonsToCreate = typeof InitButton !== 'undefined' ? InitButton : [];

for (let i = 0; i < TypeGroup.length; i++) {
  let matchGroupIndex = 0;
  for (let j = 0; j < buttonsToCreate.length; j++) {
    if (buttonsToCreate[j].GroupType == TypeGroup[i]) {
      let CurrentName = buttonsToCreate[j].Name;
      let CurrentDescription = buttonsToCreate[j].Description;
      ScriptForm[CurrentName] = Props.NewButton(CurrentDescription);
      let Button = ScriptForm[CurrentName];
      Button.SetLayout(
        WIDTH_ALIGN * (i + 1) + WIDTH_BUTTON * (i + 0),
        HEIGHT_ALIGN * (matchGroupIndex + 2) +
          HEIGHT_BUTTON * (matchGroupIndex + 1),
        WIDTH_BUTTON,
        HEIGHT_BUTTON
      );
      Button.OnClick = function () {
        if (typeof globalThis[CurrentName] === 'function') {
          globalThis[CurrentName]();
        } else {
          alert('Ошибка. Функция ' + CurrentName + ' не найдена');
        }
      };
      matchGroupIndex++;
    }
  }
  IndexArray.push(matchGroupIndex);
}

const MaxCountButton = Math.max(...IndexArray);
ScriptForm.Form.Height =
  MaxCountButton * HEIGHT_BUTTON + HEIGHT_ALIGN * (MaxCountButton + 6);
