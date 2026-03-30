let ModelInspector = NewModelInspector();
let Options = ModelInspector.Options;

Options.ObjIntersectionAnalyze = true;
Options.FastIntersectionAnalyze = true;
Options.PanelNotFixedAnalyze = true;
Options.PanelTooLargeAnalyze = true;

ModelInspector.Run(Model);

let NewStr = '';

let ListError = ModelInspector.ErrorList.List;

alert(ListError.map(n=>n.ErrorType))
