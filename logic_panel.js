function WeightPanel() {
  ScriptForm.Form.Visible = false;
  
  let Menu = Action.Properties;
  let Area = Menu.NewNumber('Общий вес, кг.', 0);
  let Density = Menu.NewNumber('Плотность материала кг/м3', 900);
  
  let CalcAreaButton = Menu.NewButton('Рассчитать вес');
  
  Menu.NewButton('Сбросить общий вес').OnClick = function() {
    Area.Value = 0;
  };
  Menu.NewButton('Закончить').OnClick = function() {
    Action.Finish();
  };

  // Функция для глубокого поиска панелей в блоках
  function GetWeight(obj, dens) {
    let w = 0;
    if (obj instanceof TFurnPanel) {
      let panel = obj.AsPanel;
      w = (panel.ContourWidth / 1000) * (panel.ContourHeight / 1000) * (panel.Thickness / 1000) * dens;
    } else if (obj.Count > 0) { // Если это блок/сборка, идем внутск
      for (let i = 0; i < obj.Count; i++) {
        w += GetWeight(obj.Objects[i], dens);
      }
    }
    return w;
  }

  CalcAreaButton.OnClick = function() {
    if (Model.SelectionCount > 0) {
      let tempWeight = 0;
      for (let i = 0; i < Model.SelectionCount; i++) {
        tempWeight += GetWeight(Model.Selections[i], Density.Value);
      }
      
      let total = Area.Value + tempWeight;
      Area.Value = Math.round(total * 100) / 100;
    } else {
      alert('Не выделено ни одной панели или блока');
    }
  };
}



function PaintPanel() {
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
}
