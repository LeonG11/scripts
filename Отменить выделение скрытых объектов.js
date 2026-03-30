Model.forEach((obj)=>{
    if(!obj.Visible && obj.Selected) obj.Selected = false
})