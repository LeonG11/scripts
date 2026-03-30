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
