function WeightPanel()  {
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

function InfoAreaPanel() {
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

function PaintPanel () {
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
