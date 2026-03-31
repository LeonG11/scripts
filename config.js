//Инициализация кнопок
InitButton = [
  {
    Name: 'UppercaseLetter',
    Description: 'Заглавные буквы в имени панели и блоков',
    GroupType: 'Rename',
  },
  {
    Name: 'SelectDatumBlock',
    Description: 'Выделение фрагментов',
    GroupType: 'Select',
  },
  {
    Name: 'DeleteEmptyFurniture',
    Description: 'Удалить пустые схемы крепежа',
    GroupType: 'Furniture',
  },
  {
    Name: 'ScreenshotModel',
    Description: 'Скриншот модели',
    GroupType: 'Model',
  },
  {
    Name: 'CheckButts',
    Description: 'Проверка кромок',
    GroupType: 'Model',
  },
  {
    Name: 'HideFlow',
    Description: 'Скрыть габ. рамки и линий крепежа',
    GroupType: 'Model',
  },
  {
    Name: 'HideNotVisible',
    Description: 'Скрыть выделение на невидимых',
    GroupType: 'Model',
  },
  {
    Name: 'CounterItems',
    Description: 'Количество выделенных объектов',
    GroupType: 'Model',
  },
  {
    Name: 'AreaPanel',
    Description: 'Внесение площади покраски',
    GroupType: 'Model',
  },
  {
    Name: 'InsertGlobalDim',
    Description: 'Внесение габ.р-р в наз. блока',
    GroupType: 'Select',
  },
  {
    Name: 'SelectFastPanels',
    Description: 'Выделение соед.панелей',
    GroupType: 'Select',
  },
  {
    Name: 'SortStructureModel',
    Description: 'Сортировка структуры модели',
    GroupType: 'Model',
  },
  {
    Name: 'DeleteAssemblyUnit',
    Description: 'Выделить сборочные единицы св-во',
    GroupType: 'Model',
  },
  {
    Name: 'SelectOneNumberDiffName',
    Description: 'Проверка одна поз. разные наим.',
    GroupType: 'Model',
  },
  {
    Name: 'DeleteElastic',
    Description: 'Удалить эластичность',
    GroupType: 'Furniture',
  },
  {
    Name: 'SelectOff',
    Description: 'Выделение об. с выкл. учетом',
    GroupType: 'Select',
  },
  {
    Name: 'SelectDiffName',
    Description: 'Выделение одна поз. разные имена',
    GroupType: 'Select',
  },
  {
    Name: 'SearchPosition',
    Description: 'Выделение по позиции',
    GroupType: 'Select',
  },
  {
    Name: 'SearchOboz',
    Description: 'Выделение по обозначению',
    GroupType: 'Select',
  },
  {
    Name: 'DefaultColor',
    Description: 'Стандартный цвет обьектов',
    GroupType: 'Model',
  },
  {
    Name: 'RotateOrient',
    Description: 'Настроить ориентацию',
    GroupType: 'Model',
  },
  {
    Name: 'DisassemblySelect',
    Description: 'Выделение для взрыв схем',
    GroupType: 'Select',
  },
  {
    Name: 'SelectHandDrilling',
    Description: 'Выделение для РП',
    GroupType: 'Select',
  },
  {
    Name: 'SelectPanelForFactori',
    Description: 'Выделение для чертежей кромки',
    GroupType: 'Select',
  },
  {
    Name: 'AllowanceButts',
    Description: 'Работа с кромкой',
    GroupType: 'Select',
  },
  {
    Name: 'SelectPanelCutName',
    Description: 'Выделение панелей по пазам',
    GroupType: 'Select',
  },
  {
    Name: 'SelectPlastics',
    Description: 'Выделение панелей с обл. пласти',
    GroupType: 'Select',
  },
  {
    Name: 'SelectPanelName',
    Description: 'Выделение панелей содержащих слово',
    GroupType: 'Rename',
  },
  {
    Name: 'RenameWordFromName',
    Description: 'Замена слова в названиях панелей',
    GroupType: 'Rename',
  },
  {
    Name: 'DeleteWordFromName',
    Description: 'Удаление слова в названиях панелей',
    GroupType: 'Rename',
  },
  {
    Name: 'CellSeparator',
    Description: 'Расчет разделителя',
    GroupType: 'Model',
  },
  {
    Name: 'RotationCamera',
    Description: 'Повороты камеры',
    GroupType: 'Model',
  },
  {
    Name: 'DeselectFurniture',
    Description: 'Отменить выделение фурнитуры',
    GroupType: 'Model',
  },
  {
    Name: 'WeightPanel',
    Description: 'Вес выделенных панелей по плотности',
    GroupType: 'Panel',
  },
  {
    Name: 'InfoAreaPanel',
    Description: 'Площадь выделенных панелей',
    GroupType: 'Panel',
  },
  {
    Name: 'PaintPanel',
    Description: 'Площадь покраски и кг.',
    GroupType: 'Panel',
  },
  {
    Name: 'RenameObjectWithArtPos',
    Description: 'Переименовать деталь по Д-№позиции',
    GroupType: 'Rename',
  },
  {
    Name: 'FurnitureHoleSize',
    Description: 'Выделение фурнитуры по размеру отверстия',
    GroupType: 'Furniture',
  },
  {
    Name: 'TechnicalButton',
    Description: 'Режим разработчика',
    GroupType: 'Model',
  },
  {
    Name: 'DuplicateArtPos',
    Description: 'Наим. в позицию',
    GroupType: 'Rename',
  },
  { Name: 'CheckName', Description: 'Проверка под бирку', GroupType: 'Model' },
  {
    Name: 'WarningHideFurniture',
    Description: 'Скрытие фурнитуры',
    GroupType: 'Furniture',
  },
  {
    Name: 'SelectUserProperty',
    Description: 'Выделить все объкты с польз. св-ми',
    GroupType: 'Select',
  },
  {
    Name: 'ExportMetalSpec',
    Description: 'Создать спецификацию металла',
    GroupType: 'Model',
  },
];
TypeGroup = ['Rename', 'Furniture', 'Model', 'Select', 'Panel'];
SignGroup = [
  {
    NameGroup: 'RenameSign',
    Sign: 'Переименование',
  },
  {
    NameGroup: 'FurnitureSign',
    Sign: 'Фурнитура',
  },
  {
    NameGroup: 'ModelSign',
    Sign: 'Модель',
  },
  {
    NameGroup: 'SelectSign',
    Sign: 'Выделение',
  },
  {
    NameGroup: 'PanelSign',
    Sign: 'Панель',
  },
];
// Параметризация окна
WIDTH_BUTTON = 260;
HEIGHT_BUTTON = 30;
WIDTH_ALIGN = 11;
HEIGHT_ALIGN = 10;
WIDTH_FORM =
  TypeGroup.length * WIDTH_BUTTON + (TypeGroup.length + 1) * WIDTH_ALIGN;

//Инициализация кнопок
