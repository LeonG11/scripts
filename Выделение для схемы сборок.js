Model.forEach(function(obj) {
    if (obj instanceof TFastener ) {
        nameOtv = obj.Name
        if(nameOtv.split(' ')[0]!="Отверстие"){obj.Selected = true}
    }
});
Action.DS.AngleX = 20;
Action.DS.AngleY = -20;
ViewAll();
