Model.forEach(function(obj){
    let block = obj instanceof TFurnBlock;
    let layer = obj.Owner instanceof TLayer3D;
    let model = obj.Owner instanceof TModel3D;
    if (block && (layer || model)) {   
        rekurs(obj);
    }
});

function isIt(obj){
    let $ = false;
    if (!(obj instanceof TModelLimits || obj instanceof  TFastener || obj instanceof TFurnBlock)){
        $ = true;
    }
    return $ ;
}

function rekurs (obj){
    //this.obj = obj;
    let blockName = obj.Name;
    let isAssembly = obj.IsAssemblyUnit == true;
    toEachObject(obj)
    
    function toEachObject(obj){
        for(let i=0; i < obj.Count; i++){
               if( obj.Count > 1 && obj instanceof TFurnBlock){
                    toEachObject(obj[i])
                } 
                if(isIt(obj[i])){
                obj[i].UserProperty['CE'] = undefined;
                if(isAssembly){
                    obj[i].UserProperty['CE'] = blockName;
                }
  
            }                       
        }    
    }

}
