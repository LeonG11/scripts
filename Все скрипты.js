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


ScriptForm.Form.Show();
