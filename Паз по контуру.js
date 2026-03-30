if(Model.SelectionCount!=0){
Action.Continue();
Prop = Action.Properties;
Freza = Prop.NewSelector('Профиль фрезы');
OkBtn = Prop.NewButton('Построить');
Freza.OnClick = function() {
    Freza.Value = system.askFileName('frw');
};

OkBtn.OnClick = function() {
    //это ваш код
    for (var i = 0; i < Model.SelectionCount; ++i) {
        if (Model.Selections[i] instanceof TFurnPanel) {
            var Panel = Model.Selections[i];
            Undo.Changing(Panel); //эта строка обязательна, иначе после нанесения пазов, модель "пока этого не видит" и кнопки удаления/редактирования паза остаются неактивны.
            var p1 = Panel.GMin.x;
            var p2 = Panel.GMin.y;
            var p3 = Panel.GMax.x;
            var p4 = Panel.GMax.y;
            var p5 = Panel.Thickness;
            Cut = Panel.AddCut('Паз'); //можно и так, нет принципиально Cut = Panel.Cuts.Add('Паз');
            Panel.TextureOrientation = TextureOrientation.None;
            Cut.Trajectory.AddRectangle(p1, p2, p3, p4);
            Cut.Contour.Load(Freza.Value);
            Cut.Contour.Move(0, p5);
            Panel.Build();
        }
    }
    Action.Finish();
}
}
else{

alert('Не выделено ни одной панели')
}