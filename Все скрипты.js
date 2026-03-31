// Проверка: если ширина не определена, задаем её вручную прямо тут
if (typeof WIDTH_FORM === 'undefined') {
    WIDTH_BUTTON = 260;
    HEIGHT_BUTTON = 30;
    WIDTH_ALIGN = 10;
    HEIGHT_ALIGN = 10;
    WIDTH_FORM = (typeof TypeGroup !== 'undefined' ? TypeGroup.length : 5) * WIDTH_BUTTON + 60;
}

system.require('config.js');
system.require('utils.js');
system.require('logic_rename.js');
system.require('logic_select.js');
system.require('logic_panel.js');
system.require('logic_furniture.js');
system.require('logic_model.js');
system.require('logic_export.js');
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


ScriptForm.Form.Show();
