function generateDesignationRange(rangeStr) {
  if (!rangeStr.includes('-')) return [rangeStr];

  const [prefix, endNumStr] = rangeStr.split('-');
  const parts = prefix.split('.');

  // Извлекаем последний компонент из префикса
  const lastPart = parts.pop();
  const startNum = parseInt(lastPart);
  const endNum = parseInt(endNumStr);

  // Проверяем валидность диапазона
  if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
    return [];
  }

  // Определяем длину для форматирования (сохраняем ведущие нули)
  const numLength = lastPart.length;

  const result = [];
  for (let i = startNum; i <= endNum; i++) {
    // Форматируем число с ведущими нулями
    const formattedNum = i.toString().padStart(numLength, '0');
    // Собираем полное обозначение
    result.push([...parts, formattedNum].join('.'));
  }

  return result;
}

alert(
  'Скрипт позволяет выделить панели по введенным обозначениям или диапазону обозначений'
);
UnSelectAll();
let Counter = 0;

const input = prompt(
  'Введите значения через пробел или дефис (например: 01.01.01 02.01.01-03)'
);
if (!input) return;

const CreateElements = input.split(' ');
let Elements = [];

for (let CurrentElem of CreateElements) {
  if (CurrentElem.includes('-')) {
    const rangeElements = generateDesignationRange(CurrentElem);
    if (rangeElements.length > 0) {
      Elements.push(...rangeElements);
    } else {
      alert(`Неверный формат диапазона: ${CurrentElem}`);
    }
  } else {
    // Проверяем валидность отдельного обозначения
    if (/^\d+(\.\d+)*$/.test(CurrentElem)) {
      Elements.push(CurrentElem);
    }
  }
}

const ElementsJoin = {};
if (Elements.length > 0) {
  Model.forEach((objects) => {
    if (
      objects instanceof TExtrusionBody ||
      objects instanceof TFurnPanel ||
      objects instanceof TFurnBlock
    ) {
      if (Elements.includes(objects.Designation)) {
        ElementsJoin[objects.Designation] =
          (ElementsJoin[objects.Designation] || 0) + 1;
        objects.Selected = true;
        Counter++;
      }
    }
  });

  if (Counter > 0) {
    let FinishState = Object.entries(ElementsJoin)
      .map(
        ([designation, count]) =>
          `Обозначение ${designation} - найдено ${count} шт.`
      )
      .join('\n');

    alert(`${FinishState}\n\nОбщее количество панелей - ${Counter}`);
  } else {
    alert(`Не найдено панелей с обозначением(-ями) ${Elements.join(', ')}`);
  }
} else {
  alert('Неверно указаны обозначения панелей');
};
