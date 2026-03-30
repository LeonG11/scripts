//-- window Кнопка
Bu = { Form : NewForm() };
Props = Bu.Form.Properties;
Bu.Form.Width = 200;
Bu.Form.Height = 100;
Bu.Form.Caption = "БАЗИС-Мебельщик";
Bu.Form.MinHeight = 100;
//-- window Кнопка properties

Bu.Button1 = Props.NewButton("Сделать красиво!");
Bu.Button1.SetLayout(7, 14, 180, 50);
//-- window Кнопка events
Bu.Button1.OnClick = function(){
alert('Ты сделал(а) красиво!')
}
//-- window Кнопка ends
Bu.Form.ShowModal();