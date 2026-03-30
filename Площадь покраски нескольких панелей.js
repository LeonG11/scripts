PanelArr = Model.Selections


if(Model.SelectionCount > 0){
    var p14 = 0
    var p24 = 0
    alls = 0
    selectCheck = prompt('Введите код покраски для деталей')
    var conf = 1,4
    switch(selectCheck){
        case "14":
            conf = 1,4
            break;
        case "24":
            conf = 2,4
            break;
        default:
            alert('Выберите 14 или 24')
            break;
    }
    for(var i = 0;i<Model.SelectionCount;i++){
        var Panel = PanelArr[i].AsPanel
        var w1 = Math.round(Panel.ContourWidth)/1000
        var h1 = Math.round(Panel.ContourHeight)/1000
        alls += w1*h1*conf

    }
    alert(alls)

} else {
    alert('Не выделено ни одной панели')
}
