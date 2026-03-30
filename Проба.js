ScriptForm = { Form: NewForm() };
let Props = ScriptForm.Form.Properties;

let IterButton = 0;

class ButtonForm {
  constructor(name, label) {
    this.name = name;
    this.label = label;
    this.ID = IterButton;
    this.button = ScriptForm[this.name] = Props.NewButton(this.label);
  }
  setOnClick(callback) {
    ScriptForm[this.name].OnClick = callback();
  }
}

const WIDTH_BUTTON_ALIGN = 20;
const HEIGHT_BUTTON_ALIGN = 20;
const WIDHT_BUTTON = 180;
const HEIGHT_BUTTON = 20;
const WIDTH_FORM = WIDTH_BUTTON_ALIGN * 3 + WIDTH_BUTTON * 2;
const HEIGHT_FORM = 400;

ScriptForm.Form.Width = WIDTH_FORM;
ScriptForm.Form.Height = HEIGHT_FORM;
ScriptForm.Form.Caption = 'Скрипты';

const ButtonCreate = {
  unselectall: 'Отменить выделение',
  finish: 'Закончить',
};

for (var key in ButtonCreate) {
  let CurrentButton = new ButtonForm(key, ButtonCreate[key]);
  CurrentButton.button.SetLayout(
    IterButton % 2 === 0
      ? WIDTH_BUTTON_ALIGN
      : WIDTH_BUTTON_ALIGN * 2 + WIDTH_BUTTON,
    Math.floor(IterButton / 2) * (HEIGHT_BUTTON_ALIGN + HEIGHT_BUTTON),
    WIDHT_BUTTON,
    HEIGHT_BUTTON
  );
}
