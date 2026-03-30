Action.Continue()

var menu = Action.Properties
var Material1 = menu.NewMaterial('Материал')

var arrayMaterial = []
Model.forEachPanel((obj)=>{
    arrayMaterial.push(obj.MaterialName)
})
uniceMat = arrayMaterial.filter((val,id,arr)=>arr.indexOf(val)==id)
alert(uniceMat.length)
var Material1 = menu.NewCombo('Материал',[...uniceMat])

var OK = menu.NewButton('закончить').OnClick = function(){
    Action.Finish()
}
var Start = menu.NewButton('Изменить направление').OnClick = function(){
    UnSelectAll()
    Model.forEachPanel(function(obj){
        if(obj.MaterialName = Material1.Value){
            if(obj.TextureOrientation != TextureOrientation.None){
                obj.TextureOrientation = TextureOrientation.None
            }
        }
    })
}
