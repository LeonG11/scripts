Model.forEach((obj) => {
	if (obj instanceof TFurnBlock && obj.JointData == "") obj.IsAssemblyUnit = true;
})
Action.Finish();