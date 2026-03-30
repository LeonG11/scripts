Undo.Changing(Model)
Model.forEach((obj) => {
	if (obj instanceof TFurnBlock && obj.DatumMode == 0) {
		obj.IsAssemblyUnit = true;
	}
	if (obj instanceof TFurnAsm || obj instanceof TDraftBlock) {
		obj.IsAssemblyUnit = true;
	}
})

Model.Build()
Action.Finish(); 