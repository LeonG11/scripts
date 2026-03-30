SelectPanel = Model.Selections
var AllW = 0

if(Model.SelectionCount!=0){
    var WPAN = Number(prompt('Введите плотность материала'))
    for(var i = 0;i<Model.SelectionCount;i++){
        var HeightPanel = Math.round(Number(SelectPanel[i].ContourHeight))/1000
        var WidthPanel = Math.round(Number(SelectPanel[i].ContourWidth))/1000
        var ThickPanel = Math.round(Number(SelectPanel[i].Thickness))/1000
        var WPanel = HeightPanel * WidthPanel * ThickPanel*WPAN
        AllW += WPanel

    }
    alert(AllW+' кг вес выделенных панелей')

}
else{
    alert('Не выделено ни одной панели')
}