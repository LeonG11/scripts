Undo.Changing(Model)
Model.forEach((obj)=>{
    if(obj instanceof TModelLimits){
        if(obj.Visible = false) obj.Visible = true
        else obj.Visible = false
    }
})