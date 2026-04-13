//Инициализация кнопок
InitButton = [
  {
    Name: 'UppercaseLetter',
    Description: 'Заглавные буквы в имени панели и блоков',
    GroupType: 'Rename',
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
    Name: 'SelectFastPanels',
    Description: 'Выделение соединенных панелей',
    GroupType: 'Select',
  },
  {
    Name: 'DeleteElastic',
    Description: 'Удалить эластичность',
    GroupType: 'Furniture',
  },
  {
    Name: 'SelectOff',
    Description: 'Выделение объектов с выкл. учетом',
    GroupType: 'Select',
  },
  {
    Name: 'SelectOneDesignationDiffName',
    Description: 'Выделение одно обозначение - разные имена',
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
    Description: 'Выделить объекты с пользовательскими св-ми',
    GroupType: 'Select',
  },
  // {
  //   Name: 'ExportMetalSpec',
  //   Description: 'Создать спецификацию металла',
  //   GroupType: 'Model',
  // },
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
