function generateDesignationRange(rangeStr) {
  if (!rangeStr.includes('-')) return [rangeStr];
  const parts = rangeStr.split('-');
  const prefix = parts[0].split('.');
  const lastPart = prefix.pop();
  const startNum = parseInt(lastPart);
  const endNum = parseInt(parts[1]);
  if (isNaN(startNum) || isNaN(endNum)) return [];

  const result = [];
  for (let i = startNum; i <= endNum; i++) {
    const formattedNum = i.toString().padStart(lastPart.length, '0');
    result.push([...prefix, formattedNum].join('.'));
  }
  return result;
}

function generateDesignationRange(rangeStr) {
  if (!rangeStr.includes('-')) return [rangeStr];

  const [prefix, endNumStr] = rangeStr.split('-');
  const parts = prefix.split('.');
  const lastPart = parts.pop();
  const startNum = parseInt(lastPart);
  const endNum = parseInt(endNumStr);

  if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) return [];

  const numLength = lastPart.length;
  const result = [];
  for (let i = startNum; i <= endNum; i++) {
    const formattedNum = i.toString().padStart(numLength, '0');
    result.push([...parts, formattedNum].join('.'));
  }
  return result;
}